import { ApiException } from "./ApiException";

export class Unauthorized extends ApiException {
	constructor(message: string = "Not authenticated.", data?: any) {
		super(message, data);
	}
}
