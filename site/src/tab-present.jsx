// Tab 06 — The Present
// Modern redlining, gentrification, current homeownership gap.

function TabPresent() {
  const wealth = useData('data/wealth_gap.json');

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="06 · The Present"
        title="The line is still working."
        subtitle="Redlining was outlawed in 1968. The damage compounds every year."
      />

      {/* Current homeownership gap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 24, borderRadius: 4, textAlign: 'center' }}>
          <StatBlock label="White Homeownership Rate" value="74.5%" color="var(--ink)" />
        </div>
        <div style={{ background: 'var(--grade-d-bg)', border: '1px solid rgba(192,57,43,0.3)', padding: 24, borderRadius: 4, textAlign: 'center' }}>
          <StatBlock label="Black Homeownership Rate" value="44.9%" color="var(--grade-d)" />
        </div>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 24, borderRadius: 4, textAlign: 'center' }}>
          <StatBlock label="Gap (Wider Than 1960)" value="29.6pp" color="var(--gold)" />
        </div>
      </div>

      {/* Wealth gap timeline */}
      {wealth && (
        <div style={{ marginBottom: 40 }}>
          <Tick style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 16, display: 'block' }}>
            Median Family Wealth by Race, 1963–2022
          </Tick>
          <svg viewBox="0 0 800 300" style={{ width: '100%', maxWidth: 800, display: 'block', overflow: 'visible' }}>
            {/* Grid */}
            {[0, 50, 100, 150, 200, 250, 300].map(v => (
              <React.Fragment key={v}>
                <line x1={60} y1={260 - (v / 300) * 220} x2={760} y2={260 - (v / 300) * 220} stroke="var(--line)" strokeWidth="0.5" />
                <text x={55} y={260 - (v / 300) * 220 + 4} textAnchor="end" fill="var(--ink-dimmer)" fontSize="9" fontFamily="Space Mono">${v}K</text>
              </React.Fragment>
            ))}

            {/* Year labels */}
            {wealth.timeline.filter((_, i) => i % 2 === 0).map(d => {
              const x = 60 + ((d.year - 1963) / 59) * 700;
              return <text key={d.year} x={x} y={280} textAnchor="middle" fill="var(--ink-dimmer)" fontSize="9" fontFamily="Space Mono">{d.year}</text>;
            })}

            {/* White wealth */}
            <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5"
              points={wealth.timeline.map(d => `${60 + ((d.year - 1963) / 59) * 700},${260 - (d.white / 1000 / 300) * 220}`).join(' ')} />

            {/* Black wealth */}
            <polyline fill="none" stroke="var(--grade-d)" strokeWidth="2.5"
              points={wealth.timeline.map(d => `${60 + ((d.year - 1963) / 59) * 700},${260 - (d.black / 1000 / 300) * 220}`).join(' ')} />

            {/* Gap fill */}
            <polygon fill="rgba(192,57,43,0.06)"
              points={[
                ...wealth.timeline.map(d => `${60 + ((d.year - 1963) / 59) * 700},${260 - (d.white / 1000 / 300) * 220}`),
                ...wealth.timeline.slice().reverse().map(d => `${60 + ((d.year - 1963) / 59) * 700},${260 - (d.black / 1000 / 300) * 220}`),
              ].join(' ')} />

            {/* 2008 crash marker */}
            <line x1={60 + ((2008 - 1963) / 59) * 700} y1={30} x2={60 + ((2008 - 1963) / 59) * 700} y2={260} stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={60 + ((2008 - 1963) / 59) * 700} y={25} textAnchor="middle" fill="var(--gold)" fontSize="9" fontFamily="Space Mono">2008 Crash</text>

            {/* Labels */}
            <text x={750} y={260 - (wealth.timeline[wealth.timeline.length-1].white / 1000 / 300) * 220 - 8} fill="var(--ink)" fontSize="10" fontFamily="Space Mono" fontWeight="700">White</text>
            <text x={750} y={260 - (wealth.timeline[wealth.timeline.length-1].black / 1000 / 300) * 220 + 14} fill="var(--grade-d)" fontSize="10" fontFamily="Space Mono" fontWeight="700">Black</text>
          </svg>

          <div className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink-dim)', marginTop: 12, maxWidth: 640, lineHeight: 1.6 }}>
            The 2008 financial crisis destroyed 56% of Black median wealth — vs. 26% of white median wealth. Black families were disproportionately targeted by subprime lenders, many of whom operated in formerly redlined neighborhoods.
          </div>
        </div>
      )}

      {/* Modern redlining */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 24, borderRadius: 4 }}>
          <Tick style={{ color: 'var(--grade-d)', fontWeight: 700 }}>Modern Redlining</Tick>
          <div className="garamond" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 8, lineHeight: 1.3 }}>
            HMDA data shows persistent lending disparities in formerly redlined neighborhoods.
          </div>
          <div className="serif" style={{ fontSize: 13, color: 'var(--ink-dim)', fontStyle: 'italic', marginTop: 12, lineHeight: 1.6 }}>
            The Home Mortgage Disclosure Act requires lenders to report every mortgage application and outcome by race and geography. NCRC analysis has documented billions in lending disparities in major cities. The correlation between 1930s HOLC grades and current lending denial rates remains statistically significant.
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-dimmer)', marginTop: 8 }}>
            CONFIDENCE: CANDIDATE — correlation is strong, causation requires additional controls
          </div>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 24, borderRadius: 4 }}>
          <Tick style={{ color: 'var(--grade-c)', fontWeight: 700 }}>The Displacement Irony</Tick>
          <div className="garamond" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 8, lineHeight: 1.3 }}>
            Neighborhoods denied investment for 60 years are now being taken by investment.
          </div>
          <div className="serif" style={{ fontSize: 13, color: 'var(--ink-dim)', fontStyle: 'italic', marginTop: 12, lineHeight: 1.6 }}>
            Formerly redlined neighborhoods with low property values — the direct result of decades of disinvestment — are now targets for gentrification. The families who stayed through the disinvestment are being displaced as the capital finally arrives. The cruelty is architectural: first denied wealth, then priced out of the neighborhood where they endured the denial.
          </div>
        </div>
      </div>

      {/* Baltimore firearm stat */}
      <div style={{
        background: 'var(--grade-d-bg)', border: '1px solid rgba(192,57,43,0.3)',
        padding: '20px 28px', borderRadius: 4, maxWidth: 740,
      }}>
        <div className="serif" style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6 }}>
          Research in Baltimore found that for every one-unit increase in HOLC redlining score, there is a <span className="mono" style={{ color: 'var(--grade-d)', fontWeight: 700, fontSize: 18 }}>2.24×</span> increase in the rate of firearm injuries.
        </div>
        <div className="serif" style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-dim)', marginTop: 8 }}>
          The line between a 1930s government document and a 2020s gunshot wound runs through decades of disinvestment, concentrated poverty, inadequate public services, and the absence of economic opportunity.
        </div>
      </div>
    </div>
  );
}

window.TabPresent = TabPresent;
