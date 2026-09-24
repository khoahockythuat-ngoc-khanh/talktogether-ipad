import { TOPICS } from '../data/topics';
import { cardToId, labelsForCardIds } from '../data/cardCatalog';
import type { AiProfileContext, Card, ChildProfile, Topic } from '../types';

const PROFILE_STORAGE_KEY = 'talktogether-child-profile-v1';
const MAX_RECENT_CARDS = 16;

function nowIso(): string {
  return new Date().toISOString();
}

function emptyProfile(): ChildProfile {
  return {
    childName: 'An',
    version: 1,
    updatedAt: nowIso(),
    topicCounts: {},
    cardCounts: {},
    questionCounts: {},
    recentCardIds: [],
  };
}

function cleanProfile(value: unknown): ChildProfile {
  if (!value || typeof value !== 'object') return emptyProfile();
  const profile = value as Partial<ChildProfile>;

  return {
    childName: typeof profile.childName === 'string' ? profile.childName : 'An',
    version: 1,
    updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : nowIso(),
    topicCounts: profile.topicCounts || {},
    cardCounts: profile.cardCounts || {},
    questionCounts: profile.questionCounts || {},
    recentCardIds: Array.isArray(profile.recentCardIds) ? profile.recentCardIds.filter((id): id is string => typeof id === 'string') : [],
  };
}

export function loadChildProfile(): ChildProfile {
  if (typeof window === 'undefined') return emptyProfile();

  try {
    return cleanProfile(JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || 'null'));
  } catch {
    return emptyProfile();
  }
}

export function saveChildProfile(profile: ChildProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function increment(record: Record<string, number>, key: string): Record<string, number> {
  return { ...record, [key]: (record[key] || 0) + 1 };
}

function topKeys(record: Record<string, number>, limit: number): string[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

export function recordTopicUse(profile: ChildProfile, topic: Topic): ChildProfile {
  return {
    ...profile,
    updatedAt: nowIso(),
    topicCounts: {
      ...profile.topicCounts,
      [topic.id]: (profile.topicCounts[topic.id] || 0) + 1,
    },
  };
}

export function recordConversationTurn(
  profile: ChildProfile,
  topic: Topic,
  question: string,
  cards: readonly Card[],
): ChildProfile {
  const cardIds = cards.filter((card) => card[2] !== 'quick').map(cardToId);
  const nextCardCounts = cardIds.reduce((counts, id) => increment(counts, id), profile.cardCounts);
  const recentCardIds = [...cardIds, ...profile.recentCardIds.filter((id) => !cardIds.includes(id))].slice(0, MAX_RECENT_CARDS);

  return {
    ...profile,
    updatedAt: nowIso(),
    topicCounts: {
      ...profile.topicCounts,
      [topic.id]: (profile.topicCounts[topic.id] || 0) + 1,
    },
    questionCounts: increment(profile.questionCounts, question),
    cardCounts: nextCardCounts,
    recentCardIds,
  };
}

export function profileToAiContext(profile: ChildProfile): AiProfileContext {
  const frequentCardIds = topKeys(profile.cardCounts, 12);
  const frequentTopicIds = topKeys(profile.topicCounts as Record<string, number>, 4);
  const repeatedQuestions = topKeys(profile.questionCounts, 8);

  return {
    childName: profile.childName,
    frequentCards: labelsForCardIds(frequentCardIds),
    recentCards: labelsForCardIds(profile.recentCardIds.slice(0, 8)),
    frequentTopics: frequentTopicIds.map((id) => TOPICS.find((topic) => topic.id === id)?.title || id),
    repeatedQuestions,
  };
}
