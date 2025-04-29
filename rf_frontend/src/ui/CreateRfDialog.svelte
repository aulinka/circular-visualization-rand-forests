<script>
  import { tooltip } from "@svelte-plugins/tooltips";
  import { closeDialog, dialog } from "./dialog.svelte";
  import { createNDJSONStream, readInputFileAsText } from "../utils";
  import { app } from "../app";

  const formatHintText = `The first line of CSV must be header. The last column specifies the name of target/class in case of classification and numeric value in case of regression.
Other columns are features. Only numeric features are supported.`;

  let datasetFile = $state();
  let datasetHeader = $state();
  let formData = $state({
    type: '', treesCount: '', randState: '', testRatio: '', clustersCount: ''
  });

  async function fileSelected() {
    const file = datasetFile[0];
    if (file == null) {
      datasetHeader = null;
      return;
    }
    const data = await readInputFileAsText(file);
    const firstNewLinePos = data.indexOf('\n');
    if (firstNewLinePos == -1) {
      return alert('Invalid CSV supplied');
    }
    const header = data.substring(0, firstNewLinePos);
    const fields = header.replaceAll('"','').split(',');
    if (fields.length < 2) {
      return alert('At least one feature and one target/numeric value name are required in header.');
    }
    for (const field of fields) {
      if (!isNaN(field)) {
        return alert('Header is not in CSV file. At least one feature and one target/numeric value name are required in header.');
      }
    }
    datasetHeader = {
      features: fields.slice(0, -1),
      target: fields[fields.length - 1]
    };
  }

  let createProgress = $state(null);

  async function createRf() {
    createProgress = 5;

    var data = new FormData()
    data.append('dataset', datasetFile[0]);
    data.append('type', formData.type);
    data.append('treesCount', formData.treesCount);
    data.append('randState', formData.randState);
    data.append('testRatio', formData.testRatio);
    if (formData.type == 'regression') {
      data.append('clustersCount', formData.clustersCount);
    }

    try {
      let response;
      try {
        response = await fetch('http://localhost:4444/generate/', {
          method: 'POST',
          body: data
        });
      } catch(ex) {
        alert('Failed to connect to RF Combinator. Please assure that combinator is running.');
        createProgress = null;
        return;
      }
      
      const jsonStream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(createNDJSONStream());

      const reader = jsonStream.getReader();
      let fileName = null;
      while (true) {
        const { value: info, done } = await reader.read();
        if (done) break;
        if (info.error != null) {
          createProgress = null;
          alert("Something failed during generation of Random Forest: " + info.error);
          return;
        }
        if (info.progress != null) {
          createProgress = info.progress;
          if (info.progress == 100) {
            fileName = info.file;
          }
        }
      }

      var data2 = new FormData()
      data2.append('file', fileName);
      const res = await fetch('http://localhost:4444/download', {
        method: 'POST',
        body: data2
      });
      const json = await res.json();
      app.loadRandomForest(json);
      await new Promise(resolve => setTimeout(resolve, 1000));
      dialog.set(null);
    } catch (ex) {
      createProgress = null;
      alert('Failed to generate random forest, reason: ' + ex);
    }

  }

</script>

<div class="modal-dialog modal-lg">
  <div class="modal-content">
    <div class="modal-header">
      <h1 class="modal-title fs-5">Create random forest</h1>
      <button type="button" onclick={closeDialog} class="btn-close" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <form>
        <div class="mb-3">
          <label for="formFile" class="form-label">CSV Dataset file</label>
          <input onchange={fileSelected} bind:files={datasetFile} class="form-control" accept=".csv" type="file">
          <div class="form-text">Download sample CSV for <a href="sample-dataset-classification.csv">classification</a>/<a href="sample-dataset-regression.csv">regression</a>. <span class="btn-link p-0" use:tooltip={{maxWidth: 500}} title={formatHintText}>Format of data-set</span>.</div>
        </div>
        <div class="mb-3">
          <label for="formFile" class="form-label">Type of calculation</label>
          <select bind:value={formData.type} class="form-select">
            <option value="classification">Classification</option>
            <option value="regression">Regression</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="formFile" class="form-label">Number of trees</label>
          <input bind:value={formData.treesCount} type="number" class="form-control" placeholder="eg. 5">
        </div>
        <div class="mb-3">
          <label for="formFile" class="form-label">Random state number</label>
          <input bind:value={formData.randState} type="number" class="form-control" placeholder="eg. 42">
          <div class="form-text">Specify an initial random state (seed) to make the classification/regressions results reproducible. Using the same number will yield identical outcomes on each calculation.</div>
        </div>
        <div class="mb-3">
          <label for="formFile" class="form-label">Test Set Ratio</label>
          <div class="input-group">
            <input bind:value={formData.testRatio} type="number" class="form-control" placeholder="eg. 30">
            <span class="input-group-text">%</span>
          </div>
          <div class="form-text">Enter the percentage of your dataset to reserve for testing. For example, if you input 30, then 30% of the data is used as the test set and the remaining 70% for training.</div>
        </div>
        {#if formData.type === 'regression'}
          <div class="mb-3">
            <label for="formFile" class="form-label">Number of clusters</label>
            <input bind:value={formData.clustersCount} type="number" class="form-control" placeholder="eg. 3">
            <div class="form-text">Number of clusters determines how many intervals the output values of the leaf trees are divided into.</div>
          </div>
        {/if}
      </form>
      {#if datasetHeader != null}
        <hr/>
        <b>Features: </b> {datasetHeader.features.join(', ')}<br/>
        <b>Target: </b> {datasetHeader.target}
      {/if}
    </div>
    <div class="modal-footer">
      <button onclick={createRf} type="button" class="btn btn-primary" disabled={createProgress != null}>
      {#if createProgress != null}
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        {createProgress}%
      {:else}
        Create
      {/if}
      </button>
    </div>
  </div>
</div>