// Shared UI atoms — series-consistent components

function Icon({ name, size = 16, color, style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      if (window.lucide) lucide.createIcons({ nodes: [el] });
    }
  }, [name]);
  return <span ref={ref} style={{ display: 'inline-flex', width: size, height: size, color: color || 'currentColor', ...style }} />;
}

function Tick({ children, style = {} }) {
  return <span className="mono" style={{ fontSize: 10, letterSpacing: 0.15, color: 'var(--ink-dim)', textTransform: 'uppercase', ...style }}>{children}</span>;
}

function SectionHead({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Tick style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.2em' }}>{label}</Tick>
      <div className="garamond" style={{ fontSize: 36, color: 'var(--ink)', marginTop: 6, lineHeight: 1.1 }}>{title}</div>
      {subtitle && <div className="serif" style={{ fontSize: 16, color: 'var(--ink-dim)', marginTop: 8, fontStyle: 'italic', maxWidth: 640 }}>{subtitle}</div>}
    </div>
  );
}

function GradeBadge({ grade, size = 'md' }) {
  const s = size === 'lg' ? 28 : size === 'sm' ? 16 : 20;
  const fs = size === 'lg' ? 16 : size === 'sm' ? 9 : 12;
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: s, height: s, borderRadius: 2,
      background: gradeColor(grade), color: '#fff',
      fontSize: fs, fontWeight: 700, lineHeight: 1,
    }}>{grade}</span>
  );
}

function GradeLegend({ style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 16, ...style }}>
      {GRADE_ORDER.map(g => (
        <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GradeBadge grade={g} size="sm" />
          <Tick>{gradeLabel(g)}</Tick>
        </div>
      ))}
    </div>
  );
}

function StatBlock({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: color || 'var(--ink)', lineHeight: 1 }}>{value}</div>
      {unit && <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 2 }}>{unit}</div>}
      <Tick style={{ marginTop: 6, display: 'block', fontSize: 9 }}>{label}</Tick>
    </div>
  );
}

function SeriesMark() {
  return (
    <svg width="20" height="50" viewBox="0 0 34 108" style={{ flexShrink: 0 }}>
      <line x1="6" y1="2" x2="6" y2="106" stroke="#C9A84C" strokeWidth="1.4"/>
      <line x1="6" y1="6" x2="26" y2="6" stroke="#C9A84C" strokeWidth="1.4"/>
      <line x1="6" y1="54" x2="22" y2="54" stroke="#C9A84C" strokeWidth="1.4"/>
      <line x1="6" y1="102" x2="26" y2="102" stroke="#C9A84C" strokeWidth="1.4"/>
      {[18,30,42,66,78,90].map(y => <line key={y} x1="6" y1={y} x2="13" y2={y} stroke="#C9A84C" strokeWidth=".7" opacity=".5"/>)}
    </svg>
  );
}

function ChronicleFooter() {
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SeriesMark />
        <div>
          <Tick style={{ color: 'var(--gold)', fontWeight: 700 }}>One Hundred Years</Tick>
          <div className="serif" style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 2 }}>Vol. III · Issue 09 / The Red Line</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Tick>MIT License</Tick>
        <Tick>CC0 Data</Tick>
        <a href="https://github.com/doctorbrownphd/hundred-years-red-line" target="_blank" rel="noopener" className="mono" style={{ fontSize: 10, color: 'var(--gold)', textDecoration: 'none', letterSpacing: 0.15 }}>GitHub ↗</a>
        <a href="https://onehundredyears.report" className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', textDecoration: 'none', letterSpacing: 0.15 }}>Series Index ↗</a>
      </div>
    </div>
  );
}

window.Icon = Icon;
window.Tick = Tick;
window.SectionHead = SectionHead;
window.GradeBadge = GradeBadge;
window.GradeLegend = GradeLegend;
window.StatBlock = StatBlock;
window.SeriesMark = SeriesMark;
window.ChronicleFooter = ChronicleFooter;
