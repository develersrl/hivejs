import { Hive } from "../hive";
import { clone, deepEqual } from "../utilities";

export class Honeycomb<DataType> {
	/**
	 * The object to comunicate with other Honeycomb
	 *
	 * @protected
	 * @type {Hive}
	 */
	protected hive!: Hive<{ [key: string]: Honeycomb<any> }, { [key: string]: any }>;

	/**
	 * Current Honeycomb state
	 *
	 * @protected
	 * @type {DataType}
	 */
	protected state: DataType;

	/**
	 * Callback to listen state changes
	 *
	 * @private
	 */
	private subscribers: ((state: DataType, prevState: DataType) => void)[] = [];

	constructor(defaultState: DataType) {
		this.state = defaultState;

		this.dispatch = this.dispatch.bind(this);
		this.copyState = this.copyState.bind(this);
	}

	/**
	 * hive is a container of all honeycombs.
	 * you can access to this property to dispach other honeycombs state changes
	 *
	 * @param {Hive<any, any>} hive
	 */
	public setHive(hive: Hive<any, any>) {
		this.hive = hive;
	}

	/**
	 * Attach a callback to listen state changes
	 *
	 * @param {(state: DataType) => void} subscriber
	 * @param {boolean} callImmediately if true, the callback will be called immediately with the current state
	 * @return {*}  {() => void} remove subscriber
	 */
	public subscribe(subscriber: (state: DataType, prevState: DataType) => void, callImmediately = true): () => void {
		this.subscribers.push(subscriber);

		const currentState = this.copyState();
		callImmediately && subscriber(currentState, currentState);

		return () => this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
	}

	/**
	 * Dispatch a state change if the new state is different from the current state.
	 * When dispatch, the subscribers will be called.
	 *
	 * @param {DataType} newState
	 * @return {*}  {DataType}
	 */
	public dispatch(newState: DataType): DataType {
		const oldState = this.state;

		if (!deepEqual(newState, oldState)) {
			this.state = newState;
			this.subscribers.forEach(subscriber => subscriber(this.copyState(), oldState));
		}

		return this.state;
	}

	/**
	 * Return a deep copy of the current state
	 *
	 * @public
	 * @return {*}  {DataType}
	 */
	public copyState(): DataType {
		return clone(this.state);
	}

	/**
	 * Return a reference of the current state
	 *
	 * @return {*}  {DataType}
	 */
	public getState(): DataType {
		return this.state;
	}
}
