import { useAppStore } from '../store/useAppStore';
import { format, eachMonthOfInterval, startOfYear, endOfYear, subYears, addYears } from 'date-fns';

export default function Dashboard() {
  const { researchers, projects, participations } = useAppStore();

  // Generate Timeline Months (Last 2 years + Current Year + Next Year)
  const today = new Date();
  const startD = startOfYear(subYears(today, 2));
  const endD = endOfYear(addYears(today, 1));
  
  const months = eachMonthOfInterval({ start: startD, end: endD });
  const monthStrings = months.map(m => format(m, 'yyyy-MM'));

  // Calculate cell width
  const cellWidth = 40;

  return (
    <div>
      <div className="panel" style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--color-charcoal)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>총 연구원</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{researchers.length}명</p>
        </div>
        <div style={{ flex: 1, backgroundColor: 'var(--color-charcoal)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>총 연구 과제</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{projects.length}건</p>
        </div>
        <div style={{ flex: 1, backgroundColor: 'var(--color-charcoal)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>매핑된 참여율 데이터</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{participations.length}건</p>
        </div>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>통합 타임라인 (Gantt)</h2>
        
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          {/* Timeline Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <div style={{ width: '200px', flexShrink: 0, fontWeight: 'bold' }}>항목</div>
            <div style={{ display: 'flex' }}>
              {monthStrings.map(m => (
                <div key={m} style={{ width: `${cellWidth}px`, flexShrink: 0, fontSize: '0.7rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {m.substring(2)}
                </div>
              ))}
            </div>
          </div>

          {/* Researchers Timeline */}
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-slate-blue-light)', margin: '1rem 0 0.5rem 0' }}>연구원 소속 기간</h3>
          {researchers.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', height: '30px', marginBottom: '4px' }}>
              <div style={{ width: '200px', flexShrink: 0, fontSize: '0.9rem', paddingRight: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.name}
              </div>
              <div style={{ display: 'flex', height: '100%' }}>
                {monthStrings.map(m => {
                  const isEmployed = m >= r.joinDate.substring(0,7) && (!r.leaveDate || m <= r.leaveDate.substring(0,7));
                  return (
                    <div key={m} style={{ 
                      width: `${cellWidth}px`, 
                      flexShrink: 0, 
                      backgroundColor: isEmployed ? 'rgba(107, 114, 142, 0.6)' : 'transparent',
                      borderLeft: '1px solid rgba(255,255,255,0.05)',
                      height: '100%',
                      borderRadius: isEmployed ? '4px' : '0'
                    }} />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Projects Timeline */}
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-warning)', margin: '1rem 0 0.5rem 0' }}>연구 과제 일정</h3>
          {projects.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', height: '30px', marginBottom: '4px' }}>
              <div style={{ width: '200px', flexShrink: 0, fontSize: '0.9rem', paddingRight: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </div>
              <div style={{ display: 'flex', height: '100%' }}>
                {monthStrings.map(m => {
                  const isActive = m >= p.startDate.substring(0,7) && m <= p.endDate.substring(0,7);
                  return (
                    <div key={m} style={{ 
                      width: `${cellWidth}px`, 
                      flexShrink: 0, 
                      backgroundColor: isActive ? 'rgba(255, 217, 61, 0.4)' : 'transparent',
                      borderLeft: '1px solid rgba(255,255,255,0.05)',
                      height: '100%',
                      borderRadius: isActive ? '4px' : '0'
                    }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
