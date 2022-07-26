import { Headers } from "node-fetch";
import { Pollen } from "../src/pollen";

test("pollen baseURL", () => {
	const pollen = new Pollen(
		"http://localhost:8080/api/v1",
		new Headers({
			"My-Custom-Header": "My-Custom-Value",
		})
	);

	const url = pollen.getBaseURL();

	expect(url.pathname).toBe("/api/v1");
	expect(url.hostname).toBe("localhost");
	expect(url.port).toBe("8080");
	expect(pollen.getHeaders().has("My-Custom-Header")).toBe(true);
});
