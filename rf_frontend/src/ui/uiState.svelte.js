import { CTEdge, CTNode } from "rf_shared";
import { writable } from "svelte/store";

export let currentRf = writable(null);

/** @type {import("svelte/store").Writable<CTNode>} */
export let selectedNode = writable(null);
/** @type {import("svelte/store").Writable<CTEdge>} */
export let selectedEdge = writable(null);

export let viewSettings = writable({
  hideEdgesToLeaves: false,
  edgesWithinScore: {
    min: null, max: null,
  },
  edgesToLeavesWithinLayers: {
    min: null, max: null,
  },
  nodeToNodeColor: '#ffb347',
  nodeToLeafColor: '#800080',
});

export function resetViewSettings() {
  viewSettings.set({
    hideEdgesToLeaves: false,
    edgesWithinScore: {
      min: null, max: null,
    },
    edgesToLeavesWithinLayers: {
      min: null, max: null,
    },
    nodeToNodeColor: '#ffb347',
    nodeToLeafColor: '#800080',
  });
}