<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, type TableStatus } from '../lib/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const tournaments = ref<string[]>([]);
const loading = ref(true);
const error = ref('');

async function fetchTournaments() {
    try {
        loading.value = true;

        // Query for unique tournament IDs
        const { data, error: queryError } = await supabase
            .from('table_status')
            .select('tournamentId')
            .order('tournamentId')
            .not('tournamentId', 'is', null);

        if (queryError) throw queryError;

        // Extract unique tournament IDs
        const uniqueTournaments = [...new Set(data.map(item => item.tournamentId))];
        tournaments.value = uniqueTournaments;
    } catch (err) {
        console.error('Error fetching tournaments:', err);
        error.value = 'Failed to load tournaments';
    } finally {
        loading.value = false;
    }
}

function goToTournament(id: string) {
    router.push(`/tournament/${id}`);
}

onMounted(() => {
    fetchTournaments();
});
</script>

<template>
    <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Tournament Management</h1>

        <div v-if="loading" class="text-center py-8">
            <p>Loading tournaments...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ error }}
        </div>

        <div v-else>
            <h2 class="text-xl font-semibold mb-4">Available Tournaments</h2>

            <div v-if="tournaments.length === 0" class="text-gray-500">
                No tournaments found
            </div>

            <div v-else class="grid gap-4">
                <div v-for="id in tournaments" :key="id"
                    class="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50" @click="goToTournament(id)">
                    <div class="font-medium">Tournament ID: {{ id }}</div>
                    <div class="text-sm text-gray-500">Click to view tables</div>
                </div>
            </div>
        </div>
    </div>
</template>