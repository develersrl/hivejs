import * as React from "react";
import { Honeycomb } from "./honeycombs/honeycomb";
import { deepEqual } from "./utilities";

export class Hive<
	HoneycombsMap extends { [key: string]: Honeycomb<any> },
	HoneycombsStateMap extends { [key in keyof HoneycombsMap]: any }
> {
	private honyecombs: HoneycombsMap;
	private hooks: { [key in keyof HoneycombsMap]: <Result = HoneycombsStateMap[key]>() => Result };

	constructor(honyecombs: HoneycombsMap) {
		this.honyecombs = honyecombs;

		// @ts-ignore
		this.hooks = {};
		Object.keys(honyecombs).forEach(<HoneycombKey extends keyof HoneycombsMap>(key: HoneycombKey) => {
			this.honyecombs[key].setHive(this);
			this.hooks[key] = this.createHook<HoneycombsStateMap[HoneycombKey]>(this.honyecombs[key]);
		});
	}

	public all(): Honeycomb<any>[] {
		return Object.values(this.honyecombs);
	}

	/**
	 * Get Honeycomb
	 *
	 * @template K
	 * @param {K} key
	 * @return {*}  {T[K]}
	 */
	public get<HoneycombKey extends keyof HoneycombsMap>(key: HoneycombKey): HoneycombsMap[HoneycombKey] {
		if (!(key in this.honyecombs)) throw new Error(`Honeycomb '${key}' not found`);

		return this.honyecombs[key];
	}

	/**
	 * get hook created for honeycomb with key `key`
	 *
	 * @template HoneycombKey
	 * @param {HoneycombKey} key
	 * @return {*}  {G[K]}
	 */
	public hook<HoneycombKey extends keyof HoneycombsMap>(
		key: HoneycombKey
	): <ExpectedResult = HoneycombsStateMap[HoneycombKey]>(
		fn?: (item: HoneycombsStateMap[HoneycombKey]) => ExpectedResult,
		...hookDependencies: any
	) => ExpectedResult {
		if (!(key in this.hooks)) throw new Error(`Hook '${key}' not found`);

		return this.hooks[key];
	}

	/**
	 * Create hook for honeycomb with key `key`
	 *
	 * @private
	 * @template T
	 * @param {Honeycomb<T>} honeycomb
	 * @return {*}  {() => T}
	 */
	private createHook<T>(honeycomb: Honeycomb<T>): () => T {
		return function (fn?: (item: T) => any, ...hookDependencies: any): T {
			const [data, setData] = React.useState<T>(fn ? fn(honeycomb.copyState()) : honeycomb.copyState());

			React.useEffect(() => {
				const unsubscribe = honeycomb.subscribe(updated => {
					if (fn) {
						updated = fn(updated);
						if (deepEqual(data, updated)) return;
					}

					setData(updated);
				});

				return unsubscribe;
			}, (fn ? [data, fn] : []).concat(hookDependencies));

			return data;
		};
	}
}
