<script module>
  let minimized = $state(false);
</script>
<script>
  import { onMount } from 'svelte';
  import { app } from '../app.js';
  import Panel from './Panel.svelte';
  import { currentRf } from './uiState.svelte.js';
  import { dialog } from './dialog.svelte.js';
  import CreateRfDialog from './CreateRfDialog.svelte';
    import { readInputFileAsText } from '../utils.js';

  let forestInfo = $derived($currentRf?.info);

  function openRf() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json,.rff';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
      try {
        const data = await readInputFileAsText(file);
        const jsonData = JSON.parse(data);
        app.loadRandomForest(jsonData);
      } catch (err) {
        alert('Error reading or parsing JSON: ' + err);
      } finally {
        document.body.removeChild(input);
      }
    });

    input.click();
  }

  function saveRf() {
    const blob = new Blob([JSON.stringify($currentRf)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = $currentRf.info.model+'.rff';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function createRf() {
    dialog.set({
      component: CreateRfDialog
    });
  }

  function closeRf() {
    app.closeRandomForest();
  }

</script>
<Panel title="Random Forest" minimizeButton={true} bind:minimized={minimized}>
  {#if forestInfo != null}
    <button class="btn btn-primary" onclick={closeRf}>Close</button> <button class="btn btn-primary" onclick={saveRf}>Save</button> 
    <hr/>
  {:else}
    <button class="btn btn-primary" onclick={openRf}>Open</button> <button class="btn btn-primary" onclick={createRf}>Create</button>
  {/if}
  {#if forestInfo != null}
    Name: {forestInfo.model}<br/>
    Accuracy: {(forestInfo.accuracy * 100).toFixed(2)}%<br/>
    Trees Count: {$currentRf.trees.length}
  {/if}
</Panel>