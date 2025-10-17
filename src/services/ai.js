const PROXY_API = '/api/ai';                     // 本地中间件端点
const DIRECT_URL = 'https://fangqin.app.n8n.cloud/webhook/chat';

async function post(url, message) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ message })
    });
  } catch (e) {
    // 网络错误或跨域失败
    return { error: 'network_error', message: e?.message || 'fetch failed' };
  }

  const contentType = res?.headers?.get ? (res.headers.get('content-type') || '') : '';
  try {
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json() : await res.text();
    return payload;
  } catch (e) {
    // 响应体解析失败
    return { error: 'parse_error', message: e?.message || 'response parse failed' };
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
  // 优先使用同源中间件端点
  try {
    const viaProxy = await post(PROXY_API, message);
    console.log('[AI] via local middleware payload:', viaProxy);

    // 针对 n8n 测试模式 404 的友好提示
    if (viaProxy && typeof viaProxy === 'object' && viaProxy.code === 404 && String(viaProxy.message || '').includes('not registered')) {
      return 'n8n Webhook 未激活。请在 n8n 画布点击“Execute workflow”后立即重试，或将工作流切换为激活（Active）以长期可用。';
    }

    return normalize(viaProxy);
  } catch (proxyErr) {
    console.warn('[AI] local middleware failed, fallback to cross-origin...', proxyErr);
    try {
      const direct = await post(DIRECT_URL, message);
      console.log('[AI] direct payload:', direct);
      return normalize(direct);
    } catch (directErr) {
      console.error('[AI] direct failed:', directErr);
      return '抱歉，AI服务暂不可用，请稍后重试。';
    }
  }
}