<script setup>
import { ref, nextTick } from 'vue'
import PollCreator from '../components/PollCreator.vue'
import PollLive from '../components/PollLive.vue'
import LoginGate from '../components/LoginGate.vue'

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
  <header>
    <nav class="navbar bg-base-100 shadow-sm px-4">
        <div class="flex-1">
          <img src="@/assets/imgs/pollstack.png" class="h-8" alt="Logo" />
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-primary" @click="state.view='create'">Nova Enquete</button>
          <button class="btn btn-sm btn-secondary" @click="state.view='live'" :disabled="!state.poll">Ao Vivo</button>
        </div>
      </nav>
  </header>
  <main class="container mx-auto p-6">
    <LoginGate />

    <section v-if="state.view==='create'">
      <PollCreator @created="onCreated" />
    </section>

    <section v-else-if="state.view==='live'">
      <div v-if="state.links" class="card bg-base-100 shadow-sm mb-8">
        <div class="card-body space-y-4">
          <h2 class="card-title">Links rápidos</h2>
          <div class="flex flex-col">
            <small>Votação pública:</small>
            <input :value="state.links.publicUrl" readonly class="w-full input"/>
          </div>
          <div class="flex flex-col">
            <small>Overlay:</small>
            <input :value="state.links.overlayUrl" readonly class="w-full input"/>
          </div>
          <div class="flex gap-4 mt-2">
            <a :href="state.links.publicUrl" target="_blank" class="btn btn-sm btn-accent">Abrir votação</a>
            <a :href="state.links.overlayUrl" target="_blank" class="btn btn-sm btn-info">Abrir overlay</a>
            <!-- fechar votacao -->
            <a :href="state.links.publicUrl" target="_blank" class="btn btn-sm btn-error">Fechar votação</a>
          </div>
        </div>
      </div>
      <PollLive v-if="state.poll" :poll-id="state.poll.id" :key="state.poll.id" />
    </section>
  </main>
</template>
