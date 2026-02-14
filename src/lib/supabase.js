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
    // If profile doesn't exist (e.g. user from another project on same Supabase), create it
    if (error && error.code === 'PGRST116') {
        const { data: user } = await supabase.auth.getUser();
        const meta = user?.user?.user_metadata || {};
        const { data: newProfile, error: insertErr } = await supabase
            .from('congkakheritage_profiles')
            .upsert({
                id: userId,
                name: meta.full_name || 'Pemain',
                avatar_url: meta.avatar_url || ''
            }, { onConflict: 'id' })
            .select()
            .single();
        if (insertErr) console.error('Auto-create profile error:', insertErr.message);
        return newProfile;
    }
    if (error) console.error('Load profile error:', error.message);
    return data;
}

export async function updateProfile(userId, updates) {
    if (!supabase) return;
    const { error } = await supabase
        .from('congkakheritage_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);
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
