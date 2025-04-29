<script module>
  let minimized = $state(false);
</script>
<script>
  import { stage } from '../stage';
  import { tooltip } from "@svelte-plugins/tooltips";
  import Panel from './Panel.svelte';
  import { viewSettings, resetViewSettings } from './uiState.svelte';

  let viewSettingsState = $state({
    hideEdgesToLeaves: false,
    edgesWithinScore: {
      min: '', max: '',
    },
    edgesToLeavesWithinLayers: {
      min: '', max: '',
    },
    nodeToNodeColor: '#ffb347',
    nodeToLeafColor: '#800080',
    nodeColor: '#7ba7cc',
    leafColor: '#98fb98',
  });

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
    viewSettings.update(f => {
      f.hideEdgesToLeaves = viewSettingsState.hideEdgesToLeaves;
      f.edgesWithinScore.min = parseFloatNull(viewSettingsState.edgesWithinScore.min);
      f.edgesWithinScore.max = parseFloatNull(viewSettingsState.edgesWithinScore.max);
      f.edgesToLeavesWithinLayers.min = parseIntNull(viewSettingsState.edgesToLeavesWithinLayers.min);
      f.edgesToLeavesWithinLayers.max = parseIntNull(viewSettingsState.edgesToLeavesWithinLayers.max);
      f.nodeToNodeColor = viewSettingsState.nodeToNodeColor;
      f.nodeToLeafColor = viewSettingsState.nodeToLeafColor;
      f.nodeColor = viewSettingsState.nodeColor;
      f.leafColor = viewSettingsState.leafColor;
      return f;
    });
  }

  function resetViewSettingsEvent() {
    viewSettingsState = {
      hideEdgesToLeaves: false,
      edgesWithinScore: {
        min: '', max: '',
      },
      edgesToLeavesWithinLayers: {
        min: '', max: '',
      },
      nodeToNodeColor: '#ffb347',
      nodeToLeafColor: '#800080',
      nodeColor: '#7ba7cc',
      leafColor: '#98fb98',
    };
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
        <input bind:value={viewSettingsState.edgesWithinScore.min} type="number" min="0.0" step="0.1" class="form-control" placeholder="Min">
        <span class="input-group-text">-</span>
        <input bind:value={viewSettingsState.edgesWithinScore.max} type="number" min="0.0" step="0.1" class="form-control" placeholder="Max">
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Show edges to leaves in layers range</label>
      <div class="input-group mb-3">
        <input bind:value={viewSettingsState.edgesToLeavesWithinLayers.min} min="0" type="number" class="form-control" placeholder="Min">
        <span class="input-group-text">-</span>
        <input bind:value={viewSettingsState.edgesToLeavesWithinLayers.max} min="0" type="number" class="form-control" placeholder="Max">
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