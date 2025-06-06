-- Create RLS policies
-- Migration: Add Row Level Security policies for all tables

-- Profiles policies
DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
      FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Posts policies
DO $$ BEGIN
    CREATE POLICY "Posts are viewable by everyone" ON public.posts
      FOR SELECT USING (NOT is_deleted);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can create posts" ON public.posts
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own posts" ON public.posts
      FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Comments policies
DO $$ BEGIN
    CREATE POLICY "Comments are viewable by everyone" ON public.comments
      FOR SELECT USING (NOT is_deleted);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can create comments" ON public.comments
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own comments" ON public.comments
      FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Votes policies
DO $$ BEGIN
    CREATE POLICY "Votes are viewable by everyone" ON public.votes
      FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can create votes" ON public.votes
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own votes" ON public.votes
      FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own votes" ON public.votes
      FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Reports policies
DO $$ BEGIN
    CREATE POLICY "Reports are viewable by moderators" ON public.reports
      FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can create reports" ON public.reports
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;