<script>
    import ConfusionMatrixPanel from "./ConfusionMatrixPanel.svelte";
    import EdgePanel from "./EdgePanel.svelte";
    import NodePanel from "./NodePanel.svelte";
    import RandomForestPanel from "./RandomForestPanel.svelte";
    import { selectedEdge, selectedNode, currentRf } from "./uiState.svelte";
    import ViewPanel from "./ViewPanel.svelte";
</script>
<main>
  <RandomForestPanel/>
  {#if $currentRf != null && $currentRf.info.type == 'classification'}
    <ConfusionMatrixPanel/>
  {/if}
  {#if $selectedNode != null}
    <NodePanel/>
  {/if}
  {#if $selectedEdge != null}
    <EdgePanel/>
  {/if}
  <ViewPanel/>
</main>
<style>
  main {
    width: 480px;
    max-height: 100%;
    position: absolute;
    right: 0px;
    top: 0px;
    overflow-y: auto;
    background-color: transparent;
    box-sizing: border-box;
    padding: 10px;

    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
</style>