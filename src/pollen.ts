import FormData from "form-data";
import fetch, { Headers } from "node-fetch";
import {
	ApiException,
	BadGateway,
	BadRequest,
	Conflict,
	Forbidden,
	Locked,
	MethodNotAllowed,
	NotFound,
	PayloadTooLarge,
	TooManyAttempts,
	Unauthorized,
	UnavailableForLegalReasons,
	UnprocessableEntity,
} from "./exceptions";
import { isAbsoluteURL, paramsSerializer } from "./utilities";

export type RequestMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

export interface PollenRequest {
	/**
	 * Request method
	 */
	method: RequestMethod;

	/**
	 * Request path (baseURL + path)
	 */
	path: string;

	/**
	 * Request headers (baseURL + path)
	 */
	headers?: Headers;

	/**
	 * Request body
	 */
	body?: any;

	/**
	 * fetch cache
	 * https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
	 */
	cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
}

export class Pollen {
	/**
	 * base URL of request
	 *
	 * @private
	 */
	private baseURL: URL;

	/**
	 * header to be used in all requests
	 *
	 * @private
	 */
	private headers: Headers;

	/**
	 * @param {string} baseURL
	 */
	constructor(baseURL: string, headers: Headers = new Headers()) {
		this.baseURL = new URL(baseURL);
		this.headers = headers;
	}

	/**
	 * @param {string} baseURL
	 */
	public setBaseURL(baseURL: string) {
		this.baseURL = new URL(baseURL);
	}

	public getBaseURL(): URL {
		return this.baseURL;
	}

	/**
	 * @param {Headers} headers
	 */
	public setHeaders(headers: Headers) {
		this.headers = new Headers(headers);
	}

	public getHeaders(): Headers {
		return this.headers;
	}

	/**
	 * @param {Headers} headers
	 */
	public setHeader(key: string, value: string | undefined | null) {
		if (typeof value === "undefined" || value === null) {
			this.headers.delete(key);
		} else {
			this.headers.set(key, value);
		}
	}

	/**
	 * Throw exception based on response status for cliente interception
	 *
	 * @private
	 * @param {any} error
	 * @memberof Request
	 */
	private responseInterceptorExceptionHandler(status: number, statusText: string, data: any) {
		switch (status) {
			case 400:
				return new BadRequest(statusText, data);
			case 401:
				return new Unauthorized(statusText, data);
			case 403:
				return new Forbidden(statusText, data);
			case 404:
				return new NotFound(statusText, data);
			case 405:
				return new MethodNotAllowed(statusText, data);
			case 409:
				return new Conflict(statusText, data);
			case 413:
				return new PayloadTooLarge(statusText, data);
			case 422:
				return new UnprocessableEntity(statusText, data);
			case 423:
				return new Locked(statusText, data);
			case 429:
				return new TooManyAttempts(statusText, data);
			case 451:
				return new UnavailableForLegalReasons(statusText, data);
			case 502:
				return new BadGateway(statusText, data);
			default:
				return new ApiException(statusText, data);
		}
	}

	/**
	 * Generic Request
	 *
	 * @template T
	 * @param {PollenRequest} config
	 * @return {*}  {Promise<T>}
	 */
	public async request<T>(config: PollenRequest): Promise<T> {
		const endpoint = new URL(
			isAbsoluteURL(config.path) ? config.path : this.baseURL.toString() + config.path
		).toString();
		const cleanUrl = endpoint.replace(/([^:])(\/\/+)/g, "$1/");
		const headers = new Headers(config.headers);
		this.headers.forEach((v, k) => headers.set(k, v));

		if (typeof config.body === "undefined" || config.body instanceof FormData) {
			headers.delete("Content-Type");
		} else {
			headers.set("Content-Type", "application/json");
		}

		const request = fetch(cleanUrl, {
			method: config.method,
			headers,
			body: config.body,
		});

		const response = await request;

		let data = null;
		const contentType = response.headers.get("Content-Type") || "";

		if (contentType.includes("application/json")) {
			data = await response.json();
		} else if (contentType.includes("text/html")) {
			data = await response.text();
		}

		if (response.ok) {
			return data as T;
		}

		throw this.responseInterceptorExceptionHandler(response.status, response.statusText, data);
	}

	/**
	 * GET
	 *
	 * @template T
	 * @param {string} path
	 * @param {Object} [data]
	 * @return {*}  {Promise<T>}
	 */
	public get<T>(path: string, data?: Object): Promise<T> {
		return this.request<T>({
			path: path + paramsSerializer(data),
			method: "GET",
		});
	}

	/**
	 * POST
	 *
	 * @template T
	 * @param {string} path
	 * @param {(Object | FormData)} [data]
	 * @return {*}  {Promise<T>}
	 */
	public post<T>(path: string, data?: Object | FormData): Promise<T> {
		const headers = new Headers(this.headers);

		return this.request<T>({
			path,
			method: "POST",
			headers,
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	}

	/**
	 * DELETE
	 *
	 * @template T
	 * @param {string} path
	 * @return {*}  {Promise<T>}
	 */
	public delete<T>(path: string): Promise<T> {
		return this.request<T>({
			path,
			method: "DELETE",
		});
	}

	/**
	 * PUT
	 *
	 * @template T
	 * @param {string} path
	 * @param {Object} [data]
	 * @return {*}  {Promise<T>}
	 */
	public put<T>(path: string, data?: Object): Promise<T> {
		const headers = new Headers(this.headers);

		let method: RequestMethod = "PUT";

		if (data instanceof FormData) {
			headers.delete("Content-Type");
			data.append("_method", "PUT");
			method = "POST";
		}

		return this.request<T>({
			path,
			method,
			headers: headers,
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	}

	/**
	 * PATCH
	 *
	 * @template T
	 * @param {string} path
	 * @param {Object} [data]
	 * @return {*}  {(Promise<T | undefined>)}
	 */
	public patch<T>(path: string, data?: Object): Promise<T> {
		const headers = new Headers(this.headers);

		if (typeof data === "undefined" || data instanceof FormData) headers.delete("Content-Type");
		else headers.set("Content-Type", "application/json");

		return this.request<T>({
			path,
			method: "PATCH",
			headers: headers,
			body: data instanceof FormData ? data : JSON.stringify(data),
		});
	}
}
