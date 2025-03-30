<script>
  let { minimized = $bindable(), children, title } = $props();
  // let minimized = $state(false);
</script>
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    { title }
    {#if minimized != null}
      <button onclick={() => minimized = !minimized} type="button" class="btn btn-sm btn-primary" aria-label="Minimize">
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
