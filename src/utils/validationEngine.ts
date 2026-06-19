import { useAppStore } from '../store/useAppStore';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  researcherId: string;
  projectId?: string;
  yearMonth: string;
}

export const useValidation = () => {
  const researchers = useAppStore(state => state.researchers);
  const participations = useAppStore(state => state.participations);

  const getIssues = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    researchers.forEach(researcher => {
      if (researcher.researchFields.length > 2) {
        issues.push({
          type: 'warning',
          message: `동시 과제 참여 제한 초과(연구 분야 3개 이상)`,
          researcherId: researcher.id,
          yearMonth: 'ALL'
        });
      }

      const researcherParticipations = participations.filter(p => p.researcherId === researcher.id);
      const months = Array.from(new Set(researcherParticipations.map(p => p.yearMonth)));

      months.forEach(month => {
        const monthParticipations = researcherParticipations.filter(p => p.yearMonth === month);
        const totalRate = monthParticipations.reduce((sum, p) => sum + p.rate, 0);

        // 1. 재직 기간 검증
        const isEmployed = checkIsEmployed(researcher, month);
        if (!isEmployed && totalRate > 0) {
          issues.push({
            type: 'error',
            message: `[${month}] 재직 기간 외 과제 배정 불가 (현재 참여율 ${totalRate}%)`,
            researcherId: researcher.id,
            yearMonth: month
          });
        }

        // 2. 참여율 100% 초과 검증
        if (totalRate > 100) {
          issues.push({
            type: 'error',
            message: `[${month}] 참여율 100% 초과 (총합: ${totalRate}%)`,
            researcherId: researcher.id,
            yearMonth: month
          });
        }

        // 3. 동시 과제 2개 초과 검증
        const activeProjectsCount = monthParticipations.filter(p => p.rate > 0).length;
        if (activeProjectsCount > 2) {
          issues.push({
            type: 'warning',
            message: `[${month}] 동시 과제 참여 제한 초과(${activeProjectsCount}개)`,
            researcherId: researcher.id,
            yearMonth: month
          });
        }
      });
    });

    return issues;
  };

  return { getIssues };
};

const checkIsEmployed = (researcher: any, yearMonth: string) => {
  const joinMonth = researcher.joinDate.substring(0, 7);
  if (yearMonth < joinMonth) return false;

  if (researcher.leaveDate) {
    const leaveMonth = researcher.leaveDate.substring(0, 7);
    if (yearMonth > leaveMonth) return false;
  }

  return true;
};
