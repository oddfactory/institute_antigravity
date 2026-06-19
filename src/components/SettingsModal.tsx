import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Key, X, Download, Upload } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const apiKey = useAppStore(state => state.geminiApiKey);
  const setApiKey = useAppStore(state => state.setGeminiApiKey);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(tempKey);
    onClose();
  };

  const handleExportBackup = () => {
    const data = localStorage.getItem('koita-compliance-storage');
    if (!data) return alert('저장된 데이터가 없습니다.');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koita_compliance_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.state) {
          localStorage.setItem('koita-compliance-storage', JSON.stringify(json));
          alert('데이터 복구가 완료되었습니다. 페이지를 새로고침합니다.');
          window.location.reload();
        } else {
          alert('올바르지 않은 백업 파일 형식입니다.');
        }
      } catch (err) {
        alert('파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
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
      <div className="panel" style={{ width: '400px', maxWidth: '90%', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', padding: 0 }}
        >
          <X size={20} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Key size={20} />
          설정 및 데이터 관리
        </h2>

        {/* Gemini API Section */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Gemini API Key
          </label>
          <input 
            type="password" 
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="AI-xxxxxxxxxxxxxxxxxxx"
          />
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-slate-blue-light)' }}>
            서류 시뮬레이션에서 AI를 활용한 자동 샘플 생성 시 사용됩니다.
          </p>
        </div>

        {/* Data Management Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>데이터 백업 및 복구</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="secondary" onClick={handleExportBackup} style={{ flex: 1, fontSize: '0.8rem' }}>
              <Download size={14} /> 백업 다운로드 (.json)
            </button>
            <label style={{
              flex: 1,
              backgroundColor: 'var(--color-charcoal-light)',
              color: 'var(--color-text)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: 'none',
              textAlign: 'center'
            }}>
              <Upload size={14} /> 복구 파일 선택
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            현재 입력된 모든 데이터를 PC에 저장하거나 백업된 상태로 복구할 수 있습니다.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="secondary" onClick={onClose}>취소</button>
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}

