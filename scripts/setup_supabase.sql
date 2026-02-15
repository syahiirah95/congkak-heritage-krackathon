-- ============================================================
-- Congkak Heritage: Full MVP Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles Table
-- Core user data: identity, inventory, economy, progression
CREATE TABLE IF NOT EXISTS congkakheritage_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,

  -- Guli Inventory (spend 49 to play Congkak, win gulis back from your store)
  collected_gulis JSONB DEFAULT '{"white": 0, "yellow": 0, "red": 0, "blue": 0, "black": 0}',

  -- Economy
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 100,

  -- Progression
  current_level INTEGER DEFAULT 1,
  total_gulis_collected INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_energy_refill TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Match History Table
-- Records every Congkak match for stats and leaderboard
CREATE TABLE IF NOT EXISTS congkakheritage_match_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id UUID REFERENCES congkakheritage_profiles(id) ON DELETE CASCADE,
  player_score INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  won BOOLEAN NOT NULL DEFAULT false,
  gulis_spent INTEGER NOT NULL DEFAULT 49,
  gulis_won INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  match_date TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leaderboard View (aggregated from profiles based on XP and match history)
CREATE OR REPLACE VIEW congkakheritage_leaderboard AS
SELECT
  p.id,
  p.name,
  p.avatar_url,
  p.high_score,
  p.total_wins,
  p.total_matches,
  p.xp,
  p.current_level,
  RANK() OVER (ORDER BY p.xp DESC, p.high_score DESC) as rank
FROM congkakheritage_profiles p
WHERE p.xp > 0 OR p.total_matches > 0
ORDER BY rank ASC
LIMIT 100;

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

-- Profiles RLS
ALTER TABLE congkakheritage_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "congkakheritage_public_profiles_viewable"
  ON congkakheritage_profiles FOR SELECT
  USING ( true );

CREATE POLICY "congkakheritage_users_insert_own_profile"
  ON congkakheritage_profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "congkakheritage_users_update_own_profile"
  ON congkakheritage_profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Match History RLS
ALTER TABLE congkakheritage_match_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "congkakheritage_match_history_viewable"
  ON congkakheritage_match_history FOR SELECT
  USING ( true );

CREATE POLICY "congkakheritage_auth_users_insert_match"
  ON congkakheritage_match_history FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );

-- ============================================================
-- 5. Triggers
-- ============================================================

-- Auto-update profile stats when a match is recorded
CREATE OR REPLACE FUNCTION congkakheritage_on_match_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE congkakheritage_profiles
  SET
    high_score = GREATEST(high_score, NEW.player_score),
    total_wins = total_wins + CASE WHEN NEW.won THEN 1 ELSE 0 END,
    total_matches = total_matches + 1,
    coins = coins + NEW.coins_earned,
    xp = xp + NEW.xp_earned,
    updated_at = NOW()
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER congkakheritage_on_match_submitted
  AFTER INSERT ON congkakheritage_match_history
  FOR EACH ROW EXECUTE FUNCTION congkakheritage_on_match_insert();

-- Auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION congkakheritage_on_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO congkakheritage_profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pemain'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER congkakheritage_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION congkakheritage_on_auth_user_created();

-- ============================================================
-- 6. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS congkakheritage_idx_match_profile ON congkakheritage_match_history(profile_id);
CREATE INDEX IF NOT EXISTS congkakheritage_idx_match_date ON congkakheritage_match_history(match_date DESC);
CREATE INDEX IF NOT EXISTS congkakheritage_idx_profiles_high_score ON congkakheritage_profiles(high_score DESC);
CREATE INDEX IF NOT EXISTS congkakheritage_idx_profiles_xp ON congkakheritage_profiles(xp DESC);
