import { signal } from '@preact/signals';
import { put, setSetting, type Keyword, type Criterion, type WishItem, type AuditRec, type CachedSearch } from './services/store';

export const tab = signal<'radar'|'gate'|'folio'|'audit'|'codex'|'intel'|'settings'>('radar');
export const keywords = signal<Keyword[]>([]);
export const criteria = signal<Criterion[]>([]);
export const wishlist = signal<WishItem[]>([]);
export const audits = signal<AuditRec[]>([]);
export const lastSearch = signal<CachedSearch|null>(null);
export const toastMsg = signal<string>('');
export const auditPrefill = signal<string>('');

let toastTimer: ReturnType<typeof setTimeout>;
export function toast(m: string) { toastMsg.value = m; clearTimeout(toastTimer); toastTimer = setTimeout(() => toastMsg.value = '', 2400); }
export function goAudit(cafe: string) { auditPrefill.value = cafe; tab.value = 'audit'; }

export async function persistKeywords() { for (const k of keywords.value) await put('keywords', k); }
export async function persistWishlist(w: WishItem) { await put('wishlist', w); }

/* ---- Appearance / theme (§ theme switcher) ---- */
export type ThemeChoice = 'dark'|'light'|'system';
const THEME_COLOR: Record<'dark'|'light', string> = { dark: '#0e0a06', light: '#faf6ee' };

function systemPrefersLight(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
}
function resolveTheme(t: ThemeChoice): 'dark'|'light' { return t === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : t; }
function readInitialTheme(): ThemeChoice {
  try { const v = localStorage.getItem('gk_theme'); if (v === 'dark' || v === 'light' || v === 'system') return v; } catch {}
  return 'dark';
}

export const theme = signal<ThemeChoice>(readInitialTheme());

export function applyTheme() {
  const resolved = resolveTheme(theme.value);
  try {
    document.documentElement.setAttribute('data-theme', resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[resolved]);
  } catch { /* SSR / no DOM — ignore */ }
}

export async function setTheme(t: ThemeChoice) {
  theme.value = t;
  try { localStorage.setItem('gk_theme', t); } catch {}
  applyTheme();
  await setSetting('theme', t);
}

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (theme.value === 'system') applyTheme(); });
}

applyTheme();
