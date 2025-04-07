<script module>
  let minimized = $state(false);
</script>
<script>
  import { onMount } from 'svelte';
  import { app } from '../app.js';
  import Panel from './Panel.svelte';
  import { currentRf } from './uiState.svelte.js';

  let forestInfo = $derived($currentRf?.info);
  let targets = $derived($currentRf?.targets);

  let classLabels = $derived(targets?.map(f => f.name) ?? []);

</script>
<Panel title="Confusion Matrix" minimizeButton={true} bind:minimized={minimized}>
  {#if forestInfo?.confusionMatrix}
    <table class="confusion-table">
      <thead>
        <tr>
          <th>Actual / Predicted</th>
          {#each classLabels as label}
            <th>{label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each forestInfo.confusionMatrix as row, i}
          <tr>
            <td><strong>{classLabels[i]}</strong></td>
            {#each row as cell}
              <td>{cell}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No confusion matrix available.</p>
  {/if}
</Panel>

<style>
  .confusion-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
  }

  .confusion-table th,
  .confusion-table td {
    border: 1px solid #ddd;
    padding: 6px 10px;
    text-align: center;
  }

  .confusion-table th {
    background-color: #f7f7f7;
  }

  .confusion-table td {
    background-color: #fff;
  }

  .confusion-table tr:nth-child(even) td {
    background-color: #fafafa;
  }
</style>