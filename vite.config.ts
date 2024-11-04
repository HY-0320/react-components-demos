import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@hooks': path.resolve(__dirname, 'src/hooks'), // 将 @hooks 映射到 src/hooks 目录
      '@components': path.resolve(__dirname, 'src/components'), // 示例：将 @components 映射到 src/components 目录
      // 可以添加更多的别名配置
    }
  },
  plugins: [react()],
  server: {
    port: 3000,
  }
})
