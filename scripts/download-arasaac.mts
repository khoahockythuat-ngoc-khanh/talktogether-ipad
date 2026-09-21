import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.join(process.cwd(), 'public', 'pictograms', 'arasaac');

type PictogramSearchResult = {
  _id?: string | number;
  id?: string | number;
  idPictogram?: string | number;
};
type DownloadedPictogram = {
  label: string;
  query: string;
  id: string | number;
  file: string;
  source: string;
};
type DownloadFailure = {
  label: string;
  query: string;
  error: string;
};

const labelQueries = {
  'Lớp học': 'classroom',
  'Sân trường': 'schoolyard',
  'Cô giáo': 'teacher',
  'Bạn bè': 'friends',
  'Học bài': 'study',
  'Chơi': 'play',
  'Ăn trưa': 'lunch',
  'Vẽ': 'draw',
  'Vui': 'happy',
  'Thích': 'favorite',
  'Mệt': 'tired',
  'Bình thường': 'calm',
  'Toán': 'maths',
  'Tiếng Việt': 'language',
  'Tiếng Anh': 'English',
  'Mỹ thuật': 'art',
  'Đọc': 'read',
  'Viết': 'write',
  'Đếm số': 'count',
  'Tô màu': 'color',
  'Khó': 'difficult',
  'Dễ': 'easy',
  'Bạn thân': 'best friend',
  'Nhóm bạn': 'group',
  'Sân chơi': 'playground',
  'Chơi cầu trượt': 'playground slide',
  'Chia sẻ': 'share',
  'Nói chuyện': 'talk',
  'Đợi bạn': 'wait',
  'Ngại': 'shy',
  'Buồn': 'sad',
  'Được khen': 'reward',
  'Bài học': 'lesson',
  'Làm xong': 'finish',
  'Kể chuyện': 'tell story',
  'Hào hứng': 'excited',
  'Tự hào': 'proud',
  'Rất thích': 'excited',
  'Góc sách': 'books',
  'Bàn vẽ': 'drawing table',
  'Chơi tiếp': 'play',
  'Đọc sách': 'read book',
  'Vẽ tranh': 'paint',
  'Mong chờ': 'wait',
  'Lo': 'worried',
  'Cơm': 'rice',
  'Phở': 'noodles',
  'Bánh mì': 'sandwich',
  'Súp': 'soup',
  'Ăn': 'eat',
  'Uống': 'drink',
  'Ăn thêm': 'more',
  'Uống thêm': 'more',
  'Muốn thêm': 'more',
  'Đủ rồi': 'enough',
  'Ngon': 'delicious',
  'Không thích': 'dislike',
  'No': 'full',
  'Trái cây': 'fruit',
  'Sữa chua': 'yogurt',
  'Chọn món': 'choose',
  'Để sau': 'later',
  'Mặn': 'salty',
  'Ngọt': 'sweet',
  'Nóng': 'hot',
  'Lạnh': 'cold',
  'Ăn hết': 'finish eating',
  'Ăn ít': 'eat little',
  'Uống nước': 'drink water',
  'Nghỉ chút': 'rest',
  'Khó chịu': 'uncomfortable',
  'Món đó': 'food',
  'Bữa sau': 'meal',
  'Ở nhà': 'home',
  'Nhà': 'home',
  'Ở trường': 'school',
  'Đổi món': 'change',
  'Nước': 'water',
  'Sữa': 'milk',
  'Nước cam': 'orange juice',
  'Sinh tố': 'juice',
  'Mát': 'cool',
  'Đá bóng': 'football',
  'Xếp hình': 'puzzle',
  'Làm cùng mẹ': 'mother',
  'Làm tiếp': 'continue',
  'Dừng lại': 'stop',
  'Chán': 'bored',
  'Mẹ': 'mother',
  'Ba': 'father',
  'Một mình': 'alone',
  'Chờ lượt': 'wait turn',
  'Màu sắc': 'colors',
  'Âm nhạc': 'music',
  'Trò chơi': 'game',
  'Cười': 'laugh',
  'Chạy': 'run',
  'Tạo hình': 'build',
  'Thắng lượt': 'win',
  'Cơ thể': 'body',
  'Tiếng ồn': 'noise',
  'Ánh sáng': 'light',
  'Phòng học': 'classroom',
  'Nghỉ': 'rest',
  'Muốn ôm': 'hug',
  'Nói nhỏ': 'whisper',
  'Giận': 'angry',
  'Sợ': 'scared',
  'Chỗ yên tĩnh': 'quiet place',
  'Giúp con': 'help',
  'Nói chậm': 'speak slowly',
  'Đỡ hơn': 'better',
  'Ghế nghỉ': 'chair',
  'Ngồi gần': 'sit',
  'Thở chậm': 'breathe',
  'Nói thêm': 'talk',
  'An toàn': 'safe',
  'Bình tĩnh': 'calm',
  'Khó nói': 'difficult',
  'Kể thêm': 'tell story',
  'Chỉ tay': 'point',
  'Nói lại': 'repeat',
  'Món ăn': 'food',
} satisfies Record<string, string>;

function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

function pictogramId(item: unknown): string | number | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const candidate = item as PictogramSearchResult;
  return candidate._id ?? candidate.id ?? candidate.idPictogram;
}

async function findPictogramCandidates(query: string): Promise<Array<string | number>> {
  const encoded = encodeURIComponent(query);
  const responses = await Promise.allSettled([
    fetchJson(`https://api.arasaac.org/v1/pictograms/en/bestsearch/${encoded}`),
    fetchJson(`https://api.arasaac.org/v1/pictograms/en/search/${encoded}`),
  ]);
  const items = responses.flatMap((response) => {
    if (response.status !== 'fulfilled') return [];
    return Array.isArray(response.value) ? response.value : [response.value];
  });

  const seen = new Set();
  return items
    .map(pictogramId)
    .filter((id): id is string | number => id != null)
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

async function fetchPictogramImage(id: string | number): Promise<{ image: Buffer; url: string }> {
  const candidates = [
    `https://static.arasaac.org/pictograms/${id}/${id}_500.png`,
    `https://static.arasaac.org/pictograms/${id}/${id}_300.png`,
    `https://static.arasaac.org/pictograms/${id}/${id}_2500.png`,
    `https://api.arasaac.org/v1/pictograms/${id}`,
  ];

  let lastError: unknown;
  for (const url of candidates) {
    try {
      const image = await fetchBuffer(url);
      return { image, url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Unable to fetch pictogram ${id}`);
}

async function downloadPictogram(label: string, query: string): Promise<DownloadedPictogram> {
  const ids = await findPictogramCandidates(query);
  if (ids.length === 0) throw new Error(`No ARASAAC result for "${label}" (${query})`);

  let lastError: unknown;
  for (const id of ids.slice(0, 8)) {
    try {
      const { image, url } = await fetchPictogramImage(id);
      const filename = `${slug(label)}.png`;
      await writeFile(path.join(outputDir, filename), image);

      return { label, query, id, file: `/pictograms/arasaac/${filename}`, source: url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Unable to download pictogram for "${label}"`);
}

await mkdir(outputDir, { recursive: true });

const manifest: Record<string, DownloadedPictogram> = {};
const failures: DownloadFailure[] = [];

for (const [label, query] of Object.entries(labelQueries)) {
  try {
    const item = await downloadPictogram(label, query);
    manifest[label] = item;
    console.log(`downloaded ${label} -> ${item.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ label, query, error: message });
    console.warn(`failed ${label}: ${message}`);
  }
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), pictograms: manifest, failures }, null, 2)
);

await writeFile(
  path.join(outputDir, 'NOTICE.txt'),
  [
    'ARASAAC pictograms',
    '',
    'Pictograms author: Sergio Palao.',
    'Origin: ARASAAC (https://www.arasaac.org).',
    'License: Creative Commons BY-NC-SA.',
    'Owner: Gobierno de Aragon (Spain).',
    '',
    'Images in this folder were downloaded from https://static.arasaac.org for this TalkTogether prototype.',
  ].join('\n')
);

if (failures.length > 0) {
  console.warn(`${failures.length} downloads failed. Emoji fallback will still work for those cards.`);
}
