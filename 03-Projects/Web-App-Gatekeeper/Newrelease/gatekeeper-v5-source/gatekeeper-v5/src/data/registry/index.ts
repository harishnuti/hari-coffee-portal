import type { Registry } from './types';
import { LAVENDER_SG } from './lavender-sg';
import { CHINATOWN_SG } from './chinatown-sg';
import { RAFFLES_PLACE_SG } from './raffles-place-sg';
import { TANJONG_PAGAR_SG } from './tanjong-pagar-sg';
import { JOHOR_BAHRU_MY } from './johor-bahru-my';

export const REGISTRIES: Registry[] = [
  LAVENDER_SG, CHINATOWN_SG, RAFFLES_PLACE_SG, TANJONG_PAGAR_SG, JOHOR_BAHRU_MY,
];
export const getRegistry = (slug: string) => REGISTRIES.find(r => r.slug === slug) ?? null;
export * from './types';
