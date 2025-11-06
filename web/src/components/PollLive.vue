<script setup>
import { ref, onMounted, inject } from "vue";
import { io } from "socket.io-client";

const props = defineProps({ pollId: { type: String, required: true } });
const store = inject("store");
const poll = ref(null);
const socketRef = { current: null };
const sessionId =
  localStorage.getItem("pollstack:session") ||
  (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

localStorage.setItem("pollstack:session", sessionId);

function percent(p) {
  if (!poll.value) return 0;
  const total = poll.value.options.reduce((a, o) => a + o.votes, 0);
  if (total === 0) return 0;
  return Math.round((p / total) * 100);
}
function vote(optionId) {
  if (!socketRef.current) return;
  socketRef.current.emit("poll:vote", {
    pollId: props.pollId,
    optionId,
    sessionId,
  });
}
onMounted(() => {
  const socket = io(store.apiUrl || undefined);

  socketRef.current = socket;

  socket.on("connect", () => {
    socket.emit("poll:join", { pollId: props.pollId });
  });

  socket.on("poll:snapshot", (data) => {
    poll.value = data;
  });

  socket.on("poll:update", (data) => {
    if (!poll.value) return;
    poll.value.options = data.options;
  });

  socket.on("poll:closed", (data) => {
    if (poll.value && data.id === poll.value.id) {
      poll.value.closedAt = data.closedAt;
    }
  });
});
</script>
<template>
  <div v-if="poll" class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h2 class="card-title">{{ poll.title }}</h2>
      <div v-for="opt in poll.options" :key="opt.id" style="display: flex; flex-direction: column; gap: 6px">
        <button :disabled="poll.closedAt" @click="vote(opt.id)">
          {{ opt.text }}
        </button>
        <div class="flex items-center gap-2">
          <progress class="progress progress-primary w-full" :value="percent(opt.votes)" min="0"
            max="100"></progress>
            <small>{{ percent(opt.votes) }}%</small>
        </div>
      </div>
    </div>
    <p v-if="poll.closedAt"><strong>Enquete encerrada.</strong></p>
  </div>
</template>
