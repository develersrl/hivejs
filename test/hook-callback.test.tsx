import React from "react";
import renderer from "react-test-renderer";
import { Hive } from "../src/hive";
import { Honeycomb } from "../src/honeycombs/honeycomb";

// The definition of hive and honeycombs is found at the bottom of this file

const TestApp = () => {
	// custom callback, tick is typized because hive is typized (line 43)
	const tick = hive.hook("store")(({ tick }) => tick);

	return <span>{tick}</span>;
};

test("Test simple-hook", () => {
	const component = renderer.create(<TestApp />);

	expect(component.root.findByType("span").props.children).toBe(0);

	// Call update at external of the component
	hive.get("store").update();
	hive.get("store").update();
	hive.get("store").update();

	// Refresh component
	component.update(<TestApp />);

	// Run test
	expect(component.root.findByType("span").props.children).toBe(3);
});

//

class StoreHoneycomb extends Honeycomb<{
	tick: number;
}> {
	update() {
		const prevState = this.getState();
		this.dispatch({ ...prevState, tick: prevState.tick + 1 });
	}
}

const honeycombs = {
	store: new StoreHoneycomb({ tick: 0 }),
};
const hive = new Hive<
	typeof honeycombs,
	{
		store: { tick: number };
	}
>(honeycombs);
