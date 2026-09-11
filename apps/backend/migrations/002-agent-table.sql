CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_address VARCHAR(42) NOT NULL,

    name VARCHAR(100) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,

    max_trade_amount NUMERIC NOT NULL,
    max_exposure NUMERIC NOT NULL,
    daily_loss_limit NUMERIC NOT NULL,

    allowed_markets TEXT[] DEFAULT '{}',

    active BOOLEAN NOT NULL DEFAULT TRUE,

    human_backed BOOLEAN NOT NULL DEFAULT FALSE,
    agentbook_human_id TEXT,

    agentbook_registered_at TIMESTAMP,

    registration_status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_agents_owner_address
ON ai_agents(owner_address);

CREATE INDEX idx_ai_agents_registration_status
ON ai_agents(registration_status);