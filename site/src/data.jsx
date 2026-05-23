// Data loading utilities and shared state

const DATA_CACHE = {};

async function fetchData(path) {
  if (DATA_CACHE[path]) return DATA_CACHE[path];
  const resp = await fetch(path);
  const data = await resp.json();
  DATA_CACHE[path] = data;
  return data;
}

function useData(path) {
  const [data, setData] = React.useState(DATA_CACHE[path] || null);
  React.useEffect(() => {
    if (DATA_CACHE[path]) { setData(DATA_CACHE[path]); return; }
    fetchData(path).then(setData);
  }, [path]);
  return data;
}

// HOLC grade config
const GRADES = {
  A: { label: 'Best', color: '#4daf4a', bg: '#1E2A1E' },
  B: { label: 'Still Desirable', color: '#377eb8', bg: '#1E2840' },
  C: { label: 'Declining', color: '#e6c832', bg: '#3A3010' },
  D: { label: 'Hazardous', color: '#c0392b', bg: '#6B1A1A' },
};

const GRADE_ORDER = ['A', 'B', 'C', 'D'];

function gradeColor(g) { return GRADES[g]?.color || '#888'; }
function gradeLabel(g) { return GRADES[g]?.label || g; }
function gradeBg(g) { return GRADES[g]?.bg || '#222'; }

// Number formatting
function fmt(n) { return n == null ? '—' : n.toLocaleString(); }
function fmtK(n) { return n == null ? '—' : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`; }
function fmtPct(n) { return n == null ? '—' : `${n.toFixed(1)}%`; }

window.useData = useData;
window.fetchData = fetchData;
window.GRADES = GRADES;
window.GRADE_ORDER = GRADE_ORDER;
window.gradeColor = gradeColor;
window.gradeLabel = gradeLabel;
window.gradeBg = gradeBg;
window.fmt = fmt;
window.fmtK = fmtK;
window.fmtPct = fmtPct;
