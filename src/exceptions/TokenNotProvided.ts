import { ApiException } from "./ApiException";

export class TokenNotProvided extends ApiException {
	constructor(message: string = "Token not provided.") {
		super(message);
	}
}
