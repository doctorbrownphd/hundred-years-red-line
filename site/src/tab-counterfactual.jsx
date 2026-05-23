// Tab 08 — The Counterfactual
// Extension 02: 500-trajectory ensemble — "What if the GI Bill had been fair?"

function TabCounterfactual() {
  const cf = useData('data/counterfactual_ensemble.json');
  const [hoveredYear, setHoveredYear] = React.useState(null);

  if (!cf) return (
    <div style={{ padding: '32px 48px', color: 'var(--ink-dim)' }}>
      <div className="mono" style={{ fontSize: 11, animation: 'pulse 2s infinite' }}>Loading ensemble data...</div>
    </div>
  );

  const { meta, bands, sample_paths, actual } = cf;

  // Chart dimensions
  const W = 900, H = 400;
  const pad = { top: 30, right: 30, bottom: 40, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const yearMin = 1940, yearMax = 2024;
  const yMin = 15, yMax = 85;

  const x = yr => pad.left + ((yr - yearMin) / (yearMax - yearMin)) * plotW;
  const y = val => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // Build band polygons (outermost to innermost for layering)
  const bandLayers = [
    { lo: 'p5',  hi: 'p95', opacity: 0.08 },
    { lo: 'p10', hi: 'p90', opacity: 0.10 },
    { lo: 'p25', hi: 'p75', opacity: 0.14 },
  ];

  function bandPoly(loKey, hiKey) {
    const fwd = bands.map(b => `${x(b.year)},${y(b[hiKey])}`);
    const rev = bands.slice().reverse().map(b => `${x(b.year)},${y(b[loKey])}`);
    return [...fwd, ...rev].join(' ');
  }

  // Median line
  const medianLine = bands.map(b => `${x(b.year)},${y(b.p50)}`).join(' ');

  // Actual lines
  const whiteLine = actual.map(d => `${x(d.year)},${y(d.white)}`).join(' ');
  const blackLine = actual.map(d => `${x(d.year)},${y(d.black)}`).join(' ');

  // Sample paths (thin ghost lines)
  const sampleLines = sample_paths.map(path =>
    path.map(d => `${x(d.year)},${y(d.rate)}`).join(' ')
  );

  // Gap polygon: area between black actual and counterfactual median
  const gapPoly = [
    ...bands.map(b => `${x(b.year)},${y(b.p50)}`),
    ...actual.slice().reverse().map(d => `${x(d.year)},${y(d.black)}`),
  ].join(' ');

  // Y-axis ticks
  const yTicks = [20, 30, 40, 50, 60, 70, 80];

  // X-axis ticks
  const xTicks = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  // Hover interaction
  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const svgScale = W / rect.width;
    const scaledX = mx * svgScale;
    const yr = Math.round(yearMin + ((scaledX - pad.left) / plotW) * (yearMax - yearMin));
    const snapped = bands.reduce((best, b) => Math.abs(b.year - yr) < Math.abs(best.year - yr) ? b : best, bands[0]);
    setHoveredYear(snapped.year);
  };

  const hoveredBand = hoveredYear ? bands.find(b => b.year === hoveredYear) : null;
  const hoveredActual = hoveredYear ? actual.find(d => d.year === hoveredYear) : null;

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead
        label="08 · The Counterfactual"
        title="What fair access would have built."
        subtitle="500 simulated trajectories of Black homeownership if the GI Bill had been administered without racial discrimination. The fan shows what was lost."
      />

      {/* Confidence label */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        padding: '4px 12px', borderRadius: 3, marginBottom: 24,
      }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)', fontWeight: 700, letterSpacing: 0.15 }}>● SPECULATIVE</span>
        <span className="serif" style={{ fontSize: 11, color: 'var(--ink-dim)', fontStyle: 'italic' }}>Counterfactual ensemble — not a prediction, but a measure of what discrimination cost</span>
      </div>

      {/* Main chart + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 32 }}>

        {/* SVG Chart */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4, padding: 20 }}>
          <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 12 }}>
            Black Homeownership Rate — Actual vs. Counterfactual Ensemble, 1940-2024
          </Tick>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}
            onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredYear(null)}>

            {/* Grid lines */}
            {yTicks.map(v => (
              <React.Fragment key={v}>
                <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke="var(--line)" strokeWidth="0.5" />
                <text x={pad.left - 8} y={y(v) + 4} textAnchor="end" fill="var(--ink-dimmer)" fontSize="9" fontFamily="Space Mono">{v}%</text>
              </React.Fragment>
            ))}

            {/* X-axis labels */}
            {xTicks.map(yr => (
              <text key={yr} x={x(yr)} y={H - 5} textAnchor="middle" fill="var(--ink-dimmer)" fontSize="9" fontFamily="Space Mono">{yr}</text>
            ))}

            {/* GI Bill intervention line */}
            <line x1={x(1944)} y1={pad.top} x2={x(1944)} y2={H - pad.bottom} stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={x(1944)} y={pad.top - 8} textAnchor="middle" fill="var(--gold)" fontSize="8" fontFamily="Space Mono">GI BILL 1944</text>

            {/* Fair Housing Act */}
            <line x1={x(1968)} y1={pad.top} x2={x(1968)} y2={H - pad.bottom} stroke="var(--ink-dimmer)" strokeWidth="0.5" strokeDasharray="3 4" />
            <text x={x(1968)} y={pad.top - 8} textAnchor="middle" fill="var(--ink-dimmer)" fontSize="7" fontFamily="Space Mono">FAIR HOUSING 1968</text>

            {/* Fan bands */}
            {bandLayers.map((layer, i) => (
              <polygon key={i} fill={`rgba(201,168,76,${layer.opacity})`} points={bandPoly(layer.lo, layer.hi)} />
            ))}

            {/* Gap shading between CF median and Black actual */}
            <polygon fill="rgba(192,57,43,0.12)" points={gapPoly} />

            {/* Sample paths */}
            {sampleLines.map((pts, i) => (
              <polyline key={i} fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.7" points={pts} />
            ))}

            {/* Counterfactual median */}
            <polyline fill="none" stroke="var(--gold)" strokeWidth="2" points={medianLine} />

            {/* White actual */}
            <polyline fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 3" points={whiteLine} />

            {/* Black actual */}
            <polyline fill="none" stroke="var(--grade-d)" strokeWidth="2.5" points={blackLine} />

            {/* End labels */}
            {(() => {
              const lastA = actual[actual.length - 1];
              const lastB = bands[bands.length - 1];
              return (
                <React.Fragment>
                  <text x={x(lastA.year) + 6} y={y(lastA.white) + 4} fill="var(--ink)" fontSize="10" fontFamily="Space Mono" fontWeight="700">White {lastA.white}%</text>
                  <text x={x(lastB.year) + 6} y={y(lastB.p50) + 4} fill="var(--gold)" fontSize="10" fontFamily="Space Mono" fontWeight="700">CF {lastB.p50}%</text>
                  <text x={x(lastA.year) + 6} y={y(lastA.black) + 4} fill="var(--grade-d)" fontSize="10" fontFamily="Space Mono" fontWeight="700">Actual {lastA.black}%</text>
                </React.Fragment>
              );
            })()}

            {/* Hover crosshair */}
            {hoveredYear && hoveredBand && hoveredActual && (
              <React.Fragment>
                <line x1={x(hoveredYear)} y1={pad.top} x2={x(hoveredYear)} y2={H - pad.bottom} stroke="var(--ink-dim)" strokeWidth="0.5" />
                <circle cx={x(hoveredYear)} cy={y(hoveredActual.black)} r={3} fill="var(--grade-d)" />
                <circle cx={x(hoveredYear)} cy={y(hoveredActual.white)} r={3} fill="var(--ink)" />
                <circle cx={x(hoveredYear)} cy={y(hoveredBand.p50)} r={3} fill="var(--gold)" />
              </React.Fragment>
            )}
          </svg>

          {/* Hover tooltip */}
          {hoveredYear && hoveredBand && hoveredActual && (
            <div className="mono" style={{
              fontSize: 10, color: 'var(--ink-dim)', marginTop: 8,
              display: 'flex', gap: 24, flexWrap: 'wrap',
            }}>
              <span style={{ color: 'var(--ink)' }}>{hoveredYear}</span>
              <span>White: <span style={{ color: 'var(--ink)' }}>{hoveredActual.white}%</span></span>
              <span>Black actual: <span style={{ color: 'var(--grade-d)' }}>{hoveredActual.black}%</span></span>
              <span>CF median: <span style={{ color: 'var(--gold)' }}>{hoveredBand.p50}%</span></span>
              <span>CF range: <span style={{ color: 'var(--gold)' }}>{hoveredBand.p5}% - {hoveredBand.p95}%</span></span>
              <span>Cost: <span style={{ color: 'var(--grade-d)' }}>{(hoveredBand.p50 - hoveredActual.black).toFixed(1)}pp</span></span>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { color: 'var(--ink)', label: 'White actual (dashed)', dash: true },
              { color: 'var(--grade-d)', label: 'Black actual', dash: false },
              { color: 'var(--gold)', label: 'Counterfactual median', dash: false },
              { color: 'rgba(201,168,76,0.3)', label: '90% fan (500 trajectories)', dash: false, box: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.box ? (
                  <span style={{ width: 14, height: 10, background: item.color, borderRadius: 1, display: 'inline-block' }} />
                ) : (
                  <svg width="18" height="3" style={{ display: 'inline-block' }}>
                    <line x1="0" y1="1.5" x2="18" y2="1.5" stroke={item.color} strokeWidth="2"
                      strokeDasharray={item.dash ? '4 2' : 'none'} />
                  </svg>
                )}
                <Tick>{item.label}</Tick>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* The Cost */}
          <div style={{
            background: 'var(--grade-d-bg)', border: '1px solid rgba(192,57,43,0.3)',
            padding: 20, borderRadius: 4,
          }}>
            <Tick style={{ color: 'var(--grade-d)', fontWeight: 700, display: 'block', marginBottom: 10 }}>The Cost of Exclusion</Tick>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--grade-d)', lineHeight: 1 }}>
                  {meta.gap_closed_pp.toFixed(1)}<span style={{ fontSize: 14 }}>pp</span>
                </div>
                <Tick style={{ marginTop: 4, display: 'block' }}>Homeownership gap attributable to GI Bill discrimination</Tick>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                  ~${meta.implied_wealth_gap_trillions}T
                </div>
                <Tick style={{ marginTop: 4, display: 'block' }}>Implied wealth never built</Tick>
              </div>
            </div>
          </div>

          {/* 2020 Snapshot */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            padding: 20, borderRadius: 4,
          }}>
            <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 10 }}>2020 Snapshot</Tick>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { label: 'White actual', value: `${meta.actual_white_2020}%`, color: 'var(--ink)' },
                { label: 'Black actual', value: `${meta.actual_black_2020}%`, color: 'var(--grade-d)' },
                { label: 'Black counterfactual (median)', value: `${meta.cf_median_2020}%`, color: 'var(--gold)' },
                { label: 'Actual gap', value: `${meta.actual_gap_2020}pp`, color: 'var(--grade-d)' },
                { label: 'Counterfactual gap', value: `${meta.cf_gap_2020.toFixed(1)}pp`, color: 'var(--gold)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tick>{row.label}</Tick>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ensemble params */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            padding: 20, borderRadius: 4,
          }}>
            <Tick style={{ color: 'var(--ink-dim)', fontWeight: 700, display: 'block', marginBottom: 10 }}>Ensemble Parameters</Tick>
            <div style={{ display: 'grid', gap: 4 }}>
              {[
                { label: 'Trajectories', value: meta.n_trajectories },
                { label: 'Intervention', value: meta.intervention_year },
                { label: 'Access fraction', value: `N(${meta.access_fraction_mean}, ${meta.access_fraction_std})` },
                { label: 'Confidence', value: meta.confidence },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tick>{row.label}</Tick>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div style={{
        background: 'var(--bg-2)', borderLeft: '3px solid var(--gold)',
        padding: '20px 24px', borderRadius: 4, maxWidth: 800,
      }}>
        <Tick style={{ color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Methodology · Counterfactual Ensemble</Tick>
        <div className="serif" style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong style={{ color: 'var(--ink)' }}>The question:</strong> What does Black homeownership look like in 2020 if the GI Bill of 1944 had been administered without racial discrimination?
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong style={{ color: 'var(--ink)' }}>The model:</strong> Each of 500 trajectories draws an <em>access fraction</em> from N(0.85, 0.08) representing the share of white homeownership gains that Black veterans would have captured under fair administration. This is not 1.0 because structural barriers beyond the GI Bill (income gaps, geographic concentration) would persist even without lending discrimination. Per-period noise N(0, ~1.5pp) and a compounding wealth-transfer effect account for uncertainty and intergenerational accumulation.
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong style={{ color: 'var(--ink)' }}>The compounding effect:</strong> Homeownership creates equity. Equity enables down payments for children. The longer the counterfactual homeownership rate exceeds actual, the more this intergenerational wealth transfer compounds forward.
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong style={{ color: 'var(--ink)' }}>Wealth estimate:</strong> The implied wealth gap uses median home equity (~$255K) and an estimate of ~195K Black households per percentage point of homeownership. This is a rough lower bound.
          </p>
          <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--ink-dim)' }}>
            This is labeled SPECULATIVE. It is not a prediction. It is a structured way of measuring the scale of what discrimination cost, using the white homeownership trajectory as the natural experiment baseline.
          </p>
        </div>
      </div>
    </div>
  );
}

window.TabCounterfactual = TabCounterfactual;
