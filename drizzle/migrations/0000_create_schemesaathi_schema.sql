CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  local_name text,
  short_name text,
  ministry text NOT NULL,
  level text NOT NULL CHECK (level IN ('central','state','centrally_sponsored')),
  state_code text,
  category text NOT NULL,
  benefit_types text[] NOT NULL DEFAULT '{}',
  benefit_label text NOT NULL,
  benefit_headline text NOT NULL,
  benefit_note text,
  benefit_value integer NOT NULL DEFAULT 0,
  annual_cash integer NOT NULL DEFAULT 0,
  summary text NOT NULL,
  description text NOT NULL,
  eligibility_summary text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  min_age integer,
  max_age integer,
  max_income integer,
  genders text[] NOT NULL DEFAULT '{}',
  occupations text[] NOT NULL DEFAULT '{}',
  land_statuses text[] NOT NULL DEFAULT '{}',
  social_categories text[] NOT NULL DEFAULT '{}',
  areas text[] NOT NULL DEFAULT '{}',
  requires_flags text[] NOT NULL DEFAULT '{}',
  excludes_flags text[] NOT NULL DEFAULT '{}',
  eligibility_points jsonb NOT NULL DEFAULT '[]',
  exclusions text[] NOT NULL DEFAULT '{}',
  documents jsonb NOT NULL DEFAULT '[]',
  steps jsonb NOT NULL DEFAULT '[]',
  faqs jsonb NOT NULL DEFAULT '[]',
  official_url text NOT NULL,
  helpline text,
  apply_mode text NOT NULL DEFAULT 'online',
  is_dbt boolean NOT NULL DEFAULT false,
  deadline_note text,
  popularity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO anon, authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schemes are public" ON public.schemes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  state_code text,
  district text,
  quiz_answers jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.saved_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheme_id uuid NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scheme_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_schemes TO authenticated;
GRANT ALL ON public.saved_schemes TO service_role;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own saved read" ON public.saved_schemes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own saved insert" ON public.saved_schemes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own saved delete" ON public.saved_schemes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheme_id uuid NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  reference_no text,
  applied_on date NOT NULL DEFAULT current_date,
  lodged_via text,
  stage integer NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','action_needed','approved','rejected')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own applications read" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own applications insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications update" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own applications delete" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER applications_touch BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.benefit_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  received_on date NOT NULL DEFAULT current_date,
  bank text,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.benefit_payments TO authenticated;
GRANT ALL ON public.benefit_payments TO service_role;
ALTER TABLE public.benefit_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payments read" ON public.benefit_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own payments insert" ON public.benefit_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own payments delete" ON public.benefit_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX saved_schemes_user_idx ON public.saved_schemes(user_id);
CREATE INDEX applications_user_idx ON public.applications(user_id);
CREATE INDEX benefit_payments_user_idx ON public.benefit_payments(user_id);