<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import Table from './Table.vue';
import TournamentHeader from './TournamentHeader.vue';
import { supabase, type TableStatus } from '../lib/supabase';

interface Props {
  id: string; // Tournament ID from URL
}

const props = defineProps<Props>();
const tables = ref<TableStatus[]>([]);
const loading = ref(true);
const error = ref('');

// Complete table list including missing tables with "unknown" status
const completeTableList = computed(() => {
  if (tables.value.length === 0) return [];

  // Find the min and max table numbers
  const tableNumbers = tables.value.map(t => t.tableNumber);
  const minTable = Math.min(...tableNumbers);
  const maxTable = Math.max(...tableNumbers);

  // Create a complete array with all table numbers in the range
  const result: TableStatus[] = [];

  for (let i = minTable; i <= maxTable; i++) {
    // Find the table in our data if it exists
    const existingTable = tables.value.find(t => t.tableNumber === i);

    if (existingTable) {
      // Use existing table data
      result.push(existingTable);
    } else {
      // Create a placeholder for missing table
      result.push({
        tableNumber: i,
        tournamentId: props.id,
        status: 'unknown'
      });
    }
  }

  return result;
});

async function fetchTables() {
  try {
    loading.value = true;
    error.value = '';

    const { data, error: queryError } = await supabase
      .from('table_status')
      .select('tableNumber, tournamentId, status')
      .eq('tournamentId', props.id)
      .order('tableNumber');

    if (queryError) throw queryError;

    tables.value = data || [];

    if (tables.value.length === 0) {
      error.value = 'No tables found for this tournament';
    }
  } catch (err) {
    console.error('Error fetching table data:', err);
    error.value = 'Failed to load tournament data';
  } finally {
    loading.value = false;
  }
}

// Fetch tables when component is mounted or when ID changes
onMounted(fetchTables);
watch(() => props.id, fetchTables);
</script>

<template>
  <TournamentHeader />

  <div class="z-10 px-6 py-8 mt-14 max-w-6xl mx-auto">
    <div class="mb-4">
      <h1 class="text-xl font-semibold">Tournament: {{ id }}</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <p>Loading tables...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <Table v-for="table in completeTableList" :key="table.tableNumber" :number="table.tableNumber"
        :initial-status="table.status" />
    </div>
  </div>
</template>