// Tab 07 — The Methodology

function TabMethodology() {
  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="07 · The Methodology"
        title="How the analysis works."
        subtitle="Data sources, confidence labeling, the natural experiment design."
      />

      {/* Core question */}
      <div style={{
        background: 'var(--bg-2)', borderLeft: '3px solid var(--gold)',
        padding: '20px 24px', marginBottom: 32, borderRadius: 4, maxWidth: 740,
      }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 6 }}>The Core Methodological Question</Tick>
        <div className="serif" style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.65, fontStyle: 'italic' }}>
          How much of what we observe in formerly redlined neighborhoods is caused by the HOLC grade versus pre-existing conditions that the grade merely described? The boundary discontinuity design answers this directly.
        </div>
      </div>

      {/* Confidence labels */}
      <div style={{ marginBottom: 32 }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 16 }}>Confidence Labeling</Tick>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            { level: 'HIGH CONFIDENCE', color: 'var(--grade-a)', items: ['HOLC grade correlations with current outcomes — replicated across 239 cities and dozens of studies', 'Boundary discontinuity causal estimates — rigorous methodology, findings replicated'] },
            { level: 'CANDIDATE', color: 'var(--grade-c)', items: ['Wealth gap decomposition — what fraction of the racial wealth gap is attributable to postwar homeownership exclusion', 'Modern redlining — HMDA patterns correlated with HOLC grades'] },
            { level: 'SPECULATIVE', color: 'var(--ink-dim)', items: ['Counterfactual wealth estimates — what Black family wealth would look like today if the exclusion had not occurred'] },
          ].map(conf => (
            <div key={conf.level} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: '14px 20px', borderRadius: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: conf.color, fontWeight: 700, letterSpacing: 0.15 }}>● {conf.level}</span>
              <div style={{ marginTop: 6 }}>
                {conf.items.map((item, i) => (
                  <div key={i} className="serif" style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, marginTop: i > 0 ? 4 : 0 }}>
                    — {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div style={{ marginBottom: 32 }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 16 }}>Data Sources</Tick>
        <div style={{ display: 'grid', gap: 1, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { source: 'Mapping Inequality', org: 'University of Richmond', coverage: '239 cities, 1935–1940', note: 'Digitized HOLC maps with grade polygons. Core dataset.' },
            { source: 'HOLC Area Description Forms', org: 'National Archives', coverage: '239 cities', note: 'Narrative appraisal forms with grade justifications. Public domain.' },
            { source: 'American Community Survey', org: 'US Census Bureau', coverage: '2018–2022', note: 'Tract-level income, homeownership, demographics.' },
            { source: 'CDC PLACES', org: 'CDC', coverage: '2015–present', note: 'Health outcomes by census tract.' },
            { source: 'USDA Tree Canopy', org: 'USDA Forest Service', coverage: '2011–present', note: 'Tree canopy coverage by tract.' },
            { source: 'HMDA Data', org: 'CFPB', coverage: '1990–present', note: 'Every mortgage application and outcome by race and geography.' },
            { source: 'Census Historical Data', org: 'US Census Bureau', coverage: '1940–present', note: 'Decennial census tract-level data.' },
            { source: 'NCRC Redlining Research', org: 'NCRC', coverage: 'Published reports', note: 'Modern lending disparity analysis for validation.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 160px 140px 1fr', gap: 0, background: 'var(--bg-2)', padding: '10px 16px' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink)' }}>{s.source}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>{s.org}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>{s.coverage}</span>
              <span className="serif" style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic' }}>{s.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div style={{ marginBottom: 32 }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 16 }}>Models</Tick>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { code: 'M1', name: 'Outcome Prediction', desc: 'Gradient boosting regression predicting current outcomes from 1930s HOLC grades. One model per outcome variable. Validated on held-out cities.', tab: 'Tab 04' },
            { code: 'M2', name: 'Boundary Discontinuity', desc: 'Regression discontinuity design at HOLC grade boundaries. Local polynomial regression with heteroskedasticity-robust standard errors.', tab: 'Tab 05' },
            { code: 'M3', name: 'Wealth Gap Decomposition', desc: 'Causal mediation analysis estimating what fraction of the racial wealth gap flows through homeownership exclusion.', tab: 'Tab 03' },
            { code: 'M4', name: 'Modern Redlining Detector', desc: 'Logistic regression on HMDA denial rates by race and geography, controlling for creditworthiness indicators.', tab: 'Tab 06' },
          ].map(m => (
            <div key={m.code} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: '16px 20px', borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 700 }}>{m.code}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink)', letterSpacing: 0.1 }}>{m.name}</span>
              </div>
              <div className="serif" style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.5, fontStyle: 'italic' }}>{m.desc}</div>
              <Tick style={{ marginTop: 6, display: 'block' }}>Used in · {m.tab}</Tick>
            </div>
          ))}
        </div>
      </div>

      {/* Citation */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--line)', padding: '16px 20px', borderRadius: 4,
      }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 8 }}>How to Cite</Tick>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.6 }}>
          Haynes, J. (2026). <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>One Hundred Years: The Red Line</span>. onehundredyears.report/the-red-line.
        </div>
      </div>
    </div>
  );
}

window.TabMethodology = TabMethodology;
