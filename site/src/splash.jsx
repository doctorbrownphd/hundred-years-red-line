// Splash screen — three beats.
// Beat 1: Four HOLC grade blocks. Beat 2: Labels + thesis. Beat 3: Title + enter.

function Splash({ onEnter }) {
  const SESSION_KEY = 'corpus_the-red-line_seen';
  const [beat, setBeat] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const ts = [
      setTimeout(() => setBeat(1), 2200),
      setTimeout(() => setBeat(2), 4400),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Enter' && beat >= 2) handleEnter(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [beat]);

  function handleEnter() {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => { sessionStorage.setItem(SESSION_KEY, '1'); onEnter(); }, 600);
  }

  const gradeBlocks = [
    { grade: 'A', color: 'var(--grade-a)', label: 'Best' },
    { grade: 'B', color: 'var(--grade-b)', label: 'Still Desirable' },
    { grade: 'C', color: 'var(--grade-c)', label: 'Declining' },
    { grade: 'D', color: 'var(--grade-d)', label: 'Hazardous' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', position: 'relative',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '60px 80px', overflow: 'hidden',
    }}>
      {exiting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'var(--bg)', animation: 'fade 600ms ease both' }} />
      )}

      {/* Top brand */}
      <div style={{ position: 'absolute', top: 28, left: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
        <SeriesMark />
        <Tick>Vol. III — Issue 09 / The Red Line</Tick>
      </div>
      <div style={{ position: 'absolute', top: 28, right: 36 }}>
        <Tick>HOLC · Mapping Inequality · 239 Cities · 1935–1940</Tick>
      </div>

      {/* Stage */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>

        {/* Beat 1: Four colored grade blocks */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {gradeBlocks.map((b, i) => (
            <div key={b.grade} style={{
              width: 80, height: 80, background: b.color, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `fadeUp 1s cubic-bezier(.2,.7,.2,1) ${i * 150}ms both`,
            }}>
              <span className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>{b.grade}</span>
            </div>
          ))}
        </div>

        {/* Beat 2: Grade labels + thesis line */}
        <div style={{ marginTop: 16, opacity: beat >= 1 ? 1 : 0, transition: 'opacity 800ms ease' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {gradeBlocks.map(b => (
              <div key={b.grade} className="mono" style={{ width: 80, fontSize: 9, color: 'var(--ink-dim)', letterSpacing: 0.1, textTransform: 'uppercase', textAlign: 'center' }}>
                {b.label}
              </div>
            ))}
          </div>
          <div className="serif" style={{ color: 'var(--ink-dim)', fontSize: 18, marginTop: 28, fontStyle: 'italic' }}>
            The last category meant no mortgage. Ever.
          </div>
        </div>

        {/* Beat 3: Title + thesis + enter */}
        <div style={{
          marginTop: 56, opacity: beat >= 2 ? 1 : 0,
          transform: beat >= 2 ? 'none' : 'translateY(10px)',
          transition: 'all 900ms cubic-bezier(.2,.7,.2,1)',
        }}>
          <div className="garamond" style={{ fontSize: 84, lineHeight: 0.95, letterSpacing: -2.5, color: 'var(--ink)', fontWeight: 400 }}>
            The Red Line
          </div>
          <div className="serif" style={{
            color: 'var(--ink-dim)', fontSize: 17, marginTop: 20, fontStyle: 'italic',
            maxWidth: 720, margin: '20px auto 0', textWrap: 'balance',
          }}>
            A federal agency drew these lines in the 1930s. The data shows what happened to the neighborhoods on each side. The line is still working.
          </div>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button onClick={handleEnter} className="mono" style={{
              background: 'transparent', color: 'var(--grade-d)',
              border: '1px solid var(--grade-d)', padding: '14px 28px',
              fontSize: 12, letterSpacing: 0.3, textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: "'Space Mono', monospace",
              transition: 'all 200ms', display: 'inline-flex', alignItems: 'center', gap: 14,
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--grade-d)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--grade-d)'; }}>
              Enter the record
              <Icon name="arrow-right" size={14} />
            </button>
            <div className="mono" style={{ color: 'var(--ink-dimmer)', fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="corner-down-left" size={11} color="var(--ink-dimmer)" /> Press return · or click to continue
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', left: 36, right: 36, bottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--line)', paddingTop: 12,
      }}>
        <Tick>Mapping Inequality · University of Richmond · US Census · CDC PLACES</Tick>
        <Tick>MIT · CC0 · Open data</Tick>
      </div>
    </div>
  );
}

window.Splash = Splash;
