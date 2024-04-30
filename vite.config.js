import { fileURLToPath, URL } from 'node:url'
import legacy from '@vitejs/plugin-legacy';
import ElementPlus from 'unplugin-element-plus/vite'
import AutoPreFixer from 'autoprefixer'
import PostCSSfixBugs from 'postcss-flexbugs-fixes'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ElementPlus(),
    // 兼容低版本浏览器
    legacy({
      targets: ['Chrome 58', 'firefox 54'],
      modernPolyfills: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    postcss: {
      plugins: [
        AutoPreFixer({
          overrideBrowserslist: [
            'chrome 58',
            'firefox 54'
          ],
          grid: true
        }),
        PostCSSfixBugs()
      ]
    }
  },
  build: {
    target: 'es2015'
  }
})
