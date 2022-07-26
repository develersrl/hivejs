import { ApiException } from "./ApiException";

export class UnprocessableEntity extends ApiException {
	constructor(message: string = "Unprocessable entity.", data?: any) {
		super(message, data);
	}
}
