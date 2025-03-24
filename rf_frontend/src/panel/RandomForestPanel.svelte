<script>
  import { onMount } from 'svelte';
  import { app } from '../app.js';
  import Panel from './Panel.svelte';

  let forestInfo = {};

  function handleUpdate(event) {
    console.log(app);
    forestInfo = app.getRandomForest()?.info;
  }

  onMount(() => {
    handleUpdate();
    window.addEventListener('updateUI', handleUpdate);
    return () => window.removeEventListener('updateUI', handleUpdate);
  });
</script>
<Panel title="Random Forest" minimizeButton={true}>
  {#if forestInfo != null}
    Name: {forestInfo.model}<br/>
    Accuracy: {(forestInfo.accuracy * 100).toFixed(2)}%
  {/if}
</Panel>