<script module>
  let minimized = $state(false);
</script>
<script>
  import Panel from './Panel.svelte';
  import { selectedEdge } from './uiState.svelte';

</script>
<Panel title="Edge" bind:minimized={minimized}>
  <b>Score</b>: {$selectedEdge.score}<br/>
</Panel>