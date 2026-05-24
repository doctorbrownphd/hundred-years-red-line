// App shell — splash → tab navigation

const TABS = [
  { id: 'map', num: '01', label: 'The Map', icon: 'map-pin', component: TabMap },
  { id: 'grade', num: '02', label: 'The Grade', icon: 'file-text', component: TabGrade },
  { id: 'boom', num: '03', label: 'The Boom', icon: 'trending-up', component: TabBoom },
  { id: 'consequence', num: '04', label: 'The Consequence', icon: 'bar-chart-3', component: TabConsequence },
  { id: 'boundary', num: '05', label: 'The Boundary', icon: 'separator-horizontal', component: TabBoundary },
  { id: 'present', num: '06', label: 'The Present', icon: 'clock', component: TabPresent },
  { id: 'counterfactual', num: '07', label: 'The Counterfactual', icon: 'git-branch', component: TabCounterfactual },
  { id: 'method', num: '08', label: 'Method', icon: 'flask-conical', component: TabMethodology },
];

function App() {
  const SESSION_KEY = 'corpus_the-red-line_seen';
  const [showSplash, setShowSplash] = React.useState(!sessionStorage.getItem(SESSION_KEY));
  const [activeTab, setActiveTab] = React.useState('map');

  const ActiveComp = TABS.find(t => t.id === activeTab)?.component || TabMap;

  if (showSplash) {
    return <Splash onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 50, background: 'rgba(26,26,26,0.95)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SeriesMark />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, flexShrink: 0, marginTop: 14 }}>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <span className="garamond" style={{ fontSize: 18, color: 'var(--ink)', letterSpacing: -0.5 }}>The Red Line</span>
            <Tick style={{ marginLeft: 12 }}>One Hundred Years · Issue 09</Tick>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="mono" style={{
              padding: '8px 14px', fontSize: 9, letterSpacing: 0.1, textTransform: 'uppercase',
              background: activeTab === tab.id ? 'var(--bg-3)' : 'transparent',
              color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-dim)',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--grade-d)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 150ms',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ opacity: 0.5 }}>{tab.num}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grade legend in header */}
        <div style={{ display: 'flex', gap: 6 }}>
          {GRADE_ORDER.map(g => (
            <span key={g} style={{
              width: 14, height: 14, borderRadius: 2,
              background: gradeColor(g), display: 'inline-block',
            }} title={`Grade ${g}: ${gradeLabel(g)}`} />
          ))}
        </div>
      </div>

      {/* Active tab content */}
      <ActiveComp />

      {/* Footer */}
      <ChronicleFooter />
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
