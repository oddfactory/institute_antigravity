import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Researcher } from '../store/useAppStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function Researchers() {
  const { researchers, categories, addResearcher, deleteResearcher, addCategory, deleteCategory } = useAppStore();

  const [formData, setFormData] = useState({
    empNo: '', name: '', joinDate: '', leaveDate: '', rank: '', education: '', major: '', role: ''
  });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResearcher: Researcher = {
      id: uuidv4(),
      empNo: formData.empNo,
      name: formData.name,
      joinDate: formData.joinDate,
      leaveDate: formData.leaveDate || null,
      rankHistory: { [formData.joinDate.substring(0, 4)]: formData.rank },
      education: formData.education,
      major: formData.major,
      role: formData.role,
      researchFields: selectedFields
    };
    addResearcher(newResearcher);
    setFormData({ empNo: '', name: '', joinDate: '', leaveDate: '', rank: '', education: '', major: '', role: '' });
    setSelectedFields([]);
  };

  const handleCheckboxChange = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      addCategory(trimmed);
      setNewCategoryName('');
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          <h2>새 연구원 등록</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input placeholder="사원번호" value={formData.empNo} onChange={e => setFormData({...formData, empNo: e.target.value})} required />
            <input placeholder="성명" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="date" title="입사일" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} required />
            <input type="date" title="퇴사일(연구소 제외일)" value={formData.leaveDate} onChange={e => setFormData({...formData, leaveDate: e.target.value})} />
            <input placeholder="직급" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} required />
            <input placeholder="최종학력" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} required />
            <input placeholder="전공" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} required />
            <input placeholder="담당 업무" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required />
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                연구 분야 선택 (최대 2개 권장, 3개 이상 시 경고 발생)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', backgroundColor: 'var(--color-charcoal)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                {categories.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto' }}
                      checked={selectedFields.includes(c)} 
                      onChange={() => handleCheckboxChange(c)} 
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" style={{ gridColumn: '1 / -1' }}><Plus size={16}/> 연구원 추가</button>
          </form>
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h2>공통 연구 분야/카테고리</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="새 카테고리 입력" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
            />
            <button onClick={handleAddCategory} style={{ whiteSpace: 'nowrap' }}><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {categories.map(c => (
              <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-charcoal)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                <span>{c}</span>
                <button className="danger" onClick={() => deleteCategory(c)} style={{ padding: '0.2rem', minHeight: 'unset' }}><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>연구원 목록 ({researchers.length}명)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>사원번호</th>
                <th>성명</th>
                <th>직급</th>
                <th>소속 기간</th>
                <th>연구 분야</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {researchers.map(r => (
                <tr key={r.id}>
                  <td>{r.empNo}</td>
                  <td>{r.name}</td>
                  <td>{Object.values(r.rankHistory)[0]}</td>
                  <td>{r.joinDate} ~ {r.leaveDate || '현재'}</td>
                  <td>
                    {r.researchFields.map(f => (
                      <span key={f} style={{ 
                        background: 'var(--color-charcoal)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        marginRight: '0.3rem',
                        color: r.researchFields.length > 2 ? 'var(--color-error)' : 'inherit'
                      }}>{f}</span>
                    ))}
                  </td>
                  <td>
                    <button className="danger" onClick={() => deleteResearcher(r.id)} style={{ padding: '0.3rem' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {researchers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>등록된 연구원이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
