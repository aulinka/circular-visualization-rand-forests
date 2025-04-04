<script module>
  let minimized = $state(false);
</script>
<script>
  import { onMount } from 'svelte';
  import { app } from '../app.js';
  import Panel from './Panel.svelte';
  import { currentRf } from './uiState.svelte.js';

  let forestInfo = $derived($currentRf?.info);

</script>
<Panel title="Random Forest" minimizeButton={true} bind:minimized={minimized}>
  {#if forestInfo != null}
    Name: {forestInfo.model}<br/>
    Accuracy: {(forestInfo.accuracy * 100).toFixed(2)}%<br/>
    Trees Count: {$currentRf.trees.length}
  {/if}
</Panel>