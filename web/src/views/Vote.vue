<script setup>
import { ref, onMounted, inject } from 'vue'
import { io } from 'socket.io-client'

const props = defineProps({ id: { type: String, required: true } })
const store = inject('store')
const poll = ref(null)
const socketRef = { current: null }
const sessionId = localStorage.getItem('pollstack:session') || (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))
localStorage.setItem('pollstack:session', sessionId)

function percent(p) {
  if (!poll.value) return 0
  const total = poll.value.options.reduce((a, o) => a + o.votes, 0)
  if (total === 0) return 0
  return Math.round((p / total) * 100)
}
function vote(optionId) {
  if (!socketRef.current) return
  socketRef.current.emit('poll:vote', { pollId: props.id, optionId, sessionId })
}
onMounted(async () => {
  const socket = io(store.apiUrl || undefined)
  socketRef.current = socket
  socket.on('connect', () => {
    socket.emit('poll:join', { pollId: props.id })
  })
  socket.on('poll:snapshot', (data) => { poll.value = data })
  socket.on('poll:update', (data) => { if (poll.value) poll.value.options = data.options })
  socket.on('poll:closed', (data) => { if (poll.value && data.id === poll.value.id) poll.value.closedAt = data.closedAt })
})
</script>

<template>
  <main class="card shadow-sm p-6 max-w-2xl mx-auto">
    <div v-if="poll" class="card-body">
      <h2 v-if="poll" class="card-title">{{ poll.title }}</h2>
      <div v-for="opt in poll.options" :key="opt.id" style="display:flex; flex-direction:column; gap:6px">
        <button class="btn btn-info" :disabled="poll.closedAt" @click="vote(opt.id)">{{ opt.text }}</button>
        <div class="flex items-center gap-2 mb-4">
          <progress class="progress progress-primary w-full" :value="percent(opt.votes)" min="0" max="100"></progress>
          <small>{{ percent(opt.votes) }}%</small>
        </div>
      </div>
    </div>
    <div v-else class="card-body">
      <p>Carregando…</p>
    </div>
  </main>
</template>
