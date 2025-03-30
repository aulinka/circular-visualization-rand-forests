<script module>
  let minimized = $state(false);
</script>
<script>
  import Panel from './Panel.svelte';
  import { selectedNode } from './uiState.svelte';

</script>
<Panel title="Node" bind:minimized={minimized}>
  {#if $selectedNode.feature != null}
    <b>Feature</b>: {$selectedNode.feature.name}<br/>(avg. {`<= ${$selectedNode.averageFeatureThreshold.toFixed(6)}`})<br/>
  {:else}
    <b>Target/Class</b>: {$selectedNode.target.name}<br/>
  {/if}
    <b>Nodes ({$selectedNode.nodes.length})</b>:<br/>
    <div class="scrollable">
      <div class="list-group">
        {#each $selectedNode.nodes as node}
          <button type="button" class="list-group-item list-group-item-action">
            {#if node.featureThreshold != null}THR: &lt;= {node.featureThreshold.toFixed(6)}, {/if}
            NID: {node.id}, TNID: {node.treeNodeId}, 
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
</style>