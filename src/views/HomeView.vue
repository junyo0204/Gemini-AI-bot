<script setup>

import ChatRoom from '../components/ChatRoom.vue'
import Input from '../components/Input.vue'

</script>

<template>

  <div class="container">
    <div class="col ChatRoom center">
      <ChatRoom />
    </div>
    <div class="col input center">
      <Input />
    </div>
  </div>
</template>

<style>
.container {
  height: 90%;
  padding: 0;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ChatRoom {
  height: 85%;
}

.input {
  height: 15%;
  background-color: rgb(255, 255, 255);
}
</style>
