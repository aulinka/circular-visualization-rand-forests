import { mount } from 'svelte'
import App from './Panel.svelte'

export class Panel {
  init() {
    const app = mount(App, {
      target: document.getElementById('right-panel'),
    })
  }
}

export const panel = new Panel();