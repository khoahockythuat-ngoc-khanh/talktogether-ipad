import {
  CARD_BANKS,
  CONTEXTUAL_QUESTION_CARD_BANK_KEYS,
  QUESTION_CARD_BANK_KEYS,
  TOPIC_DEFAULT_CARD_BANK_KEYS,
  type CardBankKey,
} from '../data/cardBanks';
import { CARD_CATEGORY_ORDER } from '../data/constants';
import type { BankCard, Card, CardBank, Topic } from '../types';

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function responseIncludesAny(response: string, terms: readonly string[]): boolean {
  return terms.some((term) => response.includes(term));
}

function getCardBankKey(topic: Topic | null | undefined, question: string): CardBankKey {
  const topicId = topic?.id;
  const contextualBank = CONTEXTUAL_QUESTION_CARD_BANK_KEYS[question];
  if (contextualBank) return (topicId ? contextualBank[topicId] : undefined) || contextualBank.fallback;

  if (QUESTION_CARD_BANK_KEYS[question]) return QUESTION_CARD_BANK_KEYS[question];

  const text = (question || '').toLowerCase();

  if (includesAny(text, ['giờ ra chơi', 'ra chơi'])) return 'schoolPlay';
  if (includesAny(text, ['bài nào', 'thấy khó', 'phần nào'])) return topic?.id === 'school' ? 'schoolDifficulty' : 'generalMore';
  if (includesAny(text, ['cô giáo', 'được khen'])) return topic?.id === 'school' ? 'schoolPeopleMoment' : 'feelingsHelp';
  if (includesAny(text, ['bữa trưa'])) return topic?.id === 'school' ? 'schoolLunch' : 'foodMeals';
  if (includesAny(text, ['học', 'môn'])) return 'schoolSubjects';
  if (includesAny(text, ['chơi với ai', 'với ai', 'bạn nào', 'cùng ai', 'ở gần ai'])) {
    if (topic?.id === 'school') return 'schoolFriends';
    if (topic?.id === 'feelings') return 'feelingsNear';
    return 'activitiesPartner';
  }
  if (topic?.id === 'feelings' && includesAny(text, ['trong người', 'cơ thể'])) return 'feelingsBody';
  if (topic?.id === 'feelings' && includesAny(text, ['yên tĩnh', 'gần mẹ', 'an toàn'])) return 'feelingsQuiet';
  if (topic?.id === 'feelings' && includesAny(text, ['nói nhỏ', 'nói chậm'])) return 'feelingsSpeak';
  if (topic?.id === 'feelings' && includesAny(text, ['buồn', 'sợ', 'giận'])) return 'feelingsUpset';
  if (topic?.id === 'feelings' && includesAny(text, ['nghỉ', 'uống nước'])) return 'feelingsRest';
  if (includesAny(text, ['ăn thêm', 'đủ rồi'])) return 'foodEnough';
  if (includesAny(text, ['không thích'])) return topic?.id === 'food' ? 'foodDislike' : 'feelingsUpset';
  if (topic?.id === 'food' && includesAny(text, ['thử tiếp theo', 'bữa sau'])) return 'foodNextMeal';
  if (includesAny(text, ['nóng', 'lạnh', 'mặn', 'ngọt'])) return 'foodTemperature';
  if (includesAny(text, ['uống'])) return 'foodDrink';
  if (includesAny(text, ['ăn gì', 'đã ăn'])) return 'foodMeals';
  if (includesAny(text, ['món', 'ngon'])) return 'foodTaste';
  if (includesAny(text, ['không thoải mái'])) return 'feelingsUncomfortable';
  if (includesAny(text, ['cảm thấy'])) return 'feelingsNow';
  if (includesAny(text, ['giúp'])) return 'feelingsHelp';
  if (includesAny(text, ['vui nhất'])) return topic?.id === 'school' ? 'schoolHappiness' : 'happinessReason';
  if (includesAny(text, ['ở đâu'])) return 'activitiesPlace';
  if (includesAny(text, ['làm tiếp', 'dừng lại', 'chơi tiếp'])) return 'activitiesContinue';
  if (topic?.id === 'activities' && includesAny(text, ['thích nhất'])) return 'activitiesFavorite';
  if (includesAny(text, ['vẽ', 'nhạc', 'trò chơi'])) return 'activitiesCreative';
  if (includesAny(text, ['vận động'])) return 'activitiesMovement';
  if (includesAny(text, ['hoạt động', 'làm gì'])) return 'activitiesChoice';
  if (includesAny(text, ['nghỉ', 'nói thêm'])) return 'feelingsComfort';

  return topicId ? TOPIC_DEFAULT_CARD_BANK_KEYS[topicId] : 'generalMore';
}

function uniqueBankCards(...groups: Array<readonly BankCard[] | undefined>): BankCard[] {
  const seen = new Set<string>();
  return groups.flatMap((group) => group || []).filter((card) => {
    if (seen.has(card[1])) return false;
    seen.add(card[1]);
    return true;
  });
}

function getCardPoolsForQuestion(topic: Topic | null | undefined, question: string): CardBank {
  const bankKey = getCardBankKey(topic, question);
  const bank = CARD_BANKS[bankKey] || CARD_BANKS.generalMore;
  const defaultBank = topic?.id ? CARD_BANKS[TOPIC_DEFAULT_CARD_BANK_KEYS[topic.id]] : CARD_BANKS.generalMore;

  return {
    topic: uniqueBankCards(
      bank.topic,
      defaultBank.topic,
      topic?.cards.filter((card) => card[2] === 'topic').map(([icon, label]) => [icon, label] as BankCard),
    ),
    action: uniqueBankCards(
      bank.action,
      defaultBank.action,
      topic?.cards.filter((card) => card[2] === 'action').map(([icon, label]) => [icon, label] as BankCard),
    ),
    emotion: uniqueBankCards(
      bank.emotion,
      defaultBank.emotion,
      topic?.cards.filter((card) => card[2] === 'emotion').map(([icon, label]) => [icon, label] as BankCard),
    ),
  };
}

function getCategoryPage(cards: readonly BankCard[], page: number): readonly BankCard[] {
  if (cards.length <= 4) return cards;

  const pageCount = Math.ceil(cards.length / 4);
  const start = (page % pageCount) * 4;
  const pageCards = cards.slice(start, start + 4);
  if (pageCards.length === 4) return pageCards;

  return [...pageCards, ...cards.slice(0, 4 - pageCards.length)];
}

export function getCardPageCount(topic: Topic | null | undefined, question: string): number {
  const pools = getCardPoolsForQuestion(topic, question);
  return Math.max(1, ...CARD_CATEGORY_ORDER.map((category) => Math.ceil(pools[category].length / 4)));
}

export function getCardsForQuestion(topic: Topic | null | undefined, question: string, page = 0): Card[] {
  const pools = getCardPoolsForQuestion(topic, question);

  return CARD_CATEGORY_ORDER.flatMap((category) => (
    getCategoryPage(pools[category] || [], page).map(([icon, label]) => [icon, label, category] as Card)
  ));
}
