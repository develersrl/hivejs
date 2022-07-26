import { ApiException } from "./ApiException";

export class MethodNotAllowed extends ApiException {
	constructor(message: string = "Method Not Allowed", data?: any) {
		super(message, data);
	}
}
