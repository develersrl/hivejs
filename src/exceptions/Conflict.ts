import { ApiException } from "./ApiException";

export class Conflict extends ApiException {
	constructor(message: string = "Conflict", data?: any) {
		super(message, data);
	}
}
