import type { Researcher } from '../store/useAppStore';

/**
 * 특정 기준 시점(연도, 월, 일자)에 해당하는 연구원의 직급을 조회합니다.
 * @param researcher 연구원 정보
 * @param dateOrYearOrMonth 조회 기준 시점 ("YYYY", "YYYY-MM", "YYYY-MM-DD" 중 하나)
 */
export const getRankAtDate = (researcher: Researcher, dateOrYearOrMonth: string): string => {
  const history = researcher.rankHistory || {};
  const keys = Object.keys(history).sort();
  if (keys.length === 0) return '연구원';

  // 기준 시점을 YYYY-MM-DD 형태로 변환/패딩하여 비교 대상을 구합니다.
  let target = dateOrYearOrMonth;
  if (target.length === 4) {
    // 연도 검색인 경우 해당 연도의 말일을 기준으로 합니다.
    target = `${target}-12-31`;
  } else if (target.length === 7) {
    // 월 검색인 경우 해당 월의 말일을 기준으로 합니다.
    target = `${target}-31`;
  }

  // 기본 반환값은 최초 등록된 이력의 직급
  let currentRank = history[keys[0]] || '연구원';

  for (const key of keys) {
    // 이력의 키(시작일)를 비교가 가능하도록 패딩합니다.
    let cmpKey = key;
    if (cmpKey.length === 4) {
      // "2023" -> "2023-01-01"
      cmpKey = `${cmpKey}-01-01`;
    } else if (cmpKey.length === 7) {
      // "2023-03" -> "2023-03-01"
      cmpKey = `${cmpKey}-01`;
    }

    if (cmpKey <= target) {
      currentRank = history[key];
    } else {
      break;
    }
  }

  return currentRank;
};
