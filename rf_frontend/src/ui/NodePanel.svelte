<script module>
  let minimized = $state(false);
</script>
<script>
  import { tooltip } from '@svelte-plugins/tooltips';

  import Panel from './Panel.svelte';
  import { selectedNode } from './uiState.svelte';

</script>
<Panel title="Node" bind:minimized={minimized}>
  {#if $selectedNode.feature != null}
    <b>Feature</b>: {$selectedNode.feature.name}<br/>
    (avg. <u use:tooltip title={$selectedNode.averageFeatureThreshold}>{`<= ${$selectedNode.averageFeatureThreshold.toFixed(6)}`})</u><br/>
  {:else}
    <b>Target/Class</b>: {$selectedNode.target.name}<br/>
  {/if}
    <b>Nodes ({$selectedNode.nodes.length})</b>:<br/>
    <div class="scrollable">
      <div class="list-group">
        {#each $selectedNode.nodes as node}
          <button type="button" class="list-group-item list-group-item-action">
            {#if node.featureThreshold != null}THR: &lt;= <u data-tooltip={node.featureThreshold}>{node.featureThreshold.toFixed(6)}</u>, {/if}
            EID: {node.id}, TNID: {node.treeNodeId}, 
            TUID: {node.tree.uid}</button>
        {/each}
      </div>
    </div>
</Panel>
<style>
  .scrollable {
    max-height: 300px;
    overflow-y: auto;
  }

  [data-tooltip] {
    display: inline;
    position: relative;
  }

  [data-tooltip]:hover::after {
    display: block;
    position: absolute;
    content: attr(data-tooltip);
    border: 1px solid black;
    background: #eee;
    padding: .25em;
    top: -6px;
    left: 100%;
  }
</style>