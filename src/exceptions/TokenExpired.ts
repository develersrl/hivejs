import { ApiException } from "./ApiException";

export class TokenExpired extends ApiException {
	constructor(message: string = "Token is expired.") {
		super(message);
	}
}
