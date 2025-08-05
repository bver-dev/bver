-- Initial database schema for BVER

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    county TEXT NOT NULL,
    parcel_number TEXT,
    assessed_value DECIMAL(12, 2),
    market_value DECIMAL(12, 2),
    tax_year INTEGER NOT NULL,
    property_type TEXT DEFAULT 'residential',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appeals table
CREATE TABLE public.appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    current_assessed_value DECIMAL(12, 2) NOT NULL,
    proposed_value DECIMAL(12, 2) NOT NULL,
    estimated_savings DECIMAL(10, 2),
    viability_score TEXT,
    reasons JSONB,
    evidence JSONB,
    form_data JSONB,
    pdf_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    deadline DATE,
    resolution TEXT,
    resolution_date DATE,
    actual_savings DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT status_check CHECK (status IN ('draft', 'ready', 'submitted', 'pending', 'approved', 'rejected', 'withdrawn'))
);

-- Assessment history table
CREATE TABLE public.assessment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assessed_value DECIMAL(12, 2) NOT NULL,
    market_value DECIMAL(12, 2),
    confidence_score DECIMAL(3, 2),
    model_version TEXT,
    data_sources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appeal_id UUID REFERENCES public.appeals(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_parcel ON public.properties(parcel_number);
CREATE INDEX idx_appeals_property_id ON public.appeals(property_id);
CREATE INDEX idx_appeals_user_id ON public.appeals(user_id);
CREATE INDEX idx_appeals_status ON public.appeals(status);
CREATE INDEX idx_assessment_history_property_id ON public.assessment_history(property_id);
CREATE INDEX idx_documents_appeal_id ON public.documents(appeal_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own properties" ON public.properties
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own appeals" ON public.appeals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON public.assessment_history
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM public.properties WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appeals_updated_at BEFORE UPDATE ON public.appeals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();