import { ApiException } from "./ApiException";

export class Locked extends ApiException {
	constructor(message: string = "Locked", data?: any) {
		super(message, data);
	}
}
