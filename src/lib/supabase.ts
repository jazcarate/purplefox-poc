import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be provided in .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface TableStatus {
    tableNumber: number;
    tournamentId: string;
    status: 'unknown' | 'playing' | 'covered' | 'done';
} 