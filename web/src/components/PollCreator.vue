<script setup>
import { ref, inject } from 'vue'
const emit = defineEmits(['created'])
const store = inject('store')

const title = ref('Qual o melhor horário para a live de sexta?')
const options = ref(['18h','19h','20h'])
const overlay = ref(false)
const premium = ref(false)

async function createPoll(){
  try{
    const res = await fetch(`${store.apiUrl}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.value, options: options.value, overlay: overlay.value, premium: premium.value })
    })
    const data = await res.json()
    console.log('📊 Resposta da API:', data)
    if(!res.ok){ alert(data?.error || 'Falha ao criar enquete'); return }
    // agora emitimos o pacote completo para mostrar links
    emit('created', data)
  }catch(e){
    console.error('Erro ao criar enquete:', e)
    alert('Erro de conexão com o servidor.')
  }
}

function addOption(){ if(options.value.length>=12) return; options.value.push('Nova opção') }
</script>

<template>
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Criar Enquete</h2>
    <input v-model="title" class="input input-bordered w-full mb-4" placeholder="Título da enquete" />

    <div class="space-y-2 mb-4">
      <div v-for="(opt, i) in options" :key="i" class="flex gap-2">
        <input v-model="options[i]" class="input input-bordered flex-1" />
        <button class="btn btn-error btn-sm" @click="options.splice(i,1)" v-if="options.length>2">X</button>
      </div>
      <button class="btn btn-outline btn-sm" @click="addOption" :disabled="options.length>=12">Adicionar opção</button>
    </div>

    <div class="form-control mb-4">
      <label class="cursor-pointer label">
        <span class="label-text">Modo overlay</span>
        <input type="checkbox" v-model="overlay" class="checkbox checkbox-primary" />
      </label>
    </div>

    <button class="btn btn-primary w-full" @click="createPoll">Criar Enquete</button>
  </div>
</template>


<style scoped>
.card{ border:1px solid #eee; border-radius:16px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.05) }
.row{ display:grid; gap:12px }
button{ padding:10px 14px; border:1px solid #ddd; background:#fff; cursor:pointer; border-radius:10px }
</style>
