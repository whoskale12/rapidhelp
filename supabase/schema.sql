-- ============================================================================
-- EMERGENCY SOS PLATFORM - PRODUCTION DATABASE SCHEMA
-- Database: PostgreSQL / Supabase
-- Version: 1.0
-- Created: 2026-09-06
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 4. CREATE VERIFICATIONS TABLE
-- ============================================================================

CREATE TABLE public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    id_card_number TEXT,
    id_card_image_path TEXT,
    face_image_path TEXT,
    verification_status public.verification_status_enum DEFAULT 'PENDING',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_verifications_user_profiles 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT ck_verified_at_logic CHECK (
        (verification_status = 'APPROVED' AND verified_at IS NOT NULL) OR
        (verification_status != 'APPROVED' AND verified_at IS NULL)
    )
);

CREATE INDEX idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX idx_verifications_status ON public.verifications(verification_status);
CREATE INDEX idx_verifications_created_at ON public.verifications(created_at DESC);

COMMENT ON TABLE public.verifications IS 'Stores identity and face verification data for user onboarding';

-- ============================================================================
-- 6. CREATE TRIGGER FUNCTION FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update the updated_at column on row modification';

CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_verifications_updated_at
    BEFORE UPDATE ON public.verifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_sos_requests_updated_at
    BEFORE UPDATE ON public.sos_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 8. CREATE RLS POLICIES FOR USER_PROFILES
-- ============================================================================

CREATE POLICY user_profiles_read_all ON public.user_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY user_profiles_update_own ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_insert_own ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY user_profiles_read_all ON public.user_profiles IS 'Authenticated users can view all profiles';
COMMENT ON POLICY user_profiles_update_own ON public.user_profiles IS 'Users can only update their own profile';
COMMENT ON POLICY user_profiles_insert_own ON public.user_profiles IS 'Users can only insert their own profile';

-- ============================================================================
-- 11. GRANT PERMISSIONS TO PUBLIC ROLE
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.sos_requests TO authenticated;

GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.verifications TO service_role;
GRANT ALL ON public.sos_requests TO service_role;

-- ============================================================================
-- 13. CREATE HELPER FUNCTION FOR REPUTATION UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_reputation(
    p_user_id UUID,
    p_reputation_delta NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    new_reputation NUMERIC;
BEGIN
    UPDATE public.user_profiles
    SET reputation_score = LEAST(5.0, GREATEST(0.0, reputation_score + p_reputation_delta))
    WHERE user_id = p_user_id
    RETURNING reputation_score INTO new_reputation;
    
    RETURN new_reputation;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_user_reputation(UUID, NUMERIC) 
IS 'Update user reputation score within bounds [0.0 - 5.0]';

-- ============================================================================
-- 14. CREATE VIEW FOR ACTIVE REQUESTS WITH REQUESTER INFO
-- ============================================================================

CREATE OR REPLACE VIEW public.active_sos_requests_with_requester AS
SELECT 
    sr.id,
    sr.requester_id,
    up.full_name as requester_name,
    up.phone_number as requester_phone,
    up.avatar_url as requester_avatar,
    sr.title,
    sr.description,
    sr.latitude,
    sr.longitude,
    sr.location_geog,
    sr.status,
    sr.helper_id,
    sr.created_at,
    sr.updated_at,
    (NOW() - sr.created_at) as time_elapsed
FROM public.sos_requests sr
JOIN public.user_profiles up ON sr.requester_id = up.user_id
WHERE sr.status = 'SEARCHING'
ORDER BY sr.created_at DESC;

COMMENT ON VIEW public.active_sos_requests_with_requester 
IS 'View for retrieving active SOS requests with requester profile information';

-- ============================================================================
-- 15. CREATE VIEW FOR REQUEST HISTORY WITH HELPER INFO
-- ============================================================================

CREATE OR REPLACE VIEW public.completed_requests_with_helper AS
SELECT 
    sr.id,
    sr.requester_id,
    up_req.full_name as requester_name,
    sr.helper_id,
    up_hlp.full_name as helper_name,
    up_hlp.reputation_score as helper_reputation,
    sr.title,
    sr.description,
    sr.latitude,
    sr.longitude,
    sr.status,
    sr.created_at,
    sr.updated_at,
    (sr.updated_at - sr.created_at) as resolution_time
FROM public.sos_requests sr
JOIN public.user_profiles up_req ON sr.requester_id = up_req.user_id
LEFT JOIN public.user_profiles up_hlp ON sr.helper_id = up_hlp.user_id
WHERE sr.status IN ('RESOLVED', 'CANCELLED')
ORDER BY sr.updated_at DESC;

COMMENT ON VIEW public.completed_requests_with_helper 
IS 'View for retrieving completed SOS requests with helper information';

-- ============================================================================
-- 16. SCHEMA METADATA & DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Public schema for RapidHelp emergency SOS platform - contains user profiles, verifications, and SOS requests with RLS policies';

-- ============================================================================
-- END OF SCHEMA CREATION
-- ============================================================================
