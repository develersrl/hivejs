import { ApiException } from "./ApiException";

export class Forbidden extends ApiException {
	constructor(message: string = "Forbidden", data?: any) {
		super(message, data);
	}
}
