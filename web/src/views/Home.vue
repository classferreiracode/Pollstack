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
  <main>
    <LoginGate />

    <section v-if="state.view==='create'">
      <PollCreator @created="onCreated" />
    </section>

    <section v-else-if="state.view==='live'">
      <div v-if="state.links" class="card" style="margin-bottom:16px">
        <strong>Links rápidos</strong>
        <div class="row" style="margin-top:8px">
          <div><small>Votação pública:</small><br/><input :value="state.links.publicUrl" readonly style="width:100%"/></div>
          <div><small>Overlay:</small><br/><input :value="state.links.overlayUrl" readonly style="width:100%"/></div>
          <div style="display:flex; gap:8px; margin-top:8px">
            <a :href="state.links.publicUrl" target="_blank">Abrir votação</a>
            <a :href="state.links.overlayUrl" target="_blank">Abrir overlay</a>
          </div>
        </div>
      </div>
      <PollLive v-if="state.poll" :poll-id="state.poll.id" :key="state.poll.id" />
    </section>
  </main>
</template>

<style scoped>
.card{ border:1px solid #eee; border-radius:16px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.05) }
.row{ display:grid; gap:12px }
button{ padding:10px 14px; border:1px solid #ddd; background:#fff; cursor:pointer; border-radius:10px }
button:disabled{ opacity:.5; cursor:not-allowed }
</style>
