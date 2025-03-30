import { CTEdge, CTNode } from "rf_shared";
import { writable } from "svelte/store";

export let currentRf = writable(null);

/** @type {import("svelte/store").Writable<CTNode>} */
export let selectedNode = writable(null);
/** @type {import("svelte/store").Writable<CTEdge>} */
export let selectedEdge = writable(null);