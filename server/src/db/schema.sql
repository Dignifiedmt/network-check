-- NetworkCheck Database Schema
-- Compatible with PostgreSQL on Railway & local setups

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lgas (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(state_id, name)
);

CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS network_baselines (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    lga_id INTEGER NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
    operator_id INTEGER NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    voice_rating VARCHAR(20) NOT NULL CHECK (voice_rating IN ('Good', 'Fair', 'Poor', 'No Service')),
    data_rating VARCHAR(20) NOT NULL CHECK (data_rating IN ('Good', 'Fair', 'Poor', 'No Service')),
    sms_rating VARCHAR(20) NOT NULL CHECK (sms_rating IN ('Good', 'Fair', 'Poor', 'No Service')),
    source_name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('Official', 'Community', 'Demo')),
    source_url VARCHAR(255),
    dataset_version VARCHAR(50) NOT NULL,
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    UNIQUE(state_id, lga_id, operator_id, dataset_version)
);

CREATE TABLE IF NOT EXISTS community_reports (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    phone_hash VARCHAR(64) NOT NULL,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    lga_id INTEGER NOT NULL REFERENCES lgas(id) ON DELETE RESTRICT,
    operator_id INTEGER NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('no_network', 'slow_data', 'dropped_calls', 'call_connect_fail', 'sms_problem', 'other')),
    description TEXT,
    reported_time VARCHAR(50) NOT NULL DEFAULT 'Now',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(50) DEFAULT 'English',
    ai_category VARCHAR(50) DEFAULT 'unclassified',
    ai_severity VARCHAR(20) DEFAULT 'moderate' CHECK (ai_severity IN ('low', 'moderate', 'high')),
    duplicate_flag BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'received' CHECK (status IN ('received', 'verified', 'investigating', 'resolved')),
    source VARCHAR(30) DEFAULT 'Community' CHECK (source IN ('Community', 'Demo', 'Official'))
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_analysis (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES community_reports(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_logs (
    id SERIAL PRIMARY KEY,
    phone_masked VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'outgoing' CHECK (direction IN ('incoming', 'outgoing')),
    status VARCHAR(30) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'simulated', 'failed', 'received')),
    reference VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ussd_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL,
    service_code VARCHAR(50),
    step VARCHAR(50) NOT NULL DEFAULT 'main',
    state_id INTEGER,
    lga_id INTEGER,
    operator_id INTEGER,
    issue_type VARCHAR(50),
    reported_time VARCHAR(50),
    temp_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_lgas_state_id ON lgas(state_id);
CREATE INDEX IF NOT EXISTS idx_baselines_lga_op ON network_baselines(state_id, lga_id, operator_id);
CREATE INDEX IF NOT EXISTS idx_reports_lga ON community_reports(lga_id);
CREATE INDEX IF NOT EXISTS idx_reports_op ON community_reports(operator_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON community_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reference ON community_reports(reference);
