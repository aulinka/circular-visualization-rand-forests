<script module>
  let minimized = $state(false);
</script>
<script>
  import { stage } from '../stage';

  import Panel from './Panel.svelte';

  async function screenshot(ratio) {
    const blob = await stage.toBlob({
      pixelRatio: ratio,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'stage.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

</script>
<Panel title="View" bind:minimized={minimized}>
  <div class="btn-group" role="group" aria-label="Screenshot">
    <button onclick={() => screenshot(1)} type="button" class="btn btn-primary">Screenshot</button>
    <button onclick={() => screenshot(2)} type="button" class="btn btn-primary">2x</button>
    <button onclick={() => screenshot(4)} type="button" class="btn btn-primary">4x</button>
    <button onclick={() => screenshot(8)} type="button" class="btn btn-primary">8x</button>
  </div>
</Panel>