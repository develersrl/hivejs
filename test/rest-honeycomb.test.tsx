import { RequestInit } from "node-fetch";
import { Hive, RESTHoneycomb } from "../src";

// The mock server (fetch) and definition of hive and honeycombs is found at the bottom of this file

test("rest pollen", async () => {
	const rest = new RESTHoneycomb("testKey", [], "http://localhost:8080/api/my-rest-honeycomb");

	rest.setEndpoint("http://localhost:8080/api/v2/my-rest-honeycomb");

	expect(rest.getPollen().getBaseURL().toString()).toBe("http://localhost:8080/api/v2/my-rest-honeycomb");
});

test("rest server call", async () => {
	const storeHB = hive.get("store");

	// Get all data from server
	const store = await storeHB.all();
	expect(store).toStrictEqual(STORE_DB);

	// get Object with more information with id = 1
	await storeHB.get(1);
	expect(storeHB.getState().find(store => store.id === 1)).toStrictEqual({
		id: 1,
		data: ["serverOtherData1", "serverOtherData2"],
	});

	// Update object with id = 2, the mock server add a property "updated" = true
	await storeHB.update({ id: 2 });
	expect(storeHB.getState().find(store => store.id === 2)?.updated).toBe(true);

	// Delete object with id = 2
	await storeHB.delete(2);
	expect(storeHB.getState().find(store => store.id === 2)).toBe(undefined);

	// Create new element
	await storeHB.create({ id: 10, data: "customData" });
	expect(storeHB.getState().find(store => store.id === 10)).toStrictEqual({ id: 10, data: "customData" });
});

interface Store {
	id: number;
	updated?: boolean;
	data?: any;
}

class StoreHoneycomb extends RESTHoneycomb<Store> {
	constructor() {
		super("id", [], "http://127.0.0.1/");
	}
}

// Bind Honeycomb to hive
const honeycombs = {
	store: new StoreHoneycomb(),
};

const hive = new Hive<
	typeof honeycombs,
	{
		store: typeof STORE_DB;
	}
>(honeycombs);

/**
 * Mock server
 */

const STORE_DB: Store[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
jest.mock(`node-fetch`, () => {
	let storeDB: Store[] = JSON.parse(JSON.stringify(STORE_DB));

	const defaultHeaders: Record<string, string> = {
		"Content-Type": "application/json",
	};

	function resolveREST(uri: string, method: string, body: any) {
		const generateResponse = (data: any) =>
			Promise.resolve({
				ok: true,
				status: 200,
				headers: {
					get: (key: string): string | undefined => defaultHeaders[key],
				},
				json: () => Promise.resolve(data),
			});

		const hasParamID = uri.match(/^\/(\d+)$/);
		const paramID = hasParamID ? parseInt(hasParamID[1]) : undefined;

		// REST API
		switch (true) {
			case method === "GET" && uri === "/":
				return generateResponse(storeDB);
			case method === "POST" && uri === "/": {
				storeDB.push(body);
				return generateResponse(body);
			}
			case method === "GET" && hasParamID !== null: {
				const item = storeDB.find(s => s.id === paramID);
				return generateResponse({ ...item, data: ["serverOtherData1", "serverOtherData2"] });
			}
			case method === "PUT" && hasParamID !== null: {
				const updated = { ...body, updated: true };
				storeDB = storeDB.map(s => (s.id === paramID ? updated : s));
				return generateResponse(updated);
			}
			case method === "DELETE" && hasParamID !== null: {
				storeDB = storeDB.filter(s => s.id !== paramID);
				return generateResponse(storeDB);
			}
		}
	}

	const fn = jest.fn((p: RequestInfo, c: RequestInit) => {
		const uri = new URL(p.toString()).pathname;

		// REST endpoint
		return resolveREST(uri, c.method as string, c.body ? JSON.parse(c.body as string) : undefined);
	});

	// Bind Headers class to mock 'node-fetch'
	// @ts-ignore
	fn.Headers = jest.requireActual("node-fetch").Headers;

	return fn;
});
