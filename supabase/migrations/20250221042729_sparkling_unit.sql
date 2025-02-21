/*
  # Initial Schema Setup for Random Video Chat

  1. New Tables
    - `active_users`: Tracks users currently looking for a chat
      - `id` (uuid, primary key): User ID from auth.users
      - `last_active` (timestamp): Last activity timestamp
      - `status` (text): User's current status (searching, chatting)
      - `created_at` (timestamp): Record creation time

    - `chat_rooms`: Stores active chat room information
      - `id` (uuid, primary key): Unique room identifier
      - `user1_id` (uuid): First user in the room
      - `user2_id` (uuid): Second user in the room
      - `room_url` (text): Whereby room URL
      - `created_at` (timestamp): When the room was created
      - `ended_at` (timestamp): When the chat ended (null if active)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Active Users Table
CREATE TABLE IF NOT EXISTS active_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    last_active timestamptz DEFAULT now(),
    status text DEFAULT 'searching',
    created_at timestamptz DEFAULT now()
);

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id uuid REFERENCES auth.users(id),
    user2_id uuid REFERENCES auth.users(id),
    room_url text NOT NULL,
    created_at timestamptz DEFAULT now(),
    ended_at timestamptz,
    CONSTRAINT unique_active_room UNIQUE (user1_id, user2_id, ended_at)
);

-- Enable RLS
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Policies for active_users
CREATE POLICY "Users can insert their own record"
    ON active_users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all active users"
    ON active_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own record"
    ON active_users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can delete their own record"
    ON active_users FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms"
    ON chat_rooms FOR SELECT
    TO authenticated
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat rooms"
    ON chat_rooms FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own chat rooms"
    ON chat_rooms FOR UPDATE
    TO authenticated
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);