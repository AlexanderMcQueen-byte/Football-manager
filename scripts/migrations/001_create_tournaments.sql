-- Migration: create tournaments, tournament_players, fixtures
-- Safe to run multiple times (uses IF NOT EXISTS)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_type') THEN
    CREATE TYPE tournament_type AS ENUM (
      'league', 'knockout', 'cup', 'groups_knockout', 'double_elimination', 'swiss'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_status') THEN
    CREATE TYPE tournament_status AS ENUM ('setup', 'active', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_visibility') THEN
    CREATE TYPE tournament_visibility AS ENUM ('public', 'private');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS tournaments (
  id serial PRIMARY KEY,
  name text NOT NULL,
  type tournament_type NOT NULL,
  status tournament_status NOT NULL DEFAULT 'active',
  visibility tournament_visibility NOT NULL DEFAULT 'public',
  invite_code text,
  created_by_user_id integer REFERENCES users(id),
  max_players integer,
  scheduled_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournament_players (
  id serial PRIMARY KEY,
  tournament_id integer NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS fixtures (
  id serial PRIMARY KEY,
  tournament_id integer NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round integer NOT NULL,
  home_player_id integer NOT NULL,
  away_player_id integer NOT NULL,
  home_score integer,
  away_score integer,
  played boolean NOT NULL DEFAULT false,
  knockout_phase text,
  played_at timestamp
);

-- Seed a minimal example tournament if none exists
DO $$
BEGIN
  IF (SELECT count(*) FROM tournaments) = 0 THEN
    INSERT INTO tournaments (name, type, status, max_players)
    VALUES ('Sample Cup', 'knockout', 'active', 4);
  END IF;
END$$;
