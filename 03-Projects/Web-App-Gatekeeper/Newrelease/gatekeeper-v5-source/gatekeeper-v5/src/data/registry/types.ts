// Registry schema — GATEKEEPER v3.1 §5
export type ConfirmationLevel = 'CONFIRMED' | 'TENTATIVE' | 'CONFLICTED' | 'UNCONFIRMED';
export type Tier = 0 | 'G' | 1 | 2;

export interface Evidence {
  tier: Tier;
  source: string;   // human-readable source name, e.g. "ShiokGuide" or "Your Archive, Entry #38"
  quote: string;
  url?: string;
}

export interface ConceptEvidence {
  level: ConfirmationLevel;
  evidence: Evidence[];
}

export interface RegistryEntry {
  candidateName: string;
  areaClaimed: string;              // advisory only — Step 2 always re-resolves via Google (DR-10)
  concepts: Record<string, ConceptEvidence>;
  researchedAt: string;             // ISO date
  sessionQuery: string;
}

export interface Registry {
  city: string;
  area: string;
  slug: string;
  keywordSet: string[];
  entries: RegistryEntry[];
  generatedBy: 'claude-research-session';
  schemaVersion: 1;
}
