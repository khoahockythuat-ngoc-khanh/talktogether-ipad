import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { allCardLabelsForCategory, bankCardForLabel } from '../../../../src/features/conversation/data/cardCatalog';
import { PARENT_QUESTION_LIMIT } from '../../../../src/features/conversation/data/constants';
import { TOPICS } from '../../../../src/features/conversation/data/topics';
import { getCardsForQuestion } from '../../../../src/features/conversation/logic/cards';
import { getFollowupQuestions } from '../../../../src/features/conversation/logic/followups';
import type { AiProfileContext, Card, CoreCardCategory, Topic, TopicId } from '../../../../src/features/conversation/types';

export const runtime = 'nodejs';

type AiRequest =
  | {
      type: 'cards';
      topicId: TopicId;
      question: string;
      profile?: AiProfileContext;
    }
  | {
      type: 'followups';
      topicId: TopicId;
      question: string;
      response: string;
      previousQuestions?: string[];
      profile?: AiProfileContext;
    };

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const CARD_CATEGORIES = ['topic', 'action', 'emotion'] as const satisfies readonly CoreCardCategory[];
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

function readLocalEnv(name: string): string {
  if (process.env[name]) return process.env[name] || '';

  const envPath = path.join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return '';

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  const prefix = `${name}=`;
  const line = lines.find((item) => item.trim().startsWith(prefix));
  if (!line) return '';

  return line
    .trim()
    .slice(prefix.length)
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function uniq<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function topicById(topicId: TopicId): Topic | null {
  return TOPICS.find((topic) => topic.id === topicId) || null;
}

function fallbackCards(topic: Topic, question: string): Card[] {
  return getCardsForQuestion(topic, question, 0);
}

function validatedCards(topic: Topic, question: string, rawCards: unknown): Card[] {
  const fallback = fallbackCards(topic, question);
  const output: Card[] = [];

  for (const category of CARD_CATEGORIES) {
    const fallbackLabels = fallback
      .filter((card) => card[2] === category)
      .map((card) => card[1]);
    const requestedLabels = Array.isArray((rawCards as Record<string, unknown> | null)?.[category])
      ? ((rawCards as Record<string, unknown>)[category] as unknown[])
      : [];
    const labels = uniq(
      [...requestedLabels.filter((label): label is string => typeof label === 'string'), ...fallbackLabels],
      (label) => label,
    );

    const categoryCards = labels
      .map((label) => bankCardForLabel(category, label))
      .filter((card): card is NonNullable<ReturnType<typeof bankCardForLabel>> => Boolean(card))
      .slice(0, 4)
      .map(([icon, label]) => [icon, label, category] as Card);

    output.push(...categoryCards);
  }

  return output.length === 12 ? output : fallback;
}

function validatedQuestions(rawQuestions: unknown, topic: Topic, response: string): string[] {
  const fallback = getFollowupQuestions(topic, response);
  const questions = Array.isArray(rawQuestions) ? rawQuestions : [];
  return uniq(
    [
      ...questions.filter((question): question is string => (
        typeof question === 'string'
        && question.trim().length >= 8
        && question.trim().endsWith('?')
      )).map((question) => question.trim()),
      ...fallback,
    ],
    (question) => question,
  ).slice(0, PARENT_QUESTION_LIMIT);
}

function jsonFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini response did not contain JSON.');
    return JSON.parse(match[0]);
  }
}

async function callGemini(prompt: string, responseSchema: unknown): Promise<unknown> {
  const apiKey = readLocalEnv('GEMINI_API_KEY');
  if (!apiKey) throw new Error('missing_key');

  const model = readLocalEnv('GEMINI_MODEL') || DEFAULT_MODEL;
  const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: [
            'Bạn là AI hỗ trợ giao tiếp AAC cho trẻ em Việt Nam.',
            'Luôn trả lời bằng tiếng Việt.',
            'Không nói thay trẻ. Chỉ chọn thẻ và câu hỏi giúp người lớn mở cuộc trò chuyện.',
            'Ưu tiên từ ngắn, quen thuộc, cụ thể, phù hợp với trẻ.',
            'Chỉ trả về JSON đúng schema.',
          ].join(' '),
        }],
      },
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  const data = await response.json() as GeminiResponse;
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed: ${response.status}`);

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw new Error('Gemini response was empty.');

  return jsonFromText(text);
}

function profileLines(profile?: AiProfileContext): string[] {
  if (!profile) return [];
  return [
    '',
    `Profile của ${profile.childName}:`,
    profile.frequentTopics.length ? `Chủ đề hay chọn: ${profile.frequentTopics.join(', ')}` : '',
    profile.frequentCards.length ? `Thẻ hay dùng: ${profile.frequentCards.join(', ')}` : '',
    profile.recentCards.length ? `Thẻ dùng gần đây: ${profile.recentCards.join(', ')}` : '',
    profile.repeatedQuestions.length ? `Câu hỏi hay lặp: ${profile.repeatedQuestions.join(' | ')}` : '',
  ].filter(Boolean);
}

function cardPrompt(topic: Topic, question: string, profile?: AiProfileContext): string {
  const allowedLines = CARD_CATEGORIES.map((category) => {
    const labels = allCardLabelsForCategory(category).join(', ');
    const label = category === 'topic' ? 'Chủ đề' : category === 'action' ? 'Hành động' : 'Cảm xúc';
    return `${label}: ${labels}`;
  }).join('\n');
  const localCards = fallbackCards(topic, question);
  const suggestedLines = CARD_CATEGORIES.map((category) => {
    const labels = localCards
      .filter((card) => card[2] === category)
      .map((card) => card[1])
      .join(', ');
    const label = category === 'topic' ? 'Chủ đề' : category === 'action' ? 'Hành động' : 'Cảm xúc';
    return `${label}: ${labels}`;
  }).join('\n');

  return [
    `Chủ đề mẹ đã chọn: ${topic.title}.`,
    `Câu hỏi của mẹ: "${question}"`,
    '',
    'Hãy chọn đúng 4 thẻ cho mỗi cột để An trả lời câu hỏi này.',
    'Cột Chủ đề chỉ gồm người, nơi, vật, món, môn học hoặc hoạt động được nói tới.',
    'Cột Hành động chỉ gồm việc An có thể làm, muốn làm, muốn nhờ hoặc muốn dừng.',
    'Cột Cảm xúc chỉ gồm cảm xúc, sở thích, trạng thái cơ thể hoặc mức độ dễ/khó.',
    'Không đặt cảm xúc vào cột hành động. Không đặt hành động vào cột chủ đề.',
    'Chỉ dùng label có trong danh sách cho phép bên dưới. Không tự tạo label mới.',
    'Ưu tiên bộ gợi ý local vì bộ này đã được map theo ngữ cảnh câu hỏi. Chỉ thay một thẻ nếu thẻ thay thế sát câu hỏi hơn rõ ràng.',
    'Thẻ phải ngắn, quen thuộc, cụ thể và dễ hiểu với trẻ. Tránh thẻ quá chung nếu có thẻ cụ thể hơn.',
    'Nếu profile có dữ liệu, ưu tiên các thẻ quen thuộc của An khi vẫn phù hợp với câu hỏi.',
    ...profileLines(profile),
    '',
    'Bộ gợi ý local theo ngữ cảnh:',
    suggestedLines,
    '',
    'Danh sách cho phép:',
    allowedLines,
    '',
    'Trả về JSON dạng: {"cards":{"topic":["..."],"action":["..."],"emotion":["..."]}}',
  ].join('\n');
}

function followupPrompt(
  topic: Topic,
  question: string,
  response: string,
  previousQuestions: readonly string[],
  profile?: AiProfileContext,
): string {
  return [
    `Chủ đề: ${topic.title}.`,
    `Câu hỏi vừa rồi của mẹ: "${question}"`,
    `An đã chọn/trả lời: "${response}"`,
    previousQuestions.length ? `Các câu đã hỏi trong buổi này: ${previousQuestions.join(' | ')}` : '',
    ...profileLines(profile),
    '',
    `Hãy gợi ý ${PARENT_QUESTION_LIMIT} câu hỏi tiếp theo cho mẹ.`,
    'Câu hỏi phải ngắn, tự nhiên, bằng tiếng Việt, phù hợp để hỏi trẻ.',
    'Mỗi câu chỉ hỏi một ý cụ thể. Ưu tiên hỏi tiếp theo chính thẻ An vừa chọn.',
    'Không hỏi dồn dập, không phán xét, không dùng từ chuyên môn.',
    'Không lặp lại y nguyên câu đã hỏi hoặc câu đã có trong buổi này.',
    'Nếu An chọn cảm xúc khó chịu, mệt, lo, sợ hoặc buồn, ưu tiên câu hỏi hỗ trợ và điều chỉnh môi trường.',
    'Nếu An chọn món ăn, hoạt động hoặc người cụ thể, ưu tiên câu hỏi nối tiếp về chi tiết đó.',
    '',
    'Trả về JSON dạng: {"questions":["...","...","...","...","..."]}',
  ].filter(Boolean).join('\n');
}

const cardsSchema = {
  type: 'OBJECT',
  properties: {
    cards: {
      type: 'OBJECT',
      properties: {
        topic: { type: 'ARRAY', items: { type: 'STRING' } },
        action: { type: 'ARRAY', items: { type: 'STRING' } },
        emotion: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['topic', 'action', 'emotion'],
    },
  },
  required: ['cards'],
};

const followupsSchema = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
  },
  required: ['questions'],
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as AiRequest | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
  }

  const topic = topicById(body.topicId);
  if (!topic) {
    return NextResponse.json({ ok: false, error: 'unknown_topic' }, { status: 400 });
  }

  try {
    if (body.type === 'cards') {
      const result = await callGemini(cardPrompt(topic, body.question, body.profile), cardsSchema) as { cards?: unknown };
      return NextResponse.json({
        ok: true,
        source: 'gemini',
        cards: validatedCards(topic, body.question, result.cards),
      });
    }

    if (body.type === 'followups') {
      const result = await callGemini(
        followupPrompt(topic, body.question, body.response, body.previousQuestions || [], body.profile),
        followupsSchema,
      ) as { questions?: unknown };
      return NextResponse.json({
        ok: true,
        source: 'gemini',
        questions: validatedQuestions(result.questions, topic, body.response),
      });
    }

    return NextResponse.json({ ok: false, error: 'unknown_type' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === 'missing_key' ? 503 : 502;
    return NextResponse.json({
      ok: false,
      error: message === 'missing_key' ? 'missing_gemini_key' : 'gemini_failed',
      detail: message,
      fallback: body.type === 'cards'
        ? { cards: fallbackCards(topic, body.question) }
        : { questions: validatedQuestions([], topic, body.response) },
    }, { status });
  }
}
