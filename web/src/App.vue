<script setup>
import { ref, nextTick } from 'vue'
import PollCreator from './components/PollCreator.vue'
import PollLive from './components/PollLive.vue'
import LoginGate from './components/LoginGate.vue'

const state = ref({ view: 'create', poll: null, links: null })

async function onCreated(payload) {
  // payload pode ser poll ou { poll, publicUrl, overlayUrl }
  const poll = payload.poll || payload
  state.value.poll = poll
  state.value.links = payload.publicUrl ? payload : null
  state.value.view = 'live'
  await nextTick()
}
</script>
<template>
  <div class="min-h-screen bg-base-200">
    <nav class="navbar bg-base-100 shadow-sm px-4">
      <div class="flex-1">
        <h1 class="text-xl font-bold text-primary">📊 Pollstack</h1>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-sm btn-primary" @click="state.view='create'">Nova Enquete</button>
        <button class="btn btn-sm btn-secondary" @click="state.view='live'" :disabled="!state.poll">Ao Vivo</button>
      </div>
    </nav>

    <main class="container mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>
