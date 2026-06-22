import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Project } from '../store/useAppStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export default function Projects() {
  const { projects, categories, addProject, deleteProject } = useAppStore();

  const [formData, setFormData] = useState({
    code: '', name: '', category: '', startDate: '', endDate: ''
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="secondary" 
                        onClick={() => setEditingProject(p)} 
                        style={{ padding: '0.3rem' }} 
                        title="정보 수정"
                      >
                        <Edit size={16}/>
                      </button>
                      <button className="danger" onClick={() => deleteProject(p.id)} style={{ padding: '0.3rem' }}><Trash2 size={16}/></button>
                    </div>
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

      {editingProject && (
        <ProjectEditModal 
          projectId={editingProject.id} 
          onClose={() => setEditingProject(null)} 
        />
      )}
    </div>
  );
}

interface ProjectEditModalProps {
  projectId: string;
  onClose: () => void;
}

function ProjectEditModal({ projectId, onClose }: ProjectEditModalProps) {
  const { projects, categories, updateProject } = useAppStore();
  const project = projects.find(p => p.id === projectId);

  const [editFormData, setEditFormData] = useState({
    code: project?.code || '',
    name: project?.name || '',
    category: project?.category || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || ''
  });

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.code.trim() || !editFormData.name.trim() || !editFormData.category || !editFormData.startDate || !editFormData.endDate) return;

    updateProject(project.id, {
      code: editFormData.code.trim(),
      name: editFormData.name.trim(),
      category: editFormData.category,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="panel" style={{ width: '500px', maxWidth: '90%', position: 'relative', margin: 0 }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', padding: 0 }}
        >
          <X size={20} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Edit size={20} />
          연구 과제 정보 수정
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>과제코드</label>
            <input value={editFormData.code} onChange={e => setEditFormData({...editFormData, code: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>과제명</label>
            <input value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>연구 카테고리</label>
            <select 
              value={editFormData.category} 
              onChange={e => setEditFormData({...editFormData, category: e.target.value})} 
              required
            >
              <option value="">연구 카테고리 선택</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>과제 시작일</label>
            <input type="date" value={editFormData.startDate} onChange={e => setEditFormData({...editFormData, startDate: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>과제 종료일</label>
            <input type="date" value={editFormData.endDate} onChange={e => setEditFormData({...editFormData, endDate: e.target.value})} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="secondary" onClick={onClose}>취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}
