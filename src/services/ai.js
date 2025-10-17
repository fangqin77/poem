const N8N_WEBHOOK_URL = 'https://fangqin.app.n8n.cloud/webhook-test/chat';

export async function askAi(message) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // n8n webhook returns a complex object, we need to find the actual message.
    // Based on previous calls, the response is JSON with a 'Content' property which is also a JSON string.
    const data = await response.json();
    console.log('Raw AI response:', data);

    // Let's assume the final message is in a deeply nested structure.
    // This part might need adjustment based on the actual n8n workflow response structure.
    // Based on the previous log: data.Content is a stringified JSON.
    if (data.body && data.body.data) {
        return data.body.data;
    }
    
    return '抱歉，我无法解析收到的回答。';

  } catch (error) {
    console.error('Error calling AI webhook:', error);
    return '抱歉，与AI助手通信时发生错误。';
  }
}