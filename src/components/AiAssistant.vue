<template>
  <div class="ai-assistant">
    <button @click="toggleChat" class="chat-toggle-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>

    <div v-if="isChatOpen" class="chat-window">
      <div class="chat-header">
        <span>AI 助手</span>
        <button @click="toggleChat" class="close-button">&times;</button>
      </div>
      <div class="chat-body" ref="chatBody">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender]">
          <p>{{ message.text }}</p>
        </div>
        <div v-if="isLoading" class="message assistant">
          <p>正在思考中...</p>
        </div>
      </div>
      <div class="chat-footer">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="输入您的问题..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { askAi } from '@/services/ai.js';

// 轻量 Markdown 清理：去掉 #、**、`、--- 等符号，并美化列表为圆点
function beautifyText(input) {
  try {
    let s = String(input ?? '').replace(/\r\n/g, '\n');

    // 代码块与分隔线
    s = s.replace(/```[\s\S]*?```/g, '');       // 去掉代码块
    s = s.replace(/^\s*---+\s*$/gm, '');        // 去掉分隔线

    // 标题：去掉行首 # 及空格
    s = s.replace(/^\s*#{1,6}\s*/gm, '');

    // 强调符号：** __ * _
    s = s.replace(/\*\*(.*?)\*\*/g, '$1');
    s = s.replace(/__(.*?)__/g, '$1');
    s = s.replace(/\*(.*?)\*/g, '$1');
    s = s.replace(/_(.*?)_/g, '$1');

    // 行内代码：`text`
    s = s.replace(/`([^`]+)`/g, '$1');

    // 列表项：- * + -> 圆点
    s = s.replace(/^[\t ]*[-*+]\s+/gm, '• ');

    // 有序列表：保留数字与点
    s = s.replace(/^[\t ]*(\d+)\.\s+/gm, (_m, n) => `${n}. `);

    // 归一化多余空行
    s = s.replace(/\n{3,}/g, '\n\n');

    return s.trim();
  } catch {
    return typeof input === 'string' ? input : JSON.stringify(input);
  }
}

const isChatOpen = ref(false);
const userInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const chatBody = ref(null);

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value && messages.value.length === 0) {
    // Initial greeting
    messages.value.push({ sender: 'assistant', text: '您好！我是您的AI助手，有什么可以帮助您的吗？' });
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (userInput.value.trim() === '' || isLoading.value) return;

  const userMessage = userInput.value.trim();
  messages.value.push({ sender: 'user', text: userMessage });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  const aiResponse = await askAi(userMessage);

  // askAi 已经归一化为字符串，展示前做轻量美化
  const rawText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
  const assistantMessage = beautifyText(rawText);

  messages.value.push({ sender: 'assistant', text: assistantMessage });
  isLoading.value = false;
  scrollToBottom();
};
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.chat-toggle-button:hover {
  background-color: #0056b3;
}

.chat-window {
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  bottom: 80px;
  right: 0;
}

.chat-header {
  padding: 15px;
  background-color: #007bff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.chat-body {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  display: flex;
}

.message p {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  margin: 0;
}

.message.user {
  justify-content: flex-end;
}

.message.user p {
  background-color: #007bff;
  color: white;
}

.message.assistant {
  justify-content: flex-start;
}

.message.assistant p {
  background-color: #e9e9eb;
  color: #333;
}

.chat-footer {
  padding: 15px;
  display: flex;
  border-top: 1px solid #ddd;
}

.chat-footer input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 15px;
  margin-right: 10px;
}

.chat-footer button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-footer button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.chat-footer button:not(:disabled):hover {
  background-color: #0056b3;
}
</style>