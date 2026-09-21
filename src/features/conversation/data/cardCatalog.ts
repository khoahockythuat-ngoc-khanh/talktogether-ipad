import { CARD_BANKS } from './cardBanks';
import { PICTOGRAM_LABEL_ALIASES } from './constants';
import { TOPICS } from './topics';
import type { BankCard, Card, CardDefinition, CoreCardCategory } from '../types';

const CARD_CATEGORIES = ['topic', 'action', 'emotion'] as const satisfies readonly CoreCardCategory[];

const CARD_ALIASES: Partial<Record<string, readonly string[]>> = {
  'Ăn thêm': ['Muốn thêm', 'Thêm nữa'],
  'Uống thêm': ['Muốn thêm', 'Thêm nước'],
  'No rồi': ['No', 'Đủ rồi'],
  'Chơi cầu trượt': ['Cầu trượt', 'Chơi sân chơi'],
  'Rất thích': ['Thích nhiều'],
  'Không thích': ['Không muốn'],
  'Chỗ nghỉ': ['Ghế nghỉ', 'Nơi nghỉ'],
  'Nói nhỏ': ['Nói khẽ'],
};

function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cardId(category: CoreCardCategory, label: string): string {
  return `${category}-${slug(label)}`;
}

function addCard(
  cards: Map<string, CardDefinition>,
  [icon, label]: BankCard,
  category: CoreCardCategory,
  context: string,
): void {
  const id = cardId(category, label);
  const existing = cards.get(id);
  const contexts = new Set(existing?.contexts || []);
  contexts.add(context);

  cards.set(id, {
    id,
    icon,
    label,
    category,
    pictogramLabel: PICTOGRAM_LABEL_ALIASES[label] || label,
    aliases: CARD_ALIASES[label] || [],
    contexts: [...contexts].sort(),
  });
}

function buildCatalog(): readonly CardDefinition[] {
  const cards = new Map<string, CardDefinition>();

  Object.entries(CARD_BANKS).forEach(([bankKey, bank]) => {
    CARD_CATEGORIES.forEach((category) => {
      bank[category].forEach((card) => addCard(cards, card, category, `bank:${bankKey}`));
    });
  });

  TOPICS.forEach((topic) => {
    topic.cards.forEach(([icon, label, category]) => {
      addCard(cards, [icon, label], category, `topic:${topic.id}`);
    });
  });

  return [...cards.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export const CARD_CATALOG = buildCatalog();
export const CARD_CATALOG_BY_ID = new Map(CARD_CATALOG.map((card) => [card.id, card]));
export const CARD_CATALOG_BY_LABEL = new Map(CARD_CATALOG.map((card) => [card.label, card]));

export function getCardDefinition(labelOrId: string): CardDefinition | null {
  return CARD_CATALOG_BY_ID.get(labelOrId) || CARD_CATALOG_BY_LABEL.get(labelOrId) || null;
}

export function cardIdForLabel(label: string): string {
  return getCardDefinition(label)?.id || `unknown-${slug(label)}`;
}

export function cardIdsForLabels(labels: readonly string[]): string[] {
  return labels.map(cardIdForLabel);
}

export function cardToDefinition(card: Card): CardDefinition | null {
  return getCardDefinition(card[1]);
}

export function cardToId(card: Card): string {
  return cardToDefinition(card)?.id || `unknown-${slug(card[1])}`;
}

export function labelsForCardIds(cardIds: readonly string[]): string[] {
  return cardIds
    .map((id) => CARD_CATALOG_BY_ID.get(id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function allCardLabelsForCategory(category: CoreCardCategory): string[] {
  return CARD_CATALOG
    .filter((card) => card.category === category)
    .map((card) => card.label);
}

export function bankCardForLabel(category: CoreCardCategory, label: string): BankCard | null {
  const card = getCardDefinition(label);
  if (!card || card.category !== category) return null;
  return [card.icon, card.label];
}
