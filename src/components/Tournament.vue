<script setup lang="ts">
import Table from './Table.vue';
import TournamentHeader from './TournamentHeader.vue';
</script>

<template>
  <TournamentHeader />
  <div class="p-4">
    <div class="grid grid-cols-5 gap-1 md:grid-cols-10 place-items-stretch">
      <Table v-for="number in 50" :key="number" :number="number" />
    </div>
  </div>
</template>