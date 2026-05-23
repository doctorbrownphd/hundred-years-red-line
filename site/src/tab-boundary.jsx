// Tab 05 — The Boundary
// Boundary discontinuity results — the natural experiment.

function TabBoundary() {
  const boundary = useData('data/boundary_data.json');

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="05 · The Boundary"
        title="The natural experiment."
        subtitle="Properties on opposite sides of the HOLC boundary line were often physically identical in the 1930s. Same housing stock. Same street. Different grade. The outcomes diverged."
      />

      {/* Methodology explanation */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--line)', borderLeft: '3px solid var(--gold)',
        padding: '20px 24px', marginBottom: 32, borderRadius: 4, maxWidth: 740,
      }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Regression Discontinuity Design</Tick>
        <div className="serif" style={{ fontSize: 14, color: 'var(--ink-dim)', lineHeight: 1.65, fontStyle: 'italic' }}>
          Compare properties within 500 meters of a HOLC boundary — one side graded C, the other D. Control for pre-existing conditions, housing age, lot size, and current demographics. The residual difference is the causal estimate of the grade's effect, net of everything else. This design has been replicated across multiple cities.
        </div>
      </div>

      {/* Boundary effects */}
      {boundary && (
        <>
          <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 16 }}>
            Causal Effects at the C/D Boundary
          </Tick>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {boundary.findings.map((f, i) => {
              const isNeg = f.effect < 0;
              const color = isNeg ? 'var(--grade-d)' : 'var(--grade-a)';
              const arrow = isNeg ? '↓' : '↑';
              return (
                <div key={i} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)', padding: '20px 24px', borderRadius: 4,
                }}>
                  <Tick style={{ display: 'block', marginBottom: 8 }}>{f.outcome}</Tick>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
                    {arrow} {f.unit === '$' ? `$${fmt(Math.abs(f.effect))}` : `${Math.abs(f.effect)}${f.unit}`}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 6 }}>
                    95% CI: [{f.unit === '$' ? `$${fmt(Math.abs(f.ci_low))}` : Math.abs(f.ci_low) + f.unit} to {f.unit === '$' ? `$${fmt(Math.abs(f.ci_high))}` : Math.abs(f.ci_high) + f.unit}]
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--grade-a)', marginTop: 6, letterSpacing: 0.1 }}>
                    ● {f.confidence} CONFIDENCE
                  </div>
                </div>
              );
            })}
          </div>

          {/* Effect size chart */}
          <div style={{ marginBottom: 32 }}>
            <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 16 }}>Effect Sizes (Standardized)</Tick>
            <svg viewBox="0 0 800 240" style={{ width: '100%', maxWidth: 800, display: 'block' }}>
              {boundary.findings.map((f, i) => {
                const maxAbs = Math.max(...boundary.findings.map(x => Math.abs(x.effect)));
                const barW = (Math.abs(f.effect) / maxAbs) * 350;
                const y = i * 38 + 10;
                const isNeg = f.effect < 0;
                return (
                  <React.Fragment key={i}>
                    <text x={180} y={y + 16} textAnchor="end" fontFamily="Space Mono" fontSize="10" fill="var(--ink-dim)">{f.outcome}</text>
                    <rect x={isNeg ? 400 - barW : 400} y={y + 4} width={barW} height={18} rx={2}
                      fill={isNeg ? 'var(--grade-d)' : 'var(--grade-a)'} opacity="0.7" />
                    {/* CI whiskers */}
                    <line x1={400 - (Math.abs(f.ci_low) / maxAbs) * 350 * (isNeg ? 1 : -1)} y1={y + 13}
                      x2={400 - (Math.abs(f.ci_high) / maxAbs) * 350 * (isNeg ? 1 : -1)} y2={y + 13}
                      stroke="var(--ink-dim)" strokeWidth="1" />
                    <text x={isNeg ? 400 - barW - 8 : 400 + barW + 8} y={y + 17}
                      textAnchor={isNeg ? 'end' : 'start'} fontFamily="Space Mono" fontSize="10" fill={isNeg ? 'var(--grade-d)' : 'var(--grade-a)'} fontWeight="700">
                      {f.unit === '$' ? `$${fmt(Math.abs(f.effect))}` : `${f.effect}${f.unit}`}
                    </text>
                  </React.Fragment>
                );
              })}
              {/* Zero line */}
              <line x1={400} y1={0} x2={400} y2={240} stroke="var(--line)" strokeWidth="1" />
              <text x={400} y={235} textAnchor="middle" fontFamily="Space Mono" fontSize="9" fill="var(--ink-dimmer)">0 (no effect)</text>
            </svg>
          </div>

          <div style={{
            background: 'var(--grade-d-bg)', border: '1px solid rgba(192,57,43,0.3)',
            padding: '16px 24px', borderRadius: 4, maxWidth: 740,
          }}>
            <div className="serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.6 }}>
              On either side of the HOLC boundary line, pre-existing conditions were essentially identical. The grade was the treatment. The outcomes diverged. The causal claim is defensible.
            </div>
            <Tick style={{ marginTop: 8, display: 'block' }}>
              Source: {boundary.source}
            </Tick>
          </div>
        </>
      )}
    </div>
  );
}

window.TabBoundary = TabBoundary;
