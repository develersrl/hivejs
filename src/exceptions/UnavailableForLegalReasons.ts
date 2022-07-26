import { ApiException } from "./ApiException";

export class UnavailableForLegalReasons extends ApiException {
	constructor(message: string = "Unavailable For Legal Reasons.", data?: any) {
		super(message, data);
	}
}
