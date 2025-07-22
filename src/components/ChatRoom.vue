<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import axios from "axios";
import { marked } from 'marked'

const chatStore = useChatStore();
chatStore.setRoomID(0); //設定room_id初值
const API_BASE = 'http://localhost:3000/api';
const roomContent = ref([]); //聊天內容
const loading = ref(false); //管控loading與否
const scrollbarRef = ref(null);

//透過watch偵測room_id的改變以達成聊天室內容的變更
watch(
  () => chatStore.room_id,
  (newId, oldId) => {
    if (newId !== null) {
      console.log('room_id changed from', oldId, 'to', newId);
      getContentByRoomid();
    }
  }
)

// 管控loading的狀態變更
watch(
  () => chatStore.state,
  (newState, oldState) => {
    console.log('SetState', oldState, 'to', newState);
    loading.value = newState;
    getContentByRoomid();
  }
)

//取得對應room_id的聊天室資訊
const getContentByRoomid = async () => {
  try {
    const res = await axios.get(`${API_BASE}/rooms/${chatStore.room_id}/messages`);
    roomContent.value = res.data.messages;
    console.log("roomContent.value", roomContent.value);
    scrollToBottom();
  } catch (err) {
    console.error('載入歷史紀錄失敗', err);
  }
}

// 聊天室資料載入後 將scrollbar滑至最底
const scrollToBottom = () => {
  nextTick(() => {
    const wrap = scrollbarRef.value?.wrapRef
    if (wrap) {
      wrap.scrollTo({
        top: wrap.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}


</script>

<template>
  <div class="container chat-room">
    <div class="init" v-if="chatStore.room_id == 0" v-loading="loading">
      <b>What can I get for you?</b>
    </div>
    <el-scrollbar v-loading="loading" v-if="chatStore.room_id != 0" ref="scrollbarRef">
      <div class="mb-3" v-for="item in roomContent">
        <div class="d-flex justify-content-end">
          <div class="chat-bubble user me-3">{{ item.user_message }}</div>
        </div>
        <div class="d-flex justify-content-start mt-2">
          <div class="AiRes chat-bubble ms-3" v-html="marked.parse(item.ai_response)"></div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.chat-bubble {
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 20px;
  /*字串太長會自動中斷換行*/
  word-wrap: break-word;
  /*保留空格與換行符，自動換行*/
  white-space: pre-wrap;
}

.chat-bubble.user {
  background-color: rgb(137, 211, 103);
  color: #ffffff;
}

.AiRes {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
  text-align: left;
}

.init {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  color: rgb(99, 157, 70);
}

.chat-room {
  width: 90%;
  height: 100%;
  background-color: rgb(255, 255, 255);
}
</style>
