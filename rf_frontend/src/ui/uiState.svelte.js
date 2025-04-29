import { CTEdge, CTNode } from "rf_shared";
import { writable } from "svelte/store";

export let currentRf = writable(null);

/** @type {import("svelte/store").Writable<CTNode>} */
export let selectedNode = writable(null);
/** @type {import("svelte/store").Writable<CTEdge>} */
export let selectedEdge = writable(null);

/** @type {import("svelte/store").Writable<CTree>} */
export let selectedCTree = writable(null);

/** @type {import("svelte/store").Writable<CTree>} */
export let currentCTree = writable(null);

export let viewSettings = writable({
  hideEdgesToLeaves: false,
  edgesWithinScoreMin: null,
  edgesWithinScoreMax: null,
  edgesToLeavesWithinLayersMin: null,
  edgesToLeavesWithinLayersMax: null,
  nodeToNodeColor: '#ffb347',
  nodeToLeafColor: '#800080',
  nodeColor: '#7ba7cc',
  leafColor: '#98fb98',
});

export function resetViewSettings() {
  viewSettings.set({
    hideEdgesToLeaves: false,
    edgesWithinScoreMin: null,
    edgesWithinScoreMax: null,
    edgesToLeavesWithinLayersMin: null,
    edgesToLeavesWithinLayersMax: null,
    nodeToNodeColor: '#ffb347',
    nodeToLeafColor: '#800080',
    nodeColor: '#7ba7cc',
    leafColor: '#98fb98',
  });
}

export function clearViewSettings() {
  viewSettings.update(settings => {
    return {
      ...settings,
      hideEdgesToLeaves: false,
      edgesWithinScoreMin: null,
      edgesWithinScoreMax: null,
      edgesToLeavesWithinLayersMin: null,
      edgesToLeavesWithinLayersMax: null,
    };
  });
}
