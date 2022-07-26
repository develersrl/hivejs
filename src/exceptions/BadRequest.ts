import { ApiException } from "./ApiException";

export class BadRequest extends ApiException {
	constructor(message: string = "Bad Request", data?: any) {
		super(message, data);
	}
}
