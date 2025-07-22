import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
    state: () => ({
        room_id: null,
        state: false
    }),
    actions: {
        setRoomID(id) {
            this.room_id = id
        },
        setLoadingSign(state) {
            this.state = state
        }
    }
})