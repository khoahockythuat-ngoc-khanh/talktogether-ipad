import type { AiProfileContext, Card, ConversationTurn, Topic } from '../types';

type AiCardsResponse = {
  ok: boolean;
  cards?: Card[];
};

type AiFollowupsResponse = {
  ok: boolean;
  questions?: string[];
};

async function postAi<T>(body: unknown): Promise<T | null> {
  try {
    const response = await fetch('/api/ai/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function requestAiCards(topic: Topic, question: string, profile?: AiProfileContext): Promise<Card[] | null> {
  const data = await postAi<AiCardsResponse>({
    type: 'cards',
    topicId: topic.id,
    question,
    profile,
  });

  if (!data?.ok || !Array.isArray(data.cards) || data.cards.length !== 12) return null;
  return data.cards;
}

export async function requestAiFollowups(
  topic: Topic,
  question: string,
  response: string,
  turns: readonly ConversationTurn[],
  profile?: AiProfileContext,
): Promise<string[] | null> {
  const data = await postAi<AiFollowupsResponse>({
    type: 'followups',
    topicId: topic.id,
    question,
    response,
    previousQuestions: turns.map((turn) => turn.question),
    profile,
  });

  if (!data?.ok || !Array.isArray(data.questions) || data.questions.length === 0) return null;
  return data.questions;
}
