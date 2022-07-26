import { ApiException } from "./ApiException";

export class PayloadTooLarge extends ApiException {
	constructor(message: string = "Payload Too Large", data?: any) {
		super(message, data);
	}
}
