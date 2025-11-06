<script setup>
import { ref, onMounted, inject } from 'vue'
import { io } from 'socket.io-client'
const props = defineProps({ id: { type:String, required:true } })
const store = inject('store')
const poll = ref(null)
const socketRef = { current: null }

function percent(p){
  if(!poll.value) return 0
  const total = poll.value.options.reduce((a,o)=>a+o.votes,0)
  if(total===0) return 0
  return Math.round((p/total)*100)
}

onMounted(()=>{
  const socket = io(store.apiUrl || undefined)
  socketRef.current = socket
  socket.on('connect', ()=>{ socket.emit('poll:join', { pollId: props.id }) })
  socket.on('poll:snapshot', (data)=>{ poll.value = data })
  socket.on('poll:update', (data)=>{ if(poll.value) poll.value.options = data.options })
})
</script>

<template>
  <div style="background:transparent; color:#FFF; font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial,sans-serif; width:640px;">
    <h2 v-if="poll" style="margin:0 0 8px 0; font-weight:600; text-shadow:0 1px 2px rgba(0,0,0,.5)">{{ poll.title }}</h2>
    <div v-if="poll" style="display:grid; gap:6px">
      <div v-for="opt in poll.options" :key="opt.id">
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
          <span style="text-shadow:0 1px 2px rgba(0,0,0,.5)">{{ opt.text }}</span>
          <span style="text-shadow:0 1px 2px rgba(0,0,0,.5)">{{ percent(opt.votes) }}%</span>
        </div>
        <div style="height:10px; background:rgba(255,255,255,.2); border-radius:999px; overflow:hidden;">
          <div :style="`height:100%; width:${percent(opt.votes)}%; background: linear-gradient(90deg, #3A86FF, #8338EC);`"></div>
        </div>
      </div>
    </div>
    <div v-else style="color:#EEE">Carregando…</div>
  </div>
</template>

<style>
/* Transparente por padrão para Browser Source */
html,body,#app{ background: transparent; }
</style>
