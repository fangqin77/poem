const PROXY_API = 'https://fangqin.app.n8n.cloud/webhook/poem-chat';                     // 本地中间件端点（仅开发）
const DIRECT_URL = 'https://fangqin.app.n8n.cloud/webhook-test/86681566-bb4e-4f95-a966-33ad7ad23a31';
const TEST_URL   = 'https://fangqin.app.n8n.cloud/webhook-test/86681566-bb4e-4f95-a966-33ad7ad23a31';

// 根据环境选择端点：生产直接走 n8n 公网，开发走同源中间件
const isLocalHost = (() => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname || '';
  // localhost/回环/0.0.0.0
  if (/^(localhost|127\.|0\.0\.0\.0)/.test(h)) return true;
  // 私有网段：10.x.x.x、192.168.x.x、172.16-31.x.x
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(h)) return true;
  // 常见本地域名后缀
  if (/\.(local|lan)$/i.test(h)) return true;
  return false;
})();
const ENDPOINT = isLocalHost ? PROXY_API : DIRECT_URL;

// 端点回退顺序与记忆
const ENDPOINTS = isLocalHost ? [PROXY_API, DIRECT_URL, TEST_URL] : [DIRECT_URL, TEST_URL];
let LAST_GOOD = null;
try { LAST_GOOD = typeof window !== 'undefined' ? window.localStorage.getItem('n8n_last_good') : null; } catch {}

async function post(url, message) {
  const payloadJson = JSON.stringify({ chatInput: message, message, text: message, prompt: message });

  const withTimeout = (promise, ms = 90000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout_' + ms)), ms))
    ]);

  try {
    // 1) 首选：POST JSON
    const res = await withTimeout(fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/plain' },
      body: payloadJson
    }));
    if (!res.ok) {
      const text = await res.text();
      return { code: res.status, message: text || 'http_error' };
    }
    try { return await res.clone().json(); } catch { return await res.text(); }
  } catch (e1) {
    try {
      // 2) 回退：POST 表单
      const form = new URLSearchParams({ chatInput: message, message, text: message, prompt: message });
      const res2 = await withTimeout(fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json, text/plain' },
        body: form.toString()
      }));
      if (!res2.ok) {
        const text = await res2.text();
        return { code: res2.status, message: text || 'http_error' };
      }
      try { return await res2.clone().json(); } catch { return await res2.text(); }
    } catch (e2) {
      try {
        // 3) 最后回退：GET 查询串
        const q = encodeURIComponent(message);
        const res3 = await withTimeout(fetch(`${url}?chatInput=${q}&message=${q}&text=${q}&prompt=${q}`, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json, text/plain' }
        }));
        if (!res3.ok) {
          const text = await res3.text();
          return { code: res3.status, message: text || 'http_error' };
        }
        try { return await res3.clone().json(); } catch { return await res3.text(); }
      } catch (e3) {
        return { error: 'network_error', message: e3?.message || e2?.message || e1?.message || 'fetch failed' };
      }
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 对 429/5xx/网络错误做指数退避重试；404 直接返回，交由上层回退端点
async function retryPost(url, message) {
  const delays = [600, 1500, 3000, 5000];
  for (let i = 0; i < delays.length; i++) {
    const payload = await post(url, message);
    if (payload && typeof payload === 'object' && payload.code) {
      const code = Number(payload.code);
      if (code === 404) return payload;               // 切端点
      if (code === 429 || (code >= 500 && code <= 504)) {
        const jitter = Math.floor(Math.random() * 120);
        await sleep(delays[i] + jitter);
        continue;
      }
    }
    // 非错误对象或成功文本，直接返回
    return payload;
  }
  // 最后再返回一次
  return await post(url, message);
}

function isOkPayload(payload) {
  try {
    const txt = normalize(payload);
    return typeof txt === 'string' && txt.trim().length > 0 && !/^n8n Webhook 未激活/.test(txt);
  } catch { return false; }
}

async function tryRequest(message) {
  // 优先使用上次成功端点
  const order = isLocalHost
    ? [PROXY_API, ...ENDPOINTS.filter(u => u !== PROXY_API)]
    : (LAST_GOOD && ENDPOINTS.includes(LAST_GOOD)
        ? [LAST_GOOD, ...ENDPOINTS.filter(u => u !== LAST_GOOD)]
        : [...ENDPOINTS]);
  for (const url of order) {
    const payload = await retryPost(url, message);
    if (payload && typeof payload === 'object' && payload.code === 404) {
      // 404 换下一个端点
      continue;
    }
    if (isOkPayload(payload)) {
      try { window.localStorage.setItem('n8n_last_good', url); LAST_GOOD = url; } catch {}
      return payload;
    }
    // 若不满足 isOk 但无明确错误，继续尝试下一个端点
  }
  // 都失败则返回最后一次的结果
  return await post(order[0], message);
}

function normalize(payload) {
  try {
    // 1) 处理字符串或字符串化 JSON
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { return payload; }
    }

    // 2) 处理 n8n 常见返回：数组 [{ json: {...} }], 或 [{ body: ... }], 或 [{ data: ... }]
    if (Array.isArray(payload) && payload.length > 0) {
      const item = payload[0];
      // 最常见结构：item.json 或 item.body 或 item.data
      const candidate =
        (item && item.json) ??
        (item && item.body) ??
        (item && item.data) ??
        item;
      return typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
    }

    // 网络错误友好提示
    if (payload && typeof payload === 'object' && payload.error === 'network_error') {
      return 'AI服务连接不稳定或超时，请稍后重试或刷新页面。';
    }
    // 3) 对象字段兼容
    if (payload && typeof payload === 'object') {
      // 标准字段
      if (typeof payload.output === 'string') return payload.output;
      if (typeof payload.aiResponse === 'string') return payload.aiResponse;
      // 常见字段
      if (typeof payload.text === 'string') return payload.text;
      if (typeof payload.message === 'string' && !payload.error) return payload.message;
      if (payload.data) return typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data);
      if (payload.body?.data) return typeof payload.body.data === 'string' ? payload.body.data : JSON.stringify(payload.body.data);
      if (payload.body) return typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
      // 兜底
      return JSON.stringify(payload);
    }

    // 4) 其他类型兜底
    return String(payload);
  } catch (e) {
    return typeof payload === 'string' ? payload : '抱歉，我暂时没有获得有效的回答。';
  }
}

export async function askAi(message) {
  try {
    const payload = await tryRequest(message);
    console.log('[AI] payload:', payload);

    // 404 自动回退测试端点；若仍失败则提示激活
    if (payload && typeof payload === 'object' && payload.code === 404 && String(payload.message || '').includes('not registered')) {
      try {
        const testPayload = await post(TEST_URL, message);
        const text = normalize(testPayload);
        if (text && String(text).trim()) return text;
      } catch {}
      return 'n8n Webhook 未激活。请在 n8n 画布点击“Execute workflow”后立即重试，或将工作流切换为激活（Active）以长期可用。';
    }

    return normalize(payload);
  } catch (err) {
    console.error('[AI] request failed:', err);
    // 兜底重试：激活端点 -> 测试端点
    try {
      const direct = await post(DIRECT_URL, message);
      const text1 = normalize(direct);
      if (text1 && String(text1).trim()) return text1;
      const testPayload = await post(TEST_URL, message);
      return normalize(testPayload);
    } catch {
      return '抱歉，AI服务暂不可用，请稍后重试。';
    }
  }
}