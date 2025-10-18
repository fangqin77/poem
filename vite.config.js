import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'ai-proxy',
      configureServer(server) {
        // 简易中间件：同源 POST /api/ai -> n8n webhook
        server.middlewares.use('/api/ai', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }
          try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const bodyStr = Buffer.concat(chunks).toString('utf-8') || '{}';

            const upstream = 'https://fangqin.app.n8n.cloud/webhook/chat';
            const upstreamRes = await fetch(upstream, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: bodyStr
            });

            const ct = upstreamRes.headers.get('content-type') || '';
            res.statusCode = upstreamRes.status;
            res.setHeader('Content-Type', ct.includes('application/json') ? 'application/json' : 'text/plain');

            const buf = ct.includes('application/json')
              ? Buffer.from(JSON.stringify(await upstreamRes.json()))
              : Buffer.from(await upstreamRes.text());

            res.end(buf);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('AI proxy error: ' + (err?.message || 'unknown'));
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: true,
    allowedHosts: ['fangqin.app.n8n.cloud'],
    proxy: {
      '^/n8napi/': {
        target: 'https://fangqin.app.n8n.cloud',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/n8napi/, '')
      }
    }
  }
})