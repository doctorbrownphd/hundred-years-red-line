// Tab 04 — The Consequence
// Radar chart: 6 axes × 4 HOLC grades per city.

function TabConsequence() {
  const gradeData = useData('data/grade_outcomes.json');
  const cityData = useData('data/city_grade_outcomes.json');
  const [selectedCity, setSelectedCity] = React.useState(null);

  const axes = [
    { key: 'hv', label: 'Home Value', unit: '$K', national: d => d?.median_home_value / 1000 },
    { key: 'le', label: 'Life Expectancy', unit: 'yrs', national: d => d?.life_expectancy },
    { key: 'tc', label: 'Tree Canopy', unit: '%', national: d => d?.tree_canopy_pct },
    { key: 'ho', label: 'Homeownership', unit: '%', national: d => d?.homeownership_rate },
    { key: 'col', label: 'College Degree', unit: '%', national: d => d?.college_pct },
    { key: 'pov', label: 'Poverty Rate', unit: '%', national: d => d ? 100 - d.poverty_rate : 0 }, // Invert so higher = better
  ];

  function getValues(grade) {
    if (selectedCity) {
      const c = cityData?.find(c => c.city === selectedCity);
      if (!c) return axes.map(() => 0);
      const g = c[grade];
      return [g?.hv || 0, g?.le || 0, g?.tc || 0, g?.ho || 0, 0, 0]; // City data has fewer fields
    }
    if (!gradeData) return axes.map(() => 0);
    const d = gradeData[grade];
    return axes.map(a => a.national(d) || 0);
  }

  // Normalize to 0-1 range
  const allVals = GRADE_ORDER.flatMap(g => getValues(g));
  const maxPerAxis = axes.map((_, i) => Math.max(...GRADE_ORDER.map(g => getValues(g)[i])));

  function radarPoints(grade, cx, cy, r) {
    const vals = getValues(grade);
    return vals.map((v, i) => {
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      const norm = maxPerAxis[i] > 0 ? v / maxPerAxis[i] : 0;
      return [cx + Math.cos(angle) * r * norm, cy + Math.sin(angle) * r * norm];
    });
  }

  const cx = 250, cy = 250, r = 200;

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="04 · The Consequence"
        title="What the grade predicted."
        subtitle="Six outcomes. Four grades. The Grade A line is high on every axis. The Grade D line is low on every axis. The gap between them is the policy."
      />

      {/* City selector */}
      {cityData && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="mono" onClick={() => setSelectedCity(null)} style={{
            padding: '5px 12px', fontSize: 10, cursor: 'pointer', borderRadius: 2,
            background: !selectedCity ? 'var(--gold)' : 'var(--bg-2)',
            color: !selectedCity ? 'var(--bg)' : 'var(--ink-dim)',
            border: '1px solid var(--line)',
          }}>National</button>
          {cityData.map(c => (
            <button key={c.city} className="mono" onClick={() => setSelectedCity(c.city)} style={{
              padding: '5px 12px', fontSize: 10, cursor: 'pointer', borderRadius: 2,
              background: selectedCity === c.city ? 'var(--gold)' : 'var(--bg-2)',
              color: selectedCity === c.city ? 'var(--bg)' : 'var(--ink-dim)',
              border: '1px solid var(--line)',
            }}>{c.city}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 40 }}>
        {/* Radar chart */}
        <svg viewBox="0 0 500 500" style={{ width: 500, height: 500 }}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map(t => (
            <polygon key={t} fill="none" stroke="var(--line)" strokeWidth="0.5"
              points={axes.map((_, i) => {
                const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
                return `${cx + Math.cos(angle) * r * t},${cy + Math.sin(angle) * r * t}`;
              }).join(' ')} />
          ))}

          {/* Axis lines */}
          {axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="var(--line)" strokeWidth="0.5" />;
          })}

          {/* Grade polygons */}
          {GRADE_ORDER.slice().reverse().map(g => {
            const pts = radarPoints(g, cx, cy, r);
            return (
              <React.Fragment key={g}>
                <polygon fill={gradeColor(g)} fillOpacity="0.08" stroke={gradeColor(g)} strokeWidth="2" strokeOpacity="0.8"
                  points={pts.map(p => p.join(',')).join(' ')} />
                {pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={gradeColor(g)} />
                ))}
              </React.Fragment>
            );
          })}

          {/* Axis labels */}
          {axes.map((a, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            const lx = cx + Math.cos(angle) * (r + 28);
            const ly = cy + Math.sin(angle) * (r + 28);
            return (
              <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Space Mono" fontSize="9" fill="var(--ink-dim)">{a.label}</text>
            );
          })}
        </svg>

        {/* Data table */}
        <div>
          <GradeLegend style={{ marginBottom: 16 }} />

          {gradeData && !selectedCity && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(4, 1fr)', gap: 1, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg)', padding: '8px 12px' }}><Tick>Outcome</Tick></div>
                {GRADE_ORDER.map(g => (
                  <div key={g} style={{ background: gradeBg(g), padding: '8px 12px', textAlign: 'center' }}>
                    <GradeBadge grade={g} size="sm" />
                  </div>
                ))}

                {/* Rows */}
                {[
                  { label: 'Median Home Value', key: 'median_home_value', fmt: v => `$${(v/1000).toFixed(0)}K` },
                  { label: 'Median Income', key: 'median_income', fmt: v => `$${(v/1000).toFixed(0)}K` },
                  { label: 'Homeownership', key: 'homeownership_rate', fmt: v => `${v}%` },
                  { label: 'Life Expectancy', key: 'life_expectancy', fmt: v => `${v} yrs` },
                  { label: 'Tree Canopy', key: 'tree_canopy_pct', fmt: v => `${v}%` },
                  { label: 'College Degree', key: 'college_pct', fmt: v => `${v}%` },
                  { label: 'Poverty Rate', key: 'poverty_rate', fmt: v => `${v}%` },
                  { label: '% Minority', key: 'pct_minority', fmt: v => `${v}%` },
                ].map(row => (
                  <React.Fragment key={row.key}>
                    <div style={{ background: 'var(--bg-2)', padding: '8px 12px' }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>{row.label}</span>
                    </div>
                    {GRADE_ORDER.map(g => (
                      <div key={g} style={{ background: 'var(--bg-2)', padding: '8px 12px', textAlign: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, color: gradeColor(g), fontWeight: 700 }}>
                          {gradeData[g] ? row.fmt(gradeData[g][row.key]) : '—'}
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              <div className="serif" style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-dim)', marginTop: 12, lineHeight: 1.6 }}>
                Source: NCRC (2018), Aaronson, Hartley & Mazumder (2021). National averages across all 239 HOLC-mapped cities.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.TabConsequence = TabConsequence;
