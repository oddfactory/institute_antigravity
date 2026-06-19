import { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, FileDown, Sparkles } from 'lucide-react';
import { generateAiSample } from '../utils/geminiApi';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function DocumentRenderer() {
  const { researchers, projects, participations } = useAppStore();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [generatedTexts, setGeneratedTexts] = useState<Record<string, string>>({});
  const documentRef = useRef<HTMLDivElement>(null);

  // Generate list of years based on current projects or default 2022-2026
  const years = ['2022', '2023', '2024', '2025', '2026'];

  // Months list
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  // Get all participations in the selected year
  const yearParticipations = participations.filter(p => p.yearMonth.startsWith(selectedYear));

  // Find researchers active in the selected year (either has participation or was employed during that year)
  const activeResearchers = researchers.filter(r => {
    const joinYear = r.joinDate.substring(0, 4);
    const leaveYear = r.leaveDate ? r.leaveDate.substring(0, 4) : '9999';
    return selectedYear >= joinYear && selectedYear <= leaveYear;
  });

  const handleGenerateAi = async (id: string, projectName: string) => {
    try {
      setAiLoading(id);
      const text = await generateAiSample('description', projectName);
      setGeneratedTexts(prev => ({ ...prev, [id]: text }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAiLoading(null);
    }
  };

  const handleExportExcel = () => {
    const data: any[] = [];

    activeResearchers.forEach(r => {
      // Find all projects this researcher participated in during the year
      const researcherParts = yearParticipations.filter(p => p.researcherId === r.id);
      const projectIds = Array.from(new Set(researcherParts.map(p => p.projectId)));

      if (projectIds.length === 0) {
        // Active but no assigned projects
        const row: any = {
          '사원번호': r.empNo,
          '성명': r.name,
          '직급': Object.values(r.rankHistory)[0] || '',
          '과제명': '배정 과제 없음',
          '담당업무': r.role,
        };
        months.forEach(m => { row[`${m}월`] = '0%'; });
        row['연평균'] = '0%';
        row['연구내용 샘플'] = '';
        data.push(row);
      } else {
        projectIds.forEach(pid => {
          const pr = projects.find(p => p.id === pid);
          const row: any = {
            '사원번호': r.empNo,
            '성명': r.name,
            '직급': Object.values(r.rankHistory)[0] || '',
            '과제명': pr?.name || '',
            '담당업무': r.role,
          };
          
          let totalRate = 0;
          months.forEach(m => {
            const ym = `${selectedYear}-${m}`;
            const part = researcherParts.find(p => p.projectId === pid && p.yearMonth === ym);
            const rate = part ? part.rate : 0;
            row[`${m}월`] = `${rate}%`;
            totalRate += rate;
          });

          row['연평균'] = `${Math.round(totalRate / 12)}%`;
          row['연구내용 샘플'] = generatedTexts[`${r.id}_${pid}`] || '';
          data.push(row);
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${selectedYear}년 업무분장표`);
    XLSX.writeFile(wb, `RND_연간_업무분장표_${selectedYear}.xlsx`);
  };

  const handleExportPdf = () => {
    if (!documentRef.current) return;
    const element = documentRef.current;
    const opt = {
      margin: 10,
      filename: `RND_실사증빙서류패키지_${selectedYear}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div>
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>실사 서류 연간 시뮬레이션</h2>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            style={{ width: '120px' }}
          >
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportExcel} className="secondary"><FileDown size={16}/> Excel 다운로드</button>
          <button onClick={handleExportPdf} className="secondary"><Download size={16}/> PDF 패키지 출력</button>
        </div>
      </div>

      <div ref={documentRef} style={{ backgroundColor: 'white', color: 'black', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        {/* Document 1: 업무분장표 */}
        <div style={{ marginBottom: '4rem', pageBreakAfter: 'always' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'black', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '0.5rem', fontSize: '1.8rem' }}>
              기업부설연구소 연간 업무분장표 ({selectedYear}년도)
            </h1>
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>국세청 R&D 세액공제 실사 증빙용</p>
          </div>

          <table style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>사원번호</th>
                <th style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>성명(직급)</th>
                <th style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>연구 과제명</th>
                {months.map(m => (
                  <th key={m} style={{ border: '1px solid black', color: 'black', padding: '0.2rem', width: '40px', textAlign: 'center' }}>{parseInt(m)}월</th>
                ))}
                <th style={{ border: '1px solid black', color: 'black', padding: '0.4rem', width: '60px' }}>연평균</th>
                <th style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>담당 업무</th>
              </tr>
            </thead>
            <tbody>
              {activeResearchers.map(r => {
                const researcherParts = yearParticipations.filter(p => p.researcherId === r.id);
                const projectIds = Array.from(new Set(researcherParts.map(p => p.projectId)));

                if (projectIds.length === 0) {
                  return (
                    <tr key={r.id}>
                      <td style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>{r.empNo}</td>
                      <td style={{ border: '1px solid black', color: 'black', padding: '0.4rem', fontWeight: 'bold' }}>{r.name} ({Object.values(r.rankHistory)[0]})</td>
                      <td style={{ border: '1px solid black', color: '#888', padding: '0.4rem', fontStyle: 'italic' }}>배정 과제 없음</td>
                      {months.map(m => (
                        <td key={m} style={{ border: '1px solid black', color: '#ccc', textAlign: 'center' }}>0%</td>
                      ))}
                      <td style={{ border: '1px solid black', color: '#ccc', textAlign: 'center' }}>0%</td>
                      <td style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>{r.role}</td>
                    </tr>
                  );
                }

                return projectIds.map((pid, idx) => {
                  const pr = projects.find(p => p.id === pid);
                  const isFirst = idx === 0;
                  let totalRate = 0;
                  
                  return (
                    <tr key={`${r.id}_${pid}`}>
                      {isFirst && (
                        <td rowSpan={projectIds.length} style={{ border: '1px solid black', color: 'black', padding: '0.4rem', verticalAlign: 'middle' }}>{r.empNo}</td>
                      )}
                      {isFirst && (
                        <td rowSpan={projectIds.length} style={{ border: '1px solid black', color: 'black', padding: '0.4rem', fontWeight: 'bold', verticalAlign: 'middle' }}>{r.name} ({Object.values(r.rankHistory)[0]})</td>
                      )}
                      <td style={{ border: '1px solid black', color: 'black', padding: '0.4rem' }}>{pr?.name}</td>
                      {months.map(m => {
                        const ym = `${selectedYear}-${m}`;
                        const part = researcherParts.find(p => p.projectId === pid && p.yearMonth === ym);
                        const rate = part ? part.rate : 0;
                        totalRate += rate;
                        return (
                          <td key={m} style={{ border: '1px solid black', color: rate > 0 ? 'black' : '#ccc', textAlign: 'center' }}>
                            {rate > 0 ? `${rate}%` : '0%'}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
                        {Math.round(totalRate / 12)}%
                      </td>
                      {isFirst && (
                        <td rowSpan={projectIds.length} style={{ border: '1px solid black', color: 'black', padding: '0.4rem', verticalAlign: 'middle' }}>{r.role}</td>
                      )}
                    </tr>
                  );
                });
              })}
              {activeResearchers.length === 0 && (
                <tr>
                  <td colSpan={17} style={{ border: '1px solid black', textAlign: 'center', padding: '2rem', color: '#666' }}>
                    {selectedYear}년도에 활성화된 연구원 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Document 2: 직무기술서 */}
        <div style={{ marginBottom: '4rem', pageBreakAfter: 'always' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'black', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '0.5rem', fontSize: '1.8rem' }}>
              연구원별 직무기술서 ({selectedYear}년도)
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {activeResearchers.map(r => {
              const rParts = yearParticipations.filter(p => p.researcherId === r.id);
              const rProjects = projects.filter(p => rParts.some(rp => rp.projectId === p.id));
              
              return (
                <div key={r.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
                  <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: 'black' }}>
                    {r.name} {Object.values(r.rankHistory)[0] || '연구원'}
                  </h3>
                  <table style={{ width: '100%', fontSize: '0.8rem', marginTop: '0.5rem', color: 'black' }}>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', width: '80px' }}>사원번호:</td>
                        <td>{r.empNo}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>학력/전공:</td>
                        <td>{r.education} / {r.major}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>연구분야:</td>
                        <td>{r.researchFields.join(', ')}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>참여과제:</td>
                        <td>
                          {rProjects.length > 0 ? (
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                              {rProjects.map(p => (
                                <li key={p.id}>{p.name} ({p.code})</li>
                              ))}
                            </ul>
                          ) : '없음'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document 3: 산출물 프리뷰 */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'black', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '0.5rem', fontSize: '1.8rem' }}>
              R&D 산출물 및 연구내용 프리뷰
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {projects.filter(p => p.startDate.startsWith(selectedYear) || p.endDate.startsWith(selectedYear) || (p.startDate < selectedYear && p.endDate > selectedYear)).map(p => {
              const projectParts = yearParticipations.filter(part => part.projectId === p.id);
              const uniqueResearcherIds = Array.from(new Set(projectParts.map(part => part.researcherId)));
              const projectResearchers = researchers.filter(r => uniqueResearcherIds.includes(r.id));
              
              return (
                <div key={p.id} style={{ border: '1px solid #999', padding: '1.2rem', borderRadius: '6px', color: 'black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'black' }}>[{p.code}] {p.name}</h3>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>기간: {p.startDate} ~ {p.endDate}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                      <strong>참여 연구원:</strong> {projectResearchers.map(r => `${r.name}(${Object.values(r.rankHistory)[0]})`).join(', ') || '없음'}
                    </p>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--color-slate-blue)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>연구계획서 서론 및 핵심 연구내용</strong>
                        <button 
                          className="no-print"
                          onClick={() => handleGenerateAi(p.id, p.name)}
                          disabled={aiLoading === p.id}
                          style={{ backgroundColor: '#6B728E', padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: 'unset' }}
                        >
                          {aiLoading === p.id ? '생성 중...' : <><Sparkles size={12}/> AI 샘플 생성</>}
                        </button>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.5', color: '#333' }}>
                        {generatedTexts[p.id] || '위 버튼을 클릭하여 디지털 광고대행사 기술 컨텍스트가 포함된 AI 연구내용 샘플을 채워 넣으세요.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
