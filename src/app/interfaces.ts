export type GameLevel = 'level-1' | 'level-2' | 'level-3' | 'level-4';

export interface GameLevelOption {
  value: GameLevel;
  label: string;
}

export const GAME_LEVELS: readonly GameLevelOption[] = [
  { value: 'level-1', label: 'Level 1' },
  { value: 'level-2', label: 'Level 2' },
  { value: 'level-3', label: 'Level 3' },
  { value: 'level-4', label: 'Level 4' },
];

export interface ShopOffer {
  visible: () => boolean;
  id: string;
  name: string;
  cost: number;
  tooltip: string;
  action: () => void;
}
