import { PARENT_QUESTION_LIMIT } from '../data/constants';
import type { Topic, TopicId } from '../types';
import { responseIncludesAny } from './cards';

export function getFollowupQuestions(topic: Topic | null, response: string): string[] {
  const topicQuestions: Record<TopicId, string[]> = {
    school: [
      'Con muốn kể thêm về bạn nào?',
      'Giờ ra chơi con làm gì?',
      'Có bài nào con thấy khó không?',
      'Ai làm con vui ở trường?',
      'Bữa trưa ở trường con ăn gì?',
      'Hoạt động nào ở trường con muốn làm lại?',
      'Ngày mai con muốn làm gì ở lớp?',
    ],
    food: [
      'Con muốn ăn thêm hay đủ rồi?',
      'Có món nào con không thích không?',
      'Con muốn uống gì sau bữa ăn?',
      'Con muốn ăn món đó lần nữa không?',
      'Con muốn thử món nào tiếp theo?',
      'Bữa sau con muốn ăn gì?',
      'Món đó nóng hay lạnh?',
    ],
    activities: [
      'Con muốn làm hoạt động đó với ai?',
      'Con muốn chơi ở đâu?',
      'Con muốn làm tiếp hay dừng lại?',
      'Con thích vẽ, nghe nhạc hay chơi trò chơi?',
      'Điều gì làm hoạt động đó vui?',
      'Con muốn vận động hay nghỉ chút?',
      'Con muốn chơi tiếp hay đổi sang hoạt động khác?',
    ],
    feelings: [
      'Mẹ có thể giúp con thế nào?',
      'Con muốn ở chỗ yên tĩnh hay gần mẹ?',
      'Mẹ nên nói nhỏ hay nói chậm với con?',
      'Con cần nghỉ hay uống nước?',
      'Con muốn ở gần ai lúc này?',
      'Mẹ cần làm gì để con thấy an toàn hơn?',
      'Điều gì làm con buồn hoặc sợ?',
      'Con muốn nghỉ hay nói thêm với mẹ?',
    ],
  };

  const suggested: string[] = [];
  const topicId = topic?.id;
  const positive = responseIncludesAny(response, ['Vui', 'Thích', 'Rất thích', 'Hào hứng', 'Tự hào', 'Ngon', 'Đỡ hơn', 'An toàn', 'Bình tĩnh']);

  if (topic?.id === 'school') {
    if (responseIncludesAny(response, ['Cô giáo', 'Làm xong', 'Tự hào'])) suggested.push('Con muốn kể thêm về cô giáo không?');
    if (responseIncludesAny(response, ['Bạn', 'Bạn thân', 'Nhóm bạn', 'Chơi cầu trượt'])) suggested.push('Con muốn kể thêm về bạn nào?');
    if (responseIncludesAny(response, ['Khó', 'Cần giúp', 'Giúp con', 'Lo', 'Khó nói'])) suggested.push('Mẹ có thể giúp con ở phần nào?');
    if (responseIncludesAny(response, ['Ăn trưa', 'Cơm', 'Phở', 'Bánh mì', 'Súp', 'No', 'Ngon'])) suggested.push('Bữa trưa ở trường con ăn gì?');
    if (responseIncludesAny(response, ['Sân chơi', 'Chơi', 'Chạy', 'Chờ lượt'])) suggested.push('Giờ ra chơi con làm gì?');
  }

  if (topic?.id === 'food') {
    if (responseIncludesAny(response, ['Nóng', 'Lạnh', 'Mặn', 'Ngọt'])) suggested.push('Món đó nóng hay lạnh?');
    if (responseIncludesAny(response, ['Không thích', 'Khó chịu', 'Chán'])) suggested.push('Có món nào con không thích không?');
    if (responseIncludesAny(response, ['No', 'Đủ rồi', 'Ăn thêm', 'Muốn thêm', 'Ăn ít'])) suggested.push('Con muốn ăn thêm hay đủ rồi?');
    if (responseIncludesAny(response, ['Uống', 'Nước', 'Sữa', 'Nước cam', 'Sinh tố'])) suggested.push('Con muốn uống gì sau bữa ăn?');
    if (positive) suggested.push('Con muốn ăn món đó lần nữa không?');
  }

  if (topic?.id === 'activities') {
    if (responseIncludesAny(response, ['Mẹ', 'Ba', 'Bạn bè', 'Một mình', 'Chơi cầu trượt'])) suggested.push('Con muốn làm hoạt động đó với ai?');
    if (responseIncludesAny(response, ['Sân chơi', 'Ở nhà', 'Ở trường', 'Chỗ yên tĩnh'])) suggested.push('Con muốn chơi ở đâu?');
    if (responseIncludesAny(response, ['Dừng lại', 'Chán', 'Mệt', 'Nghỉ'])) suggested.push('Con muốn làm tiếp hay dừng lại?');
    if (responseIncludesAny(response, ['Vẽ', 'Vẽ tranh', 'Màu sắc', 'Âm nhạc', 'Tạo hình'])) suggested.push('Con thích vẽ, nghe nhạc hay chơi trò chơi?');
    if (responseIncludesAny(response, ['Chạy', 'Đá bóng', 'Cơ thể'])) suggested.push('Con muốn vận động hay nghỉ chút?');
    if (positive) suggested.push('Điều gì làm hoạt động đó vui?');
  }

  if (topic?.id === 'feelings') {
    if (responseIncludesAny(response, ['Mệt', 'Khó chịu', 'Cơ thể', 'Tiếng ồn', 'Ánh sáng'])) suggested.push('Trong người con có mệt hay khó chịu không?');
    if (responseIncludesAny(response, ['Nghỉ', 'Uống nước', 'Chỗ nghỉ', 'Ghế nghỉ', 'Đỡ hơn'])) suggested.push('Con cần nghỉ hay uống nước?');
    if (responseIncludesAny(response, ['Mẹ', 'Muốn ôm', 'Ngồi gần', 'An toàn', 'Bình tĩnh', 'Lo'])) suggested.push('Con muốn ở chỗ yên tĩnh hay gần mẹ?');
    if (responseIncludesAny(response, ['Nói nhỏ', 'Nói chậm', 'Khó nói', 'Không biết'])) suggested.push('Mẹ nên nói nhỏ hay nói chậm với con?');
    if (responseIncludesAny(response, ['Buồn', 'Giận', 'Sợ'])) suggested.push('Điều gì làm con buồn hoặc sợ?');
    if (responseIncludesAny(response, ['Cần giúp', 'Giúp con'])) suggested.push('Mẹ có thể giúp con thế nào?');
  }

  if (positive) suggested.push('Điều gì làm con vui nhất?');
  suggested.push('Con có muốn kể thêm cho mẹ không?');

  return [...suggested, ...(topicId ? topicQuestions[topicId] : [])]
    .filter((question, index, list) => list.indexOf(question) === index)
    .slice(0, PARENT_QUESTION_LIMIT);
}
