import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_');
export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ─── Authentication ───────────────────────────────────────────

export async function signInWithGoogle() {
    if (!supabase) return console.warn('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) console.error('Google login error:', error.message);
    return data;
}

export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
}

export function onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}

export async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ─── Profile ──────────────────────────────────────────────────

export async function loadProfile(userId) {
    if (!supabase) return null;
    let { data, error } = await supabase
        .from('congkakheritage_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            const { data: user } = await supabase.auth.getUser();
            const meta = user?.user?.user_metadata || {};
            const { data: newProfile, error: insertErr } = await supabase
                .from('congkakheritage_profiles')
                .upsert({
                    id: userId,
                    name: meta.full_name || 'Pemain',
                    avatar_url: meta.avatar_url || '',
                    last_energy_refill: new Date().toISOString()
                }, { onConflict: 'id' })
                .select()
                .single();
            if (insertErr) console.error('Auto-create profile error:', insertErr.message);
            return newProfile;
        }
        console.error('Load profile error:', error.message);
        return null;
    }

    // --- DAILY ENERGY REFILL LOGIC ---
    const lastRefill = new Date(data.last_energy_refill || data.created_at);
    const now = new Date();

    // Check if it's a new day (local time)
    const isNewDay = now.toDateString() !== lastRefill.toDateString();

    if (isNewDay) {
        const { data: updatedData, error: refillErr } = await supabase
            .from('congkakheritage_profiles')
            .update({
                energy: 100,
                last_energy_refill: now.toISOString(),
                updated_at: now.toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (!refillErr) return updatedData;
        console.error('Daily refill error:', refillErr.message);
    }

    return data;
}

export async function updateProfile(userId, updates) {
    if (!supabase) return;
    const { error } = await supabase
        .from('congkakheritage_profiles')
        .upsert({
            id: userId,
            ...updates,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    if (error) console.error('Update profile error:', error.message);
}

export async function saveGuliCollection(userId, inventory) {
    return updateProfile(userId, { collected_gulis: inventory });
}

// ─── Match History ────────────────────────────────────────────

export async function saveMatchResult(userId, { playerScore, aiScore, won, gulisSpent, gulisWon, coinsEarned, xpEarned }) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('congkakheritage_match_history')
        .insert({
            profile_id: userId,
            player_score: playerScore,
            ai_score: aiScore,
            won,
            gulis_spent: gulisSpent,
            gulis_won: gulisWon,
            coins_earned: coinsEarned,
            xp_earned: xpEarned
        })
        .select()
        .single();
    if (error) console.error('Save match error:', error.message);
    return data;
}

export async function getMatchHistory(userId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('congkakheritage_match_history')
        .select('*')
        .eq('profile_id', userId)
        .order('match_date', { ascending: false })
        .limit(20);
    if (error) console.error('Match history error:', error.message);
    return data || [];
}

// ─── Leaderboard ──────────────────────────────────────────────

export async function getLeaderboard() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('congkakheritage_leaderboard')
        .select('*')
        .limit(20);
    if (error) console.error('Leaderboard error:', error.message);
    return data || [];
}
