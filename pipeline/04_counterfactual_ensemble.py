"""
04_counterfactual_ensemble.py — Extension 02
Generates 500 counterfactual trajectories for Black homeownership
under the hypothesis: "What if the GI Bill had been administered without
racial discrimination?"

Model:
  black_cf(t) = black_1940 + (white(t) - white_1940) * access_fraction + noise
  access_fraction ~ Normal(0.85, 0.08)  — not perfect parity
  per-decade noise ~ Normal(0, 2pp)
  Compounding: homeownership creates wealth, wealth enables more homeownership
"""

import json
import pathlib
import numpy as np

SEED = 42
N_TRAJECTORIES = 500
N_SAMPLE_PATHS = 30

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_IN = ROOT / "site" / "data" / "homeownership_timeline.json"
DATA_OUT = ROOT / "pipeline" / "output" / "counterfactual_ensemble.json"
SITE_OUT = ROOT / "site" / "data" / "counterfactual_ensemble.json"

# ---------- load ----------
with open(DATA_IN) as f:
    timeline = json.load(f)

years = [d["year"] for d in timeline]
white_vals = {d["year"]: d["white"] for d in timeline}
black_vals = {d["year"]: d["black"] for d in timeline}

white_1940 = white_vals[1940]
black_1940 = black_vals[1940]

# Intervention year: 1944 (GI Bill signed)
# Pre-intervention years stay at actual values
INTERVENTION_YEAR = 1944

rng = np.random.default_rng(SEED)

# ---------- generate trajectories ----------
all_trajectories = []  # list of dicts {year: rate}

for i in range(N_TRAJECTORIES):
    access_fraction = rng.normal(0.85, 0.08)
    access_fraction = np.clip(access_fraction, 0.55, 1.0)

    # Compounding rate: homeownership creates wealth → wealth enables more
    # homeownership for children/grandchildren.  Each decade of higher
    # homeownership adds a cumulative boost.
    compound_rate = rng.normal(0.0015, 0.0006)   # ~0.15% per year additive
    compound_rate = max(compound_rate, 0.0)

    traj = {}
    cumulative_boost = 0.0
    prev_yr = INTERVENTION_YEAR

    for yr in years:
        if yr <= INTERVENTION_YEAR:
            traj[yr] = black_vals[yr]
        else:
            white_gain = white_vals[yr] - white_1940
            # Base counterfactual: Black homeownership tracks white growth rate
            base = black_1940 + white_gain * access_fraction

            # Compounding: each year of elevated homeownership feeds forward
            years_since = yr - INTERVENTION_YEAR
            # The boost compounds: more owners → more wealth → more owners
            cumulative_boost = compound_rate * years_since * (years_since / 80.0 + 1.0)

            # Per-period noise (scale slightly with time — more uncertainty farther out)
            noise = rng.normal(0, 1.5 + 0.5 * (years_since / 80.0))

            cf_rate = base + cumulative_boost * 100.0 + noise
            # Clamp: CF must beat actual (the counterfactual can't be WORSE
            # than reality), cap at 85% (no society reaches 90%+ ownership)
            cf_rate = np.clip(cf_rate, black_vals[yr], 85.0)
            traj[yr] = round(float(cf_rate), 1)

    all_trajectories.append(traj)

# ---------- compute bands ----------
bands = {}
for yr in years:
    vals = [t[yr] for t in all_trajectories]
    bands[yr] = {
        "p5": round(float(np.percentile(vals, 5)), 1),
        "p10": round(float(np.percentile(vals, 10)), 1),
        "p25": round(float(np.percentile(vals, 25)), 1),
        "p50": round(float(np.percentile(vals, 50)), 1),
        "p75": round(float(np.percentile(vals, 75)), 1),
        "p90": round(float(np.percentile(vals, 90)), 1),
        "p95": round(float(np.percentile(vals, 95)), 1),
    }

# Structure as array for frontend
band_series = []
for yr in years:
    entry = {"year": yr, **bands[yr]}
    band_series.append(entry)

# ---------- sample paths ----------
sample_indices = rng.choice(N_TRAJECTORIES, size=N_SAMPLE_PATHS, replace=False)
sample_paths = []
for idx in sample_indices:
    path = [{"year": yr, "rate": all_trajectories[idx][yr]} for yr in years]
    sample_paths.append(path)

# ---------- summary statistics ----------
# Counterfactual median in 2020
cf_2020_median = bands[2020]["p50"]
actual_2020_black = black_vals[2020]
actual_2020_white = white_vals[2020]

# Gap that would NOT exist
gap_actual = actual_2020_white - actual_2020_black
gap_cf = actual_2020_white - cf_2020_median
gap_closed = gap_actual - gap_cf

# Implied wealth difference
# Median home value ~$300K. Homeownership rate difference * ~45M Black households
# Very rough: each percentage point of homeownership = ~195K households
# Wealth per owned home ~$255K (net equity)
pct_diff = cf_2020_median - actual_2020_black
households_per_pp = 195_000  # rough estimate of Black households per pp
wealth_per_home = 255_000  # median home equity
implied_wealth = round(pct_diff * households_per_pp * wealth_per_home / 1e12, 1)

# 2024 values
cf_2024_vals = [t[2024] for t in all_trajectories]
cf_2024_median = round(float(np.median(cf_2024_vals)), 1)

summary = {
    "n_trajectories": N_TRAJECTORIES,
    "intervention_year": INTERVENTION_YEAR,
    "intervention": "GI Bill administered without racial discrimination",
    "actual_black_2020": actual_2020_black,
    "actual_white_2020": actual_2020_white,
    "actual_gap_2020": round(gap_actual, 1),
    "cf_median_2020": cf_2020_median,
    "cf_gap_2020": round(gap_cf, 1),
    "gap_closed_pp": round(gap_closed, 1),
    "cf_median_2024": cf_2024_median,
    "actual_black_2024": black_vals[2024],
    "implied_wealth_gap_trillions": implied_wealth,
    "access_fraction_mean": 0.85,
    "access_fraction_std": 0.08,
    "confidence": "SPECULATIVE",
}

# ---------- output ----------
output = {
    "meta": summary,
    "bands": band_series,
    "sample_paths": sample_paths,
    "actual": [{"year": yr, "white": white_vals[yr], "black": black_vals[yr]} for yr in years],
}

for out_path in [DATA_OUT, SITE_OUT]:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {out_path}")

print(f"\n--- Summary ---")
print(f"Trajectories: {N_TRAJECTORIES}")
print(f"Intervention: {INTERVENTION_YEAR} — GI Bill without racial discrimination")
print(f"Actual Black homeownership 2020: {actual_2020_black}%")
print(f"Counterfactual median 2020:      {cf_2020_median}%")
print(f"Actual gap 2020:                 {gap_actual}pp")
print(f"Counterfactual gap 2020:         {gap_cf}pp")
print(f"Gap closed:                      {gap_closed}pp")
print(f"Implied wealth difference:       ~${implied_wealth}T")
print(f"CF median 2024:                  {cf_2024_median}%")
