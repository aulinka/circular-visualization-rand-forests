<script>
    import EdgePanel from "./EdgePanel.svelte";
    import NodePanel from "./NodePanel.svelte";
    import RandomForestPanel from "./RandomForestPanel.svelte";
    import { selectedEdge, selectedNode } from "./uiState.svelte";
    import ViewPanel from "./ViewPanel.svelte";
</script>
<main>
  <RandomForestPanel/>
  <ViewPanel/>
  {#if $selectedNode != null}
    <NodePanel/>
  {/if}
  {#if $selectedEdge != null}
    <EdgePanel/>
  {/if}
</main>
<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
</style>