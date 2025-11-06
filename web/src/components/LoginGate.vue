<script setup>
import { ref, inject, onMounted } from 'vue'
const store = inject('store')
const state = ref({ checked:false, premium:false })
onMounted(async () => {
  try{
    const res = await fetch(`${store.apiUrl}/me/entitlements`)
    const data = await res.json()
    state.value = { checked:true, premium: !!data.premium }
  }catch(e){ state.value.checked = true }
})
</script>
<template>
  <div class="card" style="margin-bottom:16px">
    <template v-if="!state.checked"><em>Verificando acesso premium…</em></template>
    <template v-else-if="state.premium"><strong>Acesso premium ativo.</strong> Salas privadas liberadas.</template>
    <template v-else><strong>Versão gratuita.</strong> Integre Patreon/apoia.se para liberar premium.</template>
  </div>
</template>
