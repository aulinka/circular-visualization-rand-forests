<script>
    import { onMount } from "svelte";
  import RightPanel from "./RightPanel.svelte";
  import { dialog } from "./dialog.svelte";
  
  let DialogComponent = $derived($dialog?.component);

  function setModalBackdropVisibility(visible) {
    const existingBackdrop = document.querySelector('.modal-backdrop.fade.show');

    if (visible && !existingBackdrop) {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    } else if (!visible && existingBackdrop) {
      existingBackdrop.remove();
    }
  }

  onMount(() => {
    const clearSub = dialog.subscribe(d => {
      setModalBackdropVisibility(d != null);
    });
    return () => {
      clearSub();
      setModalBackdropVisibility(false);
    };
  });
</script>
<main>
  <RightPanel/>
  {#if DialogComponent != null}
  <div class="modal fade show" style="display: block;" tabindex="-1">
    <DialogComponent/>
  </div>
  {/if}
</main>
<style>

</style>