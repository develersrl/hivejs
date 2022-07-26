import { Hive } from "../src/hive";
import { Honeycomb } from "../src/honeycombs/honeycomb";
interface Store {
	tick: number;
}

class StoreHoneycomb extends Honeycomb<Store> {
	constructor() {
		super({
			tick: 0,
		});
	}

	update() {
		const prevState = this.getState();

		this.dispatch({
			tick: prevState.tick + 1,
		});
	}
}

let store: StoreHoneycomb | null = null;
let storeSubscriptionsCount = 0;
let storeSubscriptionsUpdate = 0;

beforeAll(() => {
	const hive = new Hive({
		store: new StoreHoneycomb(),
	});

	store = hive.get("store");

	store.subscribe((newState, prevState) => {
		storeSubscriptionsCount++;
		storeSubscriptionsUpdate = newState.tick + prevState.tick; // 1 + 0, 2 + 1, 3 + 2
	}, false /** not call subscribe function immediately */);

	store.update();
	store.update();
	store.update();
});

test("subscription", () => {
	expect(storeSubscriptionsCount).toBe(3);
	expect(storeSubscriptionsUpdate).toBe(5);
	expect(store!.getState().tick).toBe(3);
});
