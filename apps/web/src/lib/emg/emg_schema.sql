CREATE TABLE emg_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT,
    notes TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE emg_readings (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES emg_sessions(id) ON DELETE CASCADE,
    signal_value REAL NOT NULL,
    normalized_value REAL NOT NULL,
    fatigue_index REAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Optimization indexes for rapid querying
CREATE INDEX idx_emg_readings_session_id ON emg_readings(session_id);
CREATE INDEX idx_emg_readings_created_at ON emg_readings(created_at DESC);
CREATE INDEX idx_emg_sessions_patient_id ON emg_sessions(patient_id);
