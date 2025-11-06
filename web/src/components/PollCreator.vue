<script setup>
import { ref, inject } from 'vue'
const emit = defineEmits(['created'])
const store = inject('store')

const title = ref('Qual o melhor horário para a live de sexta?')
const options = ref(['18h', '19h', '20h'])
const overlay = ref(false)
const premium = ref(false)

async function createPoll() {
  try {
    const res = await fetch(`${store.apiUrl}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.value, options: options.value, overlay: overlay.value, premium: premium.value })
    })
    const data = await res.json()
    if (!res.ok) { alert(data?.error || 'Falha ao criar enquete'); return }
    emit('created', data)
  } catch (e) {
    console.error('Erro ao criar enquete:', e)
    alert('Erro de conexão com o servidor.')
  }
}

function addOption() {
  if (options.value.length >= 12) return;
  options.value.push('Nova opção')
}
</script>

<template>
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <div class="card-body">
      <h2 class="card-title text-2xl">Criar Enquete</h2>
      <input v-model="title" class="input input-bordered w-full mb-4" placeholder="Título da enquete" />

      <div class="space-y-4 mb-4">
        <div v-for="(opt, i) in options" :key="i" class="flex gap-2 items-center">
          <input v-model="options[i]" class="input input-bordered flex-1" />
          <button class="btn btn-error btn-sm" @click="options.splice(i, 1)" v-if="options.length > 2">X</button>
        </div>
        <div class="card-actions justify-between">
          <button class="btn btn-outline btn-sm" @click="addOption" :disabled="options.length >= 12">Adicionar
            opção</button>
          <div class="form-control mb-4">
            <label class="cursor-pointer label">
              <span class="label-text">Modo overlay</span>
              <input type="checkbox" v-model="overlay" class="checkbox checkbox-primary" />
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn-primary w-full" @click="createPoll">Criar Enquete</button>
    </div>
  </div>
</template>
