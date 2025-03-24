<script>
  let { children, title, minimizeButton = false } = $props();
  let minimized = $state(false);
</script>
<main>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      { title }
      {#if minimizeButton}
        <button onclick={() => minimized = !minimized} type="button" class="btn btn-sm btn-primary" aria-label="Minmize">
          <i class={["bi", !minimized ? "bi-chevron-up" : "bi-chevron-down"]}></i>
        </button>
      {/if}
    </div>
    {#if !minimized}
      <div class="card-body">
        <p class="card-text">
          {@render children?.()}
        </p>
      </div>
    {/if}
  </div>
</main>