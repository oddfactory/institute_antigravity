import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Participation } from '../store/useAppStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';
import { eachMonthOfInterval, format, parse } from 'date-fns';

export default function Participations() {
  const { researchers, projects, participations, addParticipations, deleteParticipation } = useAppStore();

  const [formData, setFormData] = useState({
    researcherId: '', projectId: '', startMonth: '', endMonth: '', rate: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.researcherId || !formData.projectId || !formData.startMonth || !formData.endMonth) return;

    const start = parse(formData.startMonth, 'yyyy-MM', new Date());
    const end = parse(formData.endMonth, 'yyyy-MM', new Date());

    if (start > end) {
      alert('시작 연월이 종료 연월보다 늦을 수 없습니다.');
      return;
    }

    const months = eachMonthOfInterval({ start, end });
    const newParts: Participation[] = months.map(date => ({
      id: uuidv4(),
      researcherId: formData.researcherId,
      projectId: formData.projectId,
      yearMonth: format(date, 'yyyy-MM'),
      rate: Number(formData.rate)
    }));

    addParticipations(newParts);
    setFormData({ ...formData, rate: 100 });
  };

  const getResearcherName = (id: string) => researchers.find(r => r.id === id)?.name || '알 수 없음';
  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || '알 수 없음';

  return (
    <div>
      <div className="panel">
        <h2>참여율 매핑 (과제 배정)</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>연구원</label>
            <select value={formData.researcherId} onChange={e => setFormData({...formData, researcherId: e.target.value})} required>
              <option value="">선택하세요</option>
              {researchers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.empNo})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>과제</label>
            <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} required>
              <option value="">선택하세요</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>시작 연월 (YYYY-MM)</label>
            <input type="month" value={formData.startMonth} onChange={e => setFormData({...formData, startMonth: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>종료 연월 (YYYY-MM)</label>
            <input type="month" value={formData.endMonth} onChange={e => setFormData({...formData, endMonth: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>참여율 (%)</label>
            <input type="number" min="0" max="100" value={formData.rate} onChange={e => setFormData({...formData, rate: Number(e.target.value)})} required />
          </div>
          <button type="submit" style={{ height: '40px' }}><Plus size={16}/> 매핑</button>
        </form>
      </div>

      <div className="panel">
        <h2>매핑 내역</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>연월</th>
                <th>연구원</th>
                <th>참여 과제</th>
                <th>참여율 (%)</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {[...participations].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)).map(p => (
                <tr key={p.id}>
                  <td>{p.yearMonth}</td>
                  <td>{getResearcherName(p.researcherId)}</td>
                  <td>{getProjectName(p.projectId)}</td>
                  <td>{p.rate}%</td>
                  <td>
                    <button className="danger" onClick={() => deleteParticipation(p.id)} style={{ padding: '0.3rem' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {participations.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>매핑 내역이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
