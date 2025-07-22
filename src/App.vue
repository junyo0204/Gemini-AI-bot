<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue';
import axios from "axios";

import ChatRoom from './components/ChatRoom.vue'
import Input from './components/Input.vue'
import { useChatStore } from './stores/chat'
import { ElMessage, ElMessageBox } from 'element-plus'

const chatStore = useChatStore();
chatStore.setRoomID(0); //設定room_id初值
const side_bar = ref(false); //管理drawer的顯示與否
const history = ref([]); // 聊天室列表
const API_BASE = 'http://localhost:3000/api';

//載入聊天室列表
const loadHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE}/history`);
    history.value = res.data.reverse(); // 最新的在最上面
  } catch (err) {
    ElMessage.error('載入歷史紀錄失敗', err);
  }
};

//掛載時載入聊天室列表
onMounted(loadHistory);

//控制drawer的開關 及每次都會reload聊天室列表
const toggle_side_bar = () => {
  side_bar.value = side_bar.value == false ? true : false;
  loadHistory();
}

//透過更改room_id來觸發各元件相對應要顯示的內容
const selectChat = (id) => {
  chatStore.setRoomID(id); // 設定為所點選到的id
}

//刪除聊天室
const deleteChat = (id, title) => {
  ElMessageBox.confirm(
    '將會刪除 "' + title + ' "',
    '確定要刪除聊天室?',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    }
  )
    .then(async () => {
      try {
        const res = await axios.delete(`${API_BASE}/rooms/${id}`);
        if (res.data.state) {
          ElMessage({
            type: 'success',
            message: '已成功刪除!',
          })
          // 重新載入聊天室列表
          chatStore.setRoomID(0);
          await loadHistory();
        }
      } catch (err) {
        ElMessage.error('刪除失敗：' + (err.response?.data?.error || err.message))
      }

    })
    .catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: 'Delete canceled',
      // })
    })
}

</script>

<template>

  <div class="container-fluid text-center">
    <div class="row">
      <div class="col">
        <ul class="nav">
          <li class="nav-item center">
            <a class="label nav-link active fs-5" aria-current="page" href="/">Chat-bot</a>
          </li>
          <li class="nav-item center">
            <div class="ctrl-btn center" @click="toggle_side_bar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                class="bi bi-layout-text-sidebar" viewBox="0 0 16 16">
                <path
                  d="M3.5 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM3 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z" />
                <path
                  d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm12-1v14h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm-1 0H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9z" />
              </svg>
            </div>

          </li>
        </ul>
        <!-- <RouterView /> -->
        <div class="container pt-1">
          <div class="ChatRoom center">
            <ChatRoom />
          </div>
          <div class="input center">
            <Input />
          </div>
        </div>
      </div>
      <el-drawer :lock-scroll="true" v-model="side_bar" :with-header="true" style="min-width: 200px; max-width: 250px;">
        <div class="drawer_area">
          <div class="hisList center" @click="selectChat(0)"><svg xmlns="http://www.w3.org/2000/svg" width="18"
              height="18" fill="currentColor" class="bi bi-vector-pen" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M10.646.646a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1 0 .708l-1.902 1.902-.829 3.313a1.5 1.5 0 0 1-1.024 1.073L1.254 14.746 4.358 4.4A1.5 1.5 0 0 1 5.43 3.377l3.313-.828zm-1.8 2.908-3.173.793a.5.5 0 0 0-.358.342l-2.57 8.565 8.567-2.57a.5.5 0 0 0 .34-.357l.794-3.174-3.6-3.6z" />
              <path fill-rule="evenodd" d="M2.832 13.228 8 9a1 1 0 1 0-1-1l-4.228 5.168-.026.086z" />
            </svg> New Chat </div>
          <el-divider></el-divider>
          <div class="scroll_area">
            <el-scrollbar>
              <div class="hisList px-2 mb-1 text-start align-content-center" v-for="item in history" :key="item.h_id"
                @click="selectChat(item.h_id)">
                <span class="text-truncate">{{ item.h_name }}</span>
                <button type="button" class="btn btn-outline-danger btn-sm custom-btn" @click.stop
                  @click="deleteChat(item.h_id, item.h_name)"><svg xmlns="http://www.w3.org/2000/svg" width="10"
                    height="10" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg></button>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>

</template>

<style scoped>
.container-fluid {
  height: 100vh;
  overflow: hidden;
  /* 避免內容超出時出現整體 scrollbar */
}

.custom-btn {
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-drawer__header) {
  margin-bottom: 5px;
  padding-top: 10px;
}

:deep(.el-drawer__body) {
  padding-top: 0;
  padding-bottom: 5px;
}

.label {
  color: rgb(46, 109, 14);
  font-weight: 700;
}

.col {
  height: 100vh;
  padding: 0%;
}

.nav {
  height: 10;
  display: flex;
  justify-content: space-between;
  border-bottom: 0.5px solid rgb(180, 180, 180);
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

.nav-List {
  background-color: #818181;
  height: 100%;
}

.hisList {
  display: flex;
  align-items: center;
  height: 40px;
  width: 92%;
  border-radius: .5rem;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 14px;
  justify-content: space-between;
}

.hisList:hover {
  background-color: rgb(224.6, 242.8, 215.6);
  cursor: pointer;
}

.drawer_area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.scroll_area {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

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
  width: 100%;
}

.el-divider--horizontal {
  margin: 12px 0;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ChatRoom {
  height: calc(85% - 40px);
  overflow-y: auto;
}

.input {
  background-color: rgb(255, 255, 255);
  position: fixed;
  bottom: 20px;
  left: 0;
  width: 100%;
  height: 15%;
  z-index: 100;
  display: flex;
  justify-content: center;
}
</style>
