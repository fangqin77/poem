const PROXY_API = '/api/ai';                     // 本地中间件端点（仅开发）
const DIRECT_URL = 'https://fangqin.app.n8n.cloud/webhook/chat';

// 根据环境选择端点：生产直接走 n8n 公网，开发走同源中间件
const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
const ENDPOINT = isLocalHost ? PROXY_API : DIRECT_URL;

async function post(url, message) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ message })
    });
    // 尝试优先解析为 JSON，失败则回退为文本
    try {
      return await res.clone().json();
    } catch {
      return await res.text();
    }
  } catch (e) {
    return { error: 'network_error', message: e?.message || 'fetch failed' };
  }
}

function normalize(payload) {
  try {
    if (typeof payload === 'string') {
      // 某些情况下服务返回纯文本或字符串化JSON
      try {
        const maybeJson = JSON.parse(payload);
        payload = maybeJson;
      } catch { /* 保留为字符串 */ }
    }
    // n8n 标准输出字段
    if (payload && typeof payload === 'object' && typeof payload.output === 'string') {
      return payload.output;
    }
    if (typeof payload === 'string') return payload;
    if (payload?.data) return typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data);
    if (payload?.body?.data) return typeof payload.body.data === 'string' ? payload.body.data : JSON.stringify(payload.body.data);
    if (payload?.body) return typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
    return JSON.stringify(payload);
  } catch (e) {
    return typeof payload === 'string' ? payload : '抱歉，我暂时没有获得有效的回答。';
  }
}

export async function askAi(message) {
  try {
    const payload = await post(ENDPOINT, message);
    console.log('[AI] payload:', payload);

    // n8n 测试模式 404 的友好提示
    if (payload && typeof payload === 'object' && payload.code === 404 && String(payload.message || '').includes('not registered')) {
      return 'n8n Webhook 未激活。请在 n8n 画布点击“Execute workflow”后立即重试，或将工作流切换为激活（Active）以长期可用。';
    }

    return normalize(payload);
  } catch (err) {
    console.error('[AI] request failed:', err);
    // 尝试最后一次直接走公网（防止误判环境）
    try {
      const direct = await post(DIRECT_URL, message);
      return normalize(direct);
    } catch {
      return '抱歉，AI服务暂不可用，请稍后重试。';
    }
  }
}