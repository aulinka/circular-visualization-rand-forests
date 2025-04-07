import { writable } from "svelte/store";

export let dialog = writable(null);

export function closeDialog() {
  dialog.set(null);
}