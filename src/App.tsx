import { useState } from 'react';
import { LayoutDashboard, Users, FolderOpen, Link2, FileText, Settings } from 'lucide-react';
import ValidationPanel from './components/ValidationPanel';
import Dashboard from './pages/Dashboard';
import Researchers from './pages/Researchers';
import Projects from './pages/Projects';
import Participations from './pages/Participations';
import DocumentRenderer from './pages/DocumentRenderer';
import SettingsModal from './components/SettingsModal';
import { useValidation } from './utils/validationEngine';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { getIssues } = useValidation();
  const issues = getIssues();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'researchers': return <Researchers />;
      case 'projects': return <Projects />;
      case 'participations': return <Participations />;
      case 'documents': return <DocumentRenderer />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <header style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text)' }}>
            KOITA R&D Compliance System
          </h1>
          <span style={{ 
            backgroundColor: issues.length > 0 ? 'var(--color-error)' : 'var(--color-slate-blue)', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            리스크 {issues.length}건
          </span>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="secondary" style={{ padding: '0.5rem' }}>
          <Settings size={20} />
        </button>
      </header>

      <nav style={{ 
        display: 'flex', 
        gap: '1rem', 
        padding: '1rem 2rem', 
        backgroundColor: 'var(--color-charcoal)' 
      }}>
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="대시보드 & 타임라인" />
        <NavButton active={activeTab === 'researchers'} onClick={() => setActiveTab('researchers')} icon={<Users size={18}/>} label="연구원 관리" />
        <NavButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<FolderOpen size={18}/>} label="연구 과제 관리" />
        <NavButton active={activeTab === 'participations'} onClick={() => setActiveTab('participations')} icon={<Link2 size={18}/>} label="참여율 매핑" />
        <NavButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={18}/>} label="실사 서류 시뮬레이션" />
      </nav>

      <main className="main-content">
        <ValidationPanel issues={issues} />
        {renderContent()}
      </main>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: active ? 'var(--color-slate-blue)' : 'transparent',
        color: active ? 'white' : 'var(--color-text-muted)',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
