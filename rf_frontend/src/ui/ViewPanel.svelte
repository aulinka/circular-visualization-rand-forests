<script module>
  let minimized = $state(false);
</script>
<script>
  import { stage } from '../stage';
  import { tooltip } from "@svelte-plugins/tooltips";
  import Panel from './Panel.svelte';
  import { viewSettings, resetViewSettings } from './uiState.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';

  let viewSettingsState = $state({});

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

  function parseIntNull(str) {
    const val = parseInt(str);
    return !isNaN(val) ? val : null;
  }

  function parseFloatNull(str) {
    const val = parseFloat(str);
    return !isNaN(val) ? val : null;
  }

  function applyViewSettings() {
    const floatFields = [
      "edgesWithinScoreMin", "edgesWithinScoreMax",
    ];
    const intFields = [
      "edgesToLeavesWithinLayersMin", "edgesToLeavesWithinLayersMax",
    ];
    
    viewSettings.update(f => {
      for (const key of Object.keys(f)) {
        if (intFields.includes(key)) {
          f[key] = parseIntNull(viewSettingsState[key]);
        } else if (floatFields.includes(key)) {
          f[key] = parseFloatNull(viewSettingsState[key]);
        } else {
          f[key] = viewSettingsState[key];
        }
      }
      return f;
    });
  }

  let settingsChangesUnsubscribe = null;

  onMount(() => {
    viewSettingsState = get(viewSettings);
    settingsChangesUnsubscribe = viewSettings.subscribe(s => {
      viewSettingsState = { ...s };
    });
  });

  onDestroy(() => {
    settingsChangesUnsubscribe();
  });

  function resetViewSettingsEvent(e) {
    e.preventDefault();
    resetViewSettings();
  }

  function onFormSubmit(e) {
    e.preventDefault();
    applyViewSettings();
  }

</script>
<Panel title="View" bind:minimized={minimized}>
  <div class="btn-group" role="group" aria-label="Screenshot">
    <button onclick={() => screenshot(1)} type="button" class="btn btn-primary">Screenshot</button>
    <button onclick={() => screenshot(2)} type="button" class="btn btn-primary">2x</button>
    <button onclick={() => screenshot(4)} type="button" class="btn btn-primary">4x</button>
    <button onclick={() => screenshot(8)} type="button" class="btn btn-primary">8x</button>
  </div>
  <div class="btn" use:tooltip={{maxWidth: 400}} title="Creates screenshot of current view. Screenshot (1x), 2x, 4x and 8x means resolution of image. So when clicking to 4x, it means it will have 4 times higher resolution and details"><i class="bi bi-question-circle"></i></div>
  <hr/>
  <form onsubmit={onFormSubmit}>
    <div class="form-check mb-3">
      <input bind:checked={viewSettingsState.hideEdgesToLeaves} id="hideEdgesToLeavesCheckbox" class="form-check-input" type="checkbox">
      <label class="form-check-label" for="hideEdgesToLeavesCheckbox">
        Hide edges to leaves
      </label>
    </div>
    <div class="mb-3">
      <label class="form-label">Show edges with score in range</label>
      <div class="input-group mb-3">
        <input bind:value={viewSettingsState.edgesWithinScoreMin} type="number" min="0.0" step="0.1" class="form-control" placeholder="Min">
        <span class="input-group-text">-</span>
        <input bind:value={viewSettingsState.edgesWithinScoreMax} type="number" min="0.0" step="0.1" class="form-control" placeholder="Max">
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Show edges to leaves in layers range</label>
      <div class="input-group mb-3">
        <input bind:value={viewSettingsState.edgesToLeavesWithinLayersMin} min="0" type="number" class="form-control" placeholder="Min">
        <span class="input-group-text">-</span>
        <input bind:value={viewSettingsState.edgesToLeavesWithinLayersMax} min="0" type="number" class="form-control" placeholder="Max">
      </div>
    </div>
    <div class="row mb-3 g-2">
      <div class="col-auto">
        <input bind:value={viewSettingsState.nodeToNodeColor} id="normalEdgeColorInput" class="form-control form-control-color" type="color">
      </div>
      <div class="col-auto">
        <label class="col-form-label pl-0" for="normalEdgeColorInput">
          Edge - Node to Node color
        </label>
      </div>
    </div>
    <div class="row mb-3 g-2">
      <div class="col-auto">
        <input bind:value={viewSettingsState.nodeToLeafColor} id="leafEdgeColorInput" class="form-control form-control-color" type="color">
      </div>
      <div class="col-auto">
        <label class="col-form-label pl-0" for="leafEdgeColorInput">
          Edge - Node to Leaf color
        </label>
      </div>
    </div>
    <div class="row mb-3 g-2">
      <div class="col-auto">
        <input bind:value={viewSettingsState.nodeColor} id="normalColorInput" class="form-control form-control-color" type="color">
      </div>
      <div class="col-auto">
        <label class="col-form-label pl-0" for="normalColorInput">
          Node color
        </label>
      </div>
    </div>
    <div class="row mb-3 g-2">
      <div class="col-auto">
        <input bind:value={viewSettingsState.leafColor} id="leafColorInput" class="form-control form-control-color" type="color">
      </div>
      <div class="col-auto">
        <label class="col-form-label pl-0" for="leafColorInput">
          Leaf color
        </label>
      </div>
    </div>
    <button onclick={applyViewSettings} class="btn btn-primary">Apply</button>
    <button onclick={resetViewSettingsEvent} class="btn btn-secondary">Reset</button>
  </form>

</Panel>