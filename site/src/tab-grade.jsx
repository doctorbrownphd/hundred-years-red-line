// Tab 02 — The Grade
// Searchable archive of HOLC area description forms.

function TabGrade() {
  const areas = useData('data/holc_areas_sample.json');
  const [filter, setFilter] = React.useState('D');
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!areas) return [];
    let list = areas;
    if (filter) list = list.filter(a => a.grade === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.text.toLowerCase().includes(q) || a.city.toLowerCase().includes(q));
    }
    return list.slice(0, 40);
  }, [areas, filter, search]);

  // Terms to highlight in red
  const highlightTerms = ['negro', 'colored', 'infiltration', 'inharmonious', 'subversive', 'undesirable', 'detrimental', 'hazardous', 'racial', 'encroachment', 'foreign element'];

  function highlightText(text) {
    let html = text;
    highlightTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      html = html.replace(regex, '<mark style="background:rgba(192,57,43,0.25);color:#e8a8a0;padding:1px 3px;border-radius:1px">$1</mark>');
    });
    return html;
  }

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="02 · The Grade"
        title="What the appraisers wrote."
        subtitle="HOLC appraisers described every neighborhood they graded. They wrote down exactly what they were doing. The language is the finding."
      />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['A', 'B', 'C', 'D', ''].map(g => (
            <button key={g} className="mono" onClick={() => setFilter(g)} style={{
              padding: '6px 12px', fontSize: 10, letterSpacing: 0.1,
              background: filter === g ? (g ? gradeColor(g) : 'var(--ink)') : 'var(--bg-2)',
              color: filter === g ? '#fff' : 'var(--ink-dim)',
              border: `1px solid ${g ? gradeColor(g) + '66' : 'var(--line)'}`,
              cursor: 'pointer', borderRadius: 2,
            }}>
              {g || 'All'}
            </button>
          ))}
        </div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search city or term…"
          className="mono"
          style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--ink)',
            padding: '6px 14px', fontSize: 11, width: 240, borderRadius: 2, outline: 'none',
          }}
        />
        <Tick>{filtered.length} descriptions shown</Tick>
      </div>

      {/* Callout */}
      <div style={{
        background: 'var(--grade-d-bg)', border: '1px solid rgba(192,57,43,0.3)',
        padding: '16px 24px', marginBottom: 24, borderRadius: 4,
      }}>
        <div className="serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.6 }}>
          These are verbatim excerpts from government documents in the National Archives. The HOLC appraisers used the language below to justify grading neighborhoods. <span style={{ color: 'var(--grade-d)' }}>Highlighted terms</span> indicate racial language that directly influenced the grade.
        </div>
      </div>

      {/* Area description cards */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((area, i) => (
          <div key={i} style={{
            background: gradeBg(area.grade),
            border: `1px solid ${gradeColor(area.grade)}33`,
            padding: '16px 20px', borderRadius: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <GradeBadge grade={area.grade} />
              <span className="garamond" style={{ fontSize: 16, color: 'var(--ink)' }}>{area.city}</span>
              {area.id && <Tick>Area {area.id}</Tick>}
            </div>
            <div className="mono" style={{
              fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.7, fontStyle: 'italic',
            }} dangerouslySetInnerHTML={{ __html: highlightText(area.text.slice(0, 600) + (area.text.length > 600 ? '…' : '')) }} />
            {area.terms.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {area.terms.map((t, j) => (
                  <span key={j} className="mono" style={{
                    fontSize: 8, color: 'var(--grade-d)', border: '1px solid var(--grade-d)',
                    padding: '2px 6px', borderRadius: 1, textTransform: 'uppercase', letterSpacing: 0.1,
                  }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!areas && <Tick style={{ animation: 'pulse 1.5s infinite' }}>Loading area descriptions…</Tick>}
    </div>
  );
}

window.TabGrade = TabGrade;
