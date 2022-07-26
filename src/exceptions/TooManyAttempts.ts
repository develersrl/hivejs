import { ApiException } from "./ApiException";

export class TooManyAttempts extends ApiException {
	constructor(message: string = "Too many attempts.", data?: any) {
		super(message, data);
	}
}
