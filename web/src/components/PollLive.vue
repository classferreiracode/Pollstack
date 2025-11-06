<script setup>
import { ref, onMounted, inject } from 'vue'
import { io } from 'socket.io-client'
const props = defineProps({ pollId: { type:String, required:true } })
const store = inject('store')
const poll = ref(null)
const socketRef = { current: null }
const sessionId = localStorage.getItem('pollstack:session') || (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))
localStorage.setItem('pollstack:session', sessionId)
function percent(p){ if(!poll.value) return 0; const total = poll.value.options.reduce((a,o)=>a+o.votes,0); if(total===0) return 0; return Math.round((p/total)*100) }
function vote(optionId){ if(!socketRef.current) return; socketRef.current.emit('poll:vote', { pollId: props.pollId, optionId, sessionId }) }
onMounted(()=>{
  const socket = io(store.apiUrl || undefined)
  socketRef.current = socket
  socket.on('connect', ()=>{ socket.emit('poll:join', { pollId: props.pollId }) })
  socket.on('poll:snapshot', (data)=>{ poll.value = data })
  socket.on('poll:update', (data)=>{ if(!poll.value) return; poll.value.options = data.options })
  socket.on('poll:closed', (data)=>{ if(poll.value && data.id===poll.value.id){ poll.value.closedAt = data.closedAt } })
})
</script>
<template>
  <div v-if="poll" class="card">
    <h2 style="margin-top:0">{{ poll.title }}</h2>
    <div class="row">
      <div v-for="opt in poll.options" :key="opt.id" style="display:flex; flex-direction:column; gap:6px">
        <button :disabled="poll.closedAt" @click="vote(opt.id)">{{ opt.text }}</button>
        <div style="height:10px; background:#0D1321; border-radius:999px; overflow:hidden;">
          <div :style="`height:100%; width:${percent(opt.votes)}%; background: linear-gradient(90deg, #3A86FF, #8338EC);`"></div>
        </div>
        <small>{{ percent(opt.votes) }}%</small>
      </div>
    </div>
    <p v-if="poll.closedAt"><strong>Enquete encerrada.</strong></p>
  </div>
</template>
