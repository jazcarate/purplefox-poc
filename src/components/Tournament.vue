<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Table from './Table.vue';
import TournamentHeader from './TournamentHeader.vue';
import { supabase, type TableStatus } from '../lib/supabase';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const loading = ref(true);
const error = ref('');
const subscription = ref<any>(null);
const isConnected = ref(false);
const ignoreWebsockets = ref(false);
const lastUpdateTimestamp = ref(Date.now());

const tables = ref<TableStatus[]>([]);

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
    lastUpdateTimestamp.value = Date.now();

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

function setupRealtimeSubscription() {
  // Clean up previous subscription if exists
  if (subscription.value) {
    supabase.removeChannel(subscription.value);
    isConnected.value = false;
  }

  subscription.value = supabase
    .channel('table_status_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'table_status',
        filter: `tournamentId=eq.${props.id}`,
      },
      (payload) => {
        console.log('Real-time update received:', payload);

        // Skip updates if in debug mode
        if (ignoreWebsockets.value) {
          console.log('Debug mode active: Ignoring websocket update');
          return;
        }

        if (payload.eventType === 'UPDATE') {
          const index = tables.value.findIndex(
            ({ tableNumber, tournamentId }) => tableNumber === payload.new.tableNumber &&
              tournamentId === payload.new.tournamentId
          );

          if (index !== -1) {
            tables.value[index] = payload.new as TableStatus;
            lastUpdateTimestamp.value = Date.now();
          } else {
            console.error('Table not found:', payload.new);
          }
        } else {
          console.error('Unknown event type:', payload.eventType);
        }
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
      isConnected.value = status === 'SUBSCRIBED';
    });
}

// Fetch tables when component is mounted or when ID changes
onMounted(() => {
  fetchTables();
  setupRealtimeSubscription();
});

watch(() => props.id, () => {
  fetchTables();
  setupRealtimeSubscription();
});

onUnmounted(() => {
  if (subscription.value) {
    supabase.removeChannel(subscription.value);
    isConnected.value = false;
  }
});
</script>

<template>
  <TournamentHeader :id="id" :is-connected="isConnected" :last-update-timestamp="lastUpdateTimestamp" />

  <div class="z-10 px-6 py-8 mt-14 max-w-6xl mx-auto">

    <!-- Debug mode checkbox -->
    <div class="flex justify-end">
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="ignoreWebsockets" class="sr-only peer">
        <div
          class="relative w-9 h-5 bg-gray-600 peer-checked:bg-red-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all">
        </div>
        <span class="ml-2 text-sm text-gray-800">[Debug] Realtime {{ ignoreWebsockets ? 'disabled' : 'enabled' }}</span>
      </label>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <p>Loading tables...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Table v-for="table in tables" :key="table.tableNumber" :number="table.tableNumber"
          :initial-status="table.status" :tournament-id="id" />
      </div>
    </div>
  </div>
</template>