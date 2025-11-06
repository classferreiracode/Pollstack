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
  <div class="card mx-auto w-full">
    <div v-if="poll" class="card-body">
      <h2 v-if="poll" class="card-title">{{ poll.title }}</h2>
      <div v-for="opt in poll.options" :key="opt.id">
        <div class="flex justify-between mb-2">
          <span>{{ opt.text }}</span>
          <span>{{ percent(opt.votes) }}%</span>
        </div>
        <div class="flex items-center gap-2">
          <progress class="progress progress-primary w-full" :value="percent(opt.votes)" min="0"
            max="100"></progress>
        </div>
      </div>
    </div>
    <div v-else class="card-body">
      Carregando…
    </div>
  </div>
</template>

<style>
/* Transparente por padrão para Browser Source */
html,body,#app{ background: transparent; }
</style>
