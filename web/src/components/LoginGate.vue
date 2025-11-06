<script setup>
import { ref, inject, onMounted } from 'vue'
const store = inject('store')
const state = ref({ checked: false, premium: false })

onMounted(async () => {
  try {
    const res = await fetch(`${store.apiUrl}/me/entitlements`)
    const data = await res.json()
    state.value = { checked: true, premium: !!data.premium }
  } catch (e) { state.value.checked = true }
})
</script>

<template>
  <div class="card card-border bg-neutral mb-8">
    <div class="card-body text-white">
      <template v-if="!state.checked">
        <em class="card-title">Verificando acesso premium…</em>
      </template>
      <template v-else-if="state.premium">
        <strong class="card-title font-bold text-success">Acesso premium ativo.</strong> Salas privadas liberadas.
      </template>
      <template v-else>
        <strong class="card-title font-bold text-error">
          Versão gratuita.
        </strong> 
        Salas privadas bloqueadas.
      </template>
    </div>
  </div>
</template>
