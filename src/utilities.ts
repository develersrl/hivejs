/**
 * Check object equality
 *
 * @export
 * @param {*} a
 * @param {*} b
 * @return {*}  {boolean}
 */
export function deepEqual(a: any, b: any): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Clone object
 *
 * @export
 * @param {*} entry
 * @return {*}  a copy of `entry`
 */
export function clone(entry: any): any {
	return JSON.parse(JSON.stringify(entry));
}

/**
 * Encode string to query string
 *
 * @export
 * @param {string} val
 * @return {*}
 */
export function encode(val: string) {
	return encodeURIComponent(val)
		.replace(/%40/gi, "@")
		.replace(/%3A/gi, ":")
		.replace(/%24/g, "$")
		.replace(/%2C/gi, ",")
		.replace(/%20/g, "+")
		.replace(/%5B/gi, "[")
		.replace(/%5D/gi, "]");
}

/**
 * Transform object or array to string for query string `?key=val&...`
 * If value is array, transform to `key[]=val1&key[]=val2&...`
 *
 * @export
 * @param {(Array<any> | object)} [data]
 * @return {string}  {string}
 */
export function paramsSerializer(data?: Array<any> | object): string {
	if (!data) return "";

	const parts: Array<string> = [];
	const keys = data instanceof Object ? Object.keys(data) : data;
	for (let key of keys) {
		let val = (data as any)[key];

		if (val === null || typeof val === "undefined" || (Array.isArray(val) && val.length === 0)) continue;

		if (!Array.isArray(val) || val.length === 1)
			parts.push(encode(key) + "=" + encode(valueToString(Array.isArray(val) ? val[0] : val)));
		else
			val.forEach((v: any, index: number) => {
				parts.push(encode(`${key}[]`) + "=" + encode(valueToString(v)));
			});
	}

	return "?" + parts.join("&");
}

/**
 * convert data to string
 *
 * @internal
 * @param {*} value
 * @return {*}  {string}
 */
function valueToString(value: any): string {
	return value.constructor.name === "Object" ? JSON.stringify(value) : value + "";
}

/**
 * Check whether the url parameter is an absolute url
 *
 * @export
 * @param {string} url
 * @return {*}  {boolean}
 */
const ABSOLUTE_URL_REGEXP = new RegExp("^(?:[a-z]+:)?//", "i");
export function isAbsoluteURL(url: string): boolean {
	return ABSOLUTE_URL_REGEXP.test(url);
}
