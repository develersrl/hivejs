import { ApiException } from "./ApiException";

export class NotFound extends ApiException {
	constructor(message: string = "Not Found.", data?: any) {
		super(message, data);
	}
}
