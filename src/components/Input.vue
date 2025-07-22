<script setup>
import { ref } from 'vue'
import axios from "axios";
import { useChatStore } from '../stores/chat'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore() 
const prompt = ref(''); //input欄位內容
const response = ref(''); //存取接收到的room_id
const API_BASE = 'http://localhost:3000/api';

const sendPrompt = () => {
  if (!prompt.value.trim()) return;
  geminiExe();
};

//在輸入時能夠按下Enter傳送內容 shift+enter能夠換行
const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      return
    } else {
      event.preventDefault();
      if (!prompt.value.trim()) return;
      geminiExe();
    }
  }
}

//呼叫/api/gemini 存入user問題及對應room_id 並取得ai回應
const geminiExe = async () => {
  try {
    chatStore.setLoadingSign(true);
    const res = await axios.post(`${API_BASE}/gemini`, {
      prompt: prompt.value,
      room_id: chatStore.room_id
    });
    response.value = res.data.response; //接收回傳的room_id
    prompt.value = ''; //清空input欄位
  } catch (err) {
    ElMessage.error('Error：' + (err.response?.data?.error || err.message));
    chatStore.setLoadingSign(false);
  } finally {
    chatStore.setRoomID(response.value); //於新增聊天室時 將id從0設為最新room_id
    chatStore.setLoadingSign(false);
    // console.log(response.value);
  }
}

</script>

<template>
  <div class="input-bar center">
    <textarea class="texting" v-model="prompt" @keydown="handleKeydown" placeholder="Please input">>
    </textarea>
    <div @click="sendPrompt" class="ctrl-btn center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-send"
        viewBox="0 0 16 16">
        <path
          d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.input-bar {
  border: 0.5px solid rgb(44, 119, 0);
  width: 90%;
  height: 100%;
  min-height: 80px;
  border-radius: .50rem;
  z-index: 99;
  background-color: rgb(255, 255, 255);
}

.texting {
  width: 95%;
  resize: none;
  height: 80%;
  border-radius: .50rem;
  border: none;
  outline: none;
}

.ctrl-btn {
  width: 30px;
  height: 30px;
  margin-right: 5px;
  border-radius: .5rem;
}

.ctrl-btn:hover {
  background-color: rgb(214, 214, 214);
}
</style>
