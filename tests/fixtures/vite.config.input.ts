import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import uiPro from '@nuxt/ui-pro/vite'

export default defineConfig({
  plugins: [
    vue(),
    uiPro({
      ui: {
        colors: {
          primary: 'green',
          neutral: 'slate'
        }
      },
      uiPro: {
        pageCard: {
          slots: {
            root: 'rounded-xl',
          }
        }
      }
    })
  ]
})
