import type { ValidationIssue } from '../utils/validationEngine';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, XCircle } from 'lucide-react';

export default function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
  const researchers = useAppStore(state => state.researchers);

  if (issues.length === 0) {
    return (
      <div className="panel" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50' }}>
        <h3 style={{ color: '#4CAF50', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ 국세청/KOITA 실사 리스크 0건
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          모든 데이터가 정합성 규칙을 준수하고 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ backgroundColor: 'var(--color-error-bg)', borderColor: 'var(--color-error)' }}>
      <h3 style={{ color: 'var(--color-error)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={20} />
        실사 리스크 경고 ({issues.length}건 발견)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {issues.map((issue, idx) => {
          const researcher = researchers.find(r => r.id === issue.researcherId);
          const icon = issue.type === 'error' ? <XCircle size={16} color="#FF6B6B"/> : <AlertTriangle size={16} color="#FFD93D"/>;
          const color = issue.type === 'error' ? '#FF6B6B' : '#FFD93D';
          
          return (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: `3px solid ${color}`
            }}>
              {icon}
              <span style={{ fontWeight: 'bold' }}>{researcher?.name || '알 수 없음'} ({issue.yearMonth})</span>
              <span>-</span>
              <span>{issue.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
