import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppStore } from '../store/useAppStore';

export const generateAiSample = async (promptType: 'description' | 'note', projectContext: string) => {
  const apiKey = useAppStore.getState().geminiApiKey;
  if (!apiKey) {
    throw new Error('Gemini API Key가 설정되지 않았습니다. 설정 화면에서 API Key를 입력해주세요.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemContext = `당신은 디지털 광고대행사의 부설연구소 소속 수석 연구원입니다. 
주요 연구 분야는 AI 카피라이팅, 데이터 드리븐 퍼포먼스 마케팅, AD Tech, 마케팅 오토메이션 등입니다.
작성하는 문서는 KOITA(한국산업기술진흥협회) 및 국세청 제출을 위한 공식 R&D 증빙 서류입니다. 전문적이고 구체적인 기술 용어를 사용하며, 명확한 개조식 또는 짧은 서술형으로 작성하세요.`;

  let prompt = '';
  if (promptType === 'description') {
    prompt = `${systemContext}\n\n다음 과제명에 대한 '연구계획서 서론 및 핵심 연구 내용'을 3~4문장으로 작성해 주세요.\n과제명: ${projectContext}`;
  } else {
    prompt = `${systemContext}\n\n다음 과제명에 대한 '주간 연구 노트 본문 샘플(실험 및 개발 내용)'을 3~4문장으로 작성해 주세요.\n과제명: ${projectContext}`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI 샘플 생성 실패: ${error.message}`);
  }
};
