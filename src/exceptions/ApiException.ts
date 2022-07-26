/**
 *
 * @export
 * @class ApiException
 * @extends {Error}
 */
export class ApiException extends Error {
	/**
	 * Dati della risposta http
	 *
	 * @private
	 * @type {*}
	 * @memberof ApiException
	 */
	public data: any;

	/**
	 *
	 *
	 * @param {string} message
	 * @param {*} [data]
	 * @memberof ApiException
	 */
	constructor(message: string, data?: any) {
		super(message);

		this.data = data;
	}

	/**
	 * Ritorna i dati della risposta http
	 *
	 * @returns {*}
	 * @memberof ApiException
	 */
	public getData(): any {
		return this.data;
	}
}
