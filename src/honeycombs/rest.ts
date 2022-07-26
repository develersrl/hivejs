import { Headers } from "node-fetch";
import { Pollen } from "../pollen";
import { Honeycomb } from "./honeycomb";

export interface Model {}

export class RESTHoneycomb<DataType extends Model = Model> extends Honeycomb<DataType[]> {
	/**
	 * The pollen instance used to communicate with the server.
	 *
	 * @protected
	 * @type {Pollen}
	 */
	protected pollen: Pollen;

	/**
	 * Key of remote model
	 *
	 * @private
	 * @type {keyof DataType}
	 */
	private idKey: keyof DataType;

	/**
	 * Default headers to send with every request
	 *
	 * @private
	 * @static
	 */
	private static DEFAULT_HEADERS = new Headers({ "Content-Type": "application/json" });

	constructor(
		idKey: keyof DataType,
		defaultState: DataType[],
		endpoint: string,
		headers = RESTHoneycomb.DEFAULT_HEADERS
	) {
		super(defaultState);

		this.idKey = idKey;

		this.pollen = new Pollen(endpoint, headers);
	}

	////////////////////////////////////////////////////////////////////////////

	/**
	 * Set the key of remote model
	 *
	 * @param {keyof DataType} key
	 */
	public setIdKey(key: keyof DataType): void {
		this.idKey = key;
	}

	/**
	 * Get the pollen instance used to communicate with the server.
	 *
	 * @return {*}  {Pollen}
	 */
	public getPollen(): Pollen {
		return this.pollen;
	}

	/**
	 * Set REST endpoint
	 *
	 * @param {string} baseURL
	 */
	public setEndpoint(endpoint: string): void {
		this.pollen.setBaseURL(endpoint);
	}

	/**
	 * Set request Header
	 *
	 * @param {string} key
	 * @param {(string | undefined | null)} value
	 */
	public setHeader(key: string, value: string | undefined | null): void {
		this.pollen.setHeader(key, value);
	}

	////////////////////////////////////////////////////////////////////////////

	// REST get /
	// get all items and dispatch state
	public all(...arg: any): Promise<DataType[]> {
		return this.pollen.get<DataType[]>("/").then(this.dispatch).then(this.copyState);
	}

	// REST get /id
	// get item with id `id`
	public get(id: string | number): Promise<DataType> {
		return this.pollen.get<DataType>(`/${id}`).then(model => {
			let state = this.copyState();
			let found = false;

			state = state.map(item => {
				const modelId = item[this.idKey] as any;
				if (modelId === id) {
					found = true;

					return model;
				}

				return item;
			});

			if (!found) {
				state.push(model);
			}

			this.dispatch(state);
			return model;
		});
	}

	// REST post /
	// create new item
	public create(data: Partial<DataType>): Promise<DataType> {
		const promise = this.pollen.post<DataType>(`/`, data);

		promise.then<DataType>((newItem: DataType) => {
			const state = this.copyState();
			state.push(newItem);
			this.dispatch(state);
			return newItem;
		});

		return promise;
	}

	// REST put /id
	// update item with id `id`
	public update(data: DataType): Promise<DataType> {
		const promise = this.pollen.put<DataType>(`/${data[this.idKey]}`, data);

		promise.then<DataType>((updatedItem: DataType) => {
			const state = this.copyState();
			this.dispatch(state.map(item => (item[this.idKey] === updatedItem[this.idKey] ? updatedItem : item)));
			return updatedItem;
		});

		return promise;
	}

	// REST delete /id
	// delete item with id `id`
	public delete(id: string | number): Promise<void> {
		const promise: Promise<void> = this.pollen.delete(`/${id}`);

		promise.then(() => {
			const state = this.copyState();
			this.dispatch(state.filter(item => (item[this.idKey] as any) !== id));
		});

		return promise;
	}
}
