import { ApiException } from "./ApiException";

export class BadGateway extends ApiException {
	constructor(message: string = "Bad Gateway", data?: any) {
		super(message, data);
	}
}
