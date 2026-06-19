import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Project } from '../store/useAppStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function Projects() {
  const { projects, categories, addProject, deleteProject } = useAppStore();

  const [formData, setFormData] = useState({
    code: '', name: '', category: '', startDate: '', endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: uuidv4(),
      code: formData.code,
      name: formData.name,
      category: formData.category || categories[0] || '',
      startDate: formData.startDate,
      endDate: formData.endDate,
      budgetByYear: {}
    };
    addProject(newProject);
    setFormData({ code: '', name: '', category: '', startDate: '', endDate: '' });
  };

  return (
    <div>
      <div className="panel">
        <h2>새 연구 과제 등록</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <input placeholder="과제코드" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
          <input placeholder="과제명" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              required
            >
              <option value="">연구 카테고리 선택</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input type="date" title="과제 시작일" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
          <input type="date" title="과제 종료일" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
          <button type="submit" style={{ gridColumn: '1 / -1' }}><Plus size={16}/> 과제 추가</button>
        </form>
      </div>

      <div className="panel">
        <h2>연구 과제 목록 ({projects.length}건)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>코드</th>
                <th>과제명</th>
                <th>카테고리</th>
                <th>연구 기간</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.startDate} ~ {p.endDate}</td>
                  <td>
                    <button className="danger" onClick={() => deleteProject(p.id)} style={{ padding: '0.3rem' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>등록된 과제가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
