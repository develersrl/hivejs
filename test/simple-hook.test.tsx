import React from "react";
import renderer from "react-test-renderer";
import { Hive } from "../src/hive";
import { Honeycomb } from "../src/honeycombs/honeycomb";

// The definition of hive and honeycombs is found at the bottom of this file

const TestApp = () => {
	// tick is not tipyzed (see line 49)
	const tick = hive.hook("tick")();

	function update() {
		hive.get("tick").update();
	}

	return (
		<React.Fragment>
			<span>{tick}</span>
			<button onClick={update}>update</button>
		</React.Fragment>
	);
};

test("Test simple-hook", () => {
	const component = renderer.create(<TestApp />);

	expect(component.root.findByType("span").props.children).toBe(0);

	// Call update
	component.root.findByType("button").props.onClick();
	component.root.findByType("button").props.onClick();
	component.root.findByType("button").props.onClick();

	// Refresh component
	component.update(<TestApp />);

	// Run test
	expect(component.root.findByType("span").props.children).toBe(3);
});

//

class TickHoneycomb extends Honeycomb<number> {
	update() {
		this.dispatch(this.getState() + 1);
	}
}

// If types are not passed, only honeycombs will be typed and not states
const hive = new Hive({
	tick: new TickHoneycomb(0),
});
