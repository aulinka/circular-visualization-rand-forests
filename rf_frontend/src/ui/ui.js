import { mount } from 'svelte'
import App from './UI.svelte'

export class UI {
  init() {
    const app = mount(App, {
      target: document.getElementById('ui'),
    })
  }
}

export const ui = new UI();