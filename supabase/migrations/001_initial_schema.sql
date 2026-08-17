-- Initial database schema for eFootball Organizer
-- This migration is auto-generated from Drizzle ORM schema

-- Create enum types
CREATE TYPE plan_type AS ENUM ('free', 'monthly', 'yearly', 'lifetime');
CREATE TYPE tournament_type AS ENUM ('league', 'knockout', 'cup', 'groups_knockout', 'double_elimination', 'swiss');
CREATE TYPE tournament_status AS ENUM ('setup', 'active', 'completed');
CREATE TYPE tournament_visibility AS ENUM ('public', 'private');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  plan plan_type NOT NULL DEFAULT 'free',
  tournaments_created INTEGER NOT NULL DEFAULT 0,
  plan_activated_at TIMESTAMP,
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type tournament_type NOT NULL,
  status tournament_status NOT NULL DEFAULT 'active',
  visibility tournament_visibility NOT NULL DEFAULT 'public',
  invite_code TEXT,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  max_players INTEGER,
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tournament_players table
CREATE TABLE tournament_players (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  shirt_number INTEGER,
  position TEXT,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create fixtures table
CREATE TABLE fixtures (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  match_day INTEGER,
  home_team_id INTEGER REFERENCES tournament_players(id) ON DELETE SET NULL,
  away_team_id INTEGER REFERENCES tournament_players(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tournament_registrations table
CREATE TABLE tournament_registrations (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Create email_verifications table
CREATE TABLE email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  tournament_player_id INTEGER NOT NULL REFERENCES tournament_players(id) ON DELETE CASCADE,
  fixture_id INTEGER NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  rated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create payment_transactions table
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  reference TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_tournaments_created_by_user_id ON tournaments(created_by_user_id);
CREATE INDEX idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_user_id ON tournament_players(user_id);
CREATE INDEX idx_fixtures_tournament_id ON fixtures(tournament_id);
CREATE INDEX idx_fixtures_scheduled_at ON fixtures(scheduled_at);
CREATE INDEX idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_user_id ON tournament_registrations(user_id);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_ratings_tournament_player_id ON ratings(tournament_player_id);
CREATE INDEX idx_ratings_fixture_id ON ratings(fixture_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(reference);
