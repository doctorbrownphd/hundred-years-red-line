// Tab 01 — The Map
// Full-screen MapLibre map with HOLC grade overlays for 239 cities.

function TabMap() {
  const mapRef = React.useRef(null);
  const mapObjRef = React.useRef(null);
  const markers = useData('data/holc_city_markers.json');
  const [selectedCity, setSelectedCity] = React.useState(null);
  const [cityData, setCityData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [hoveredGrade, setHoveredGrade] = React.useState(null);

  // Initialize map
  React.useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          'carto': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '© CARTO © OpenStreetMap',
          }
        },
        layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
      },
      center: [-95.7, 38.5],
      zoom: 4,
      maxZoom: 16,
      minZoom: 3,
    });
    mapObjRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Popup on click
    map.on('click', 'holc-fill', (e) => {
      const props = e.features[0].properties;
      const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '240px' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family:'Space Mono',monospace;font-size:11px;color:#222">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="background:${gradeColor(props.g)};color:#fff;padding:2px 6px;border-radius:1px;font-weight:700">${props.g}</span>
              <span style="font-weight:700">${gradeLabel(props.g)}</span>
            </div>
            <div style="font-size:10px;color:#666">${props.c}, ${props.s}</div>
            ${props.id ? `<div style="font-size:9px;color:#888;margin-top:2px">Area ${props.id}</div>` : ''}
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'holc-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'holc-fill', () => { map.getCanvas().style.cursor = ''; });

    return () => map.remove();
  }, []);

  // Add city markers
  React.useEffect(() => {
    if (!markers || !mapObjRef.current) return;
    const map = mapObjRef.current;

    markers.forEach(m => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 10px; height: 10px; border-radius: 50%;
        background: var(--grade-d); border: 1.5px solid rgba(240,237,230,0.5);
        cursor: pointer; transition: transform 200ms;
      `;
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.8)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
      el.addEventListener('click', () => loadCity(m));

      new maplibregl.Marker({ element: el })
        .setLngLat([m.lon, m.lat])
        .addTo(map);
    });
  }, [markers]);

  async function loadCity(city) {
    const map = mapObjRef.current;
    if (!map) return;
    setSelectedCity(city);
    setLoading(true);

    // Fly to city
    map.flyTo({ center: [city.lon, city.lat], zoom: 12, duration: 1500 });

    // Load city GeoJSON
    const key = `${city.city}_${city.state}`.replace(/ /g, '_').replace(/\./g, '');
    try {
      const data = await fetchData(`data/cities/${key}.json`);
      setCityData(data);

      // Remove existing HOLC layer
      if (map.getSource('holc')) {
        map.removeLayer('holc-fill');
        map.removeLayer('holc-line');
        map.removeSource('holc');
      }

      // Add new source + layers
      map.addSource('holc', { type: 'geojson', data });
      map.addLayer({
        id: 'holc-fill',
        type: 'fill',
        source: 'holc',
        paint: {
          'fill-color': ['match', ['get', 'g'], 'A', '#4daf4a', 'B', '#377eb8', 'C', '#e6c832', 'D', '#c0392b', '#888'],
          'fill-opacity': 0.45,
        },
      });
      map.addLayer({
        id: 'holc-line',
        type: 'line',
        source: 'holc',
        paint: {
          'line-color': ['match', ['get', 'g'], 'A', '#4daf4a', 'B', '#377eb8', 'C', '#e6c832', 'D', '#c0392b', '#888'],
          'line-width': 1.5,
          'line-opacity': 0.7,
        },
      });
    } catch (e) {
      console.error('Failed to load city data:', e);
    }
    setLoading(false);
  }

  function resetView() {
    const map = mapObjRef.current;
    if (!map) return;
    if (map.getSource('holc')) {
      map.removeLayer('holc-fill');
      map.removeLayer('holc-line');
      map.removeSource('holc');
    }
    setSelectedCity(null);
    setCityData(null);
    map.flyTo({ center: [-95.7, 38.5], zoom: 4, duration: 1200 });
  }

  return (
    <div style={{ padding: '32px 48px' }}>
      <SectionHead label="01 · The Map" title="239 cities. Four grades." subtitle="Click any city to see its HOLC grades overlaid on the current map. The grades were drawn between 1935 and 1940." />

      <GradeLegend style={{ marginBottom: 16 }} />

      <div style={{ position: 'relative', height: 600, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* City info overlay */}
        {selectedCity && (
          <div style={{
            position: 'absolute', top: 12, left: 12, background: 'rgba(26,26,26,0.92)',
            border: '1px solid var(--line)', padding: '14px 18px', borderRadius: 4, maxWidth: 280,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="garamond" style={{ fontSize: 22, color: 'var(--ink)' }}>{selectedCity.city}</div>
                <Tick>{selectedCity.state} · {selectedCity.total} areas graded</Tick>
              </div>
              <button onClick={resetView} className="mono" style={{
                background: 'none', border: '1px solid var(--line)', color: 'var(--ink-dim)',
                padding: '4px 8px', fontSize: 9, cursor: 'pointer', letterSpacing: 0.1,
              }}>← Back</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {GRADE_ORDER.map(g => (
                <div key={g} style={{
                  flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 2,
                  background: gradeBg(g), border: `1px solid ${gradeColor(g)}33`,
                }}>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: gradeColor(g) }}>{selectedCity.grades[g]}</div>
                  <div className="mono" style={{ fontSize: 8, color: 'var(--ink-dim)' }}>{g}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'rgba(26,26,26,0.9)', padding: '12px 24px', borderRadius: 4,
          }}>
            <Tick style={{ animation: 'pulse 1.5s infinite' }}>Loading HOLC data…</Tick>
          </div>
        )}

        {!selectedCity && markers && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, background: 'rgba(26,26,26,0.9)',
            padding: '8px 14px', borderRadius: 4, border: '1px solid var(--line)',
          }}>
            <Tick>{markers.length} cities mapped · Click any dot to explore</Tick>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1,
        marginTop: 24, background: 'var(--line)', borderRadius: 4, overflow: 'hidden',
      }}>
        {[
          { label: 'Cities Mapped', value: '239', color: 'var(--ink)' },
          { label: 'Neighborhoods Graded', value: '~15,000', color: 'var(--ink)' },
          { label: 'Grade D Still Majority-Minority', value: '74%', color: 'var(--grade-d)' },
          { label: 'Home Value Gap (A vs D)', value: '$200K+', color: 'var(--grade-a)' },
          { label: 'Years Since the Line Was Drawn', value: '90', color: 'var(--gold)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-2)', padding: '18px 16px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <Tick style={{ marginTop: 4, display: 'block' }}>{s.label}</Tick>
          </div>
        ))}
      </div>
    </div>
  );
}

window.TabMap = TabMap;
