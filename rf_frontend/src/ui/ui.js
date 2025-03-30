import { mount } from 'svelte'
import App from './RightPanel.svelte'

export class UI {
  init() {
    const app = mount(App, {
      target: document.getElementById('right-panel'),
    })
  }
}

export const ui = new UI();