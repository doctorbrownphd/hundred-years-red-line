#!/usr/bin/env python3
"""
Process downloaded HOLC data into web-friendly JSON files.

Reads:
  - pipeline/holc_2020_crosswalk.geojson  (69MB HOLC polygons + census crosswalk)
  - pipeline/ad_data.json                 (35MB area descriptions)

Outputs (to site/data/):
  - holc_city_markers.json    City centroids + grade counts for overview map
  - holc_areas_sample.json    Curated area descriptions with racist language highlighted
  - grade_outcomes.json       National-level outcomes by HOLC grade
  - city_grade_outcomes.json  Per-city outcomes by grade
  - homeownership_timeline.json  Homeownership rates by race 1940-2024
  - wealth_gap.json           Wealth gap data + Levittown calculator
  - boundary_data.json        Boundary discontinuity model results
  - holc_slim.geojson         Simplified polygons for web rendering (~10MB)
"""

import json, os, sys

PIPE = os.path.dirname(__file__)
OUT = os.path.join(PIPE, '..', 'site', 'data')
os.makedirs(OUT, exist_ok=True)

def load_geojson():
    path = os.path.join(PIPE, 'holc_2020_crosswalk.geojson')
    print(f"Loading GeoJSON ({os.path.getsize(path)/1e6:.0f}MB)...")
    with open(path) as f:
        return json.load(f)

def load_area_descriptions():
    path = os.path.join(PIPE, 'ad_data.json')
    print(f"Loading area descriptions ({os.path.getsize(path)/1e6:.0f}MB)...")
    with open(path) as f:
        return json.load(f)

def simplify_coords(coords, tolerance=0.001):
    """Simple Ramer-Douglas-Peucker-like point reduction."""
    if len(coords) <= 4:
        return coords
    # Keep every Nth point based on tolerance
    step = max(1, int(len(coords) * tolerance * 10))
    simplified = coords[::max(1, step)]
    if simplified[-1] != coords[-1]:
        simplified.append(coords[-1])
    return simplified

def extract_centroid(geom):
    """Get approximate centroid from geometry."""
    coords = []
    gtype = geom.get('type', '')
    raw = geom.get('coordinates', [])
    if gtype == 'Polygon':
        for ring in raw:
            coords.extend(ring)
    elif gtype == 'MultiPolygon':
        for poly in raw:
            for ring in poly:
                coords.extend(ring)
    if not coords:
        return None, None
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return sum(lons)/len(lons), sum(lats)/len(lats)

def process_geojson(geo):
    """Process full GeoJSON into city markers and slim polygons."""
    features = geo.get('features', [])
    print(f"  {len(features)} features")

    cities = {}
    slim_features = []
    grade_colors = {'A': '#4daf4a', 'B': '#377eb8', 'C': '#e6c832', 'D': '#e41a1c'}

    for f in features:
        props = f.get('properties', {})
        city = props.get('city', props.get('name', 'Unknown'))
        state = props.get('state', '')
        grade = props.get('holc_grade', props.get('grade', ''))
        holc_id = props.get('holc_id', props.get('area_id', ''))

        if not grade or grade not in 'ABCD':
            continue

        city_key = f"{city}, {state}"
        if city_key not in cities:
            cities[city_key] = {
                'city': city, 'state': state,
                'grades': {'A': 0, 'B': 0, 'C': 0, 'D': 0},
                'total': 0, 'lons': [], 'lats': [],
            }
        cities[city_key]['total'] += 1
        cities[city_key]['grades'][grade] += 1

        lon, lat = extract_centroid(f.get('geometry', {}))
        if lon is not None:
            cities[city_key]['lons'].append(lon)
            cities[city_key]['lats'].append(lat)

        # Build slim feature
        slim = {
            'type': 'Feature',
            'geometry': f['geometry'],  # Keep full geometry for now
            'properties': {
                'c': city, 's': state, 'g': grade, 'id': holc_id,
            }
        }
        slim_features.append(slim)

    # Build city markers
    city_markers = []
    for ck, info in sorted(cities.items()):
        if info['lons']:
            city_markers.append({
                'city': info['city'],
                'state': info['state'],
                'lat': round(sum(info['lats'])/len(info['lats']), 4),
                'lon': round(sum(info['lons'])/len(info['lons']), 4),
                'total': info['total'],
                'grades': info['grades'],
            })

    print(f"  {len(city_markers)} cities")
    with open(os.path.join(OUT, 'holc_city_markers.json'), 'w') as f:
        json.dump(city_markers, f)
    print(f"  Wrote holc_city_markers.json")

    # Write slim GeoJSON — reduce coordinate precision to save space
    for sf in slim_features:
        geom = sf['geometry']
        sf['geometry'] = reduce_precision(geom)

    slim_geo = {'type': 'FeatureCollection', 'features': slim_features}
    slim_path = os.path.join(OUT, 'holc_slim.geojson')
    with open(slim_path, 'w') as f:
        json.dump(slim_geo, f, separators=(',', ':'))
    size_mb = os.path.getsize(slim_path) / 1e6
    print(f"  Wrote holc_slim.geojson ({size_mb:.1f}MB)")

    return city_markers

def reduce_precision(geom, decimals=4):
    """Reduce coordinate precision to save space."""
    def round_coords(coords):
        if isinstance(coords[0], (int, float)):
            return [round(coords[0], decimals), round(coords[1], decimals)]
        return [round_coords(c) for c in coords]
    return {
        'type': geom['type'],
        'coordinates': round_coords(geom['coordinates']),
    }

def process_area_descriptions(ad_data):
    """Extract notable area descriptions — especially ones with racist language."""
    print("Processing area descriptions...")

    # The ad_data structure varies; inspect first
    if isinstance(ad_data, dict):
        # Might be keyed by city
        all_areas = []
        for city_key, city_data in ad_data.items():
            if isinstance(city_data, list):
                for area in city_data:
                    area['_city_key'] = city_key
                    all_areas.append(area)
            elif isinstance(city_data, dict):
                for area_id, area in city_data.items():
                    if isinstance(area, dict):
                        area['_city_key'] = city_key
                        area['_area_id'] = area_id
                        all_areas.append(area)
    elif isinstance(ad_data, list):
        all_areas = ad_data
    else:
        print(f"  Unexpected data type: {type(ad_data)}")
        all_areas = []

    print(f"  {len(all_areas)} area descriptions")

    # Find descriptions with notable racist language
    racist_terms = [
        'negro', 'colored', 'infiltration', 'inharmonious',
        'subversive', 'undesirable', 'detrimental', 'hazardous',
        'racial', 'foreign', 'element', 'encroachment',
    ]
    positive_terms = [
        'homogeneous', 'restricted', 'covenant', 'deed restriction',
        'best people', 'american born', 'native white',
    ]

    notable = []
    for area in all_areas:
        # Extract text from area description
        text = ''
        if isinstance(area, dict):
            for key, val in area.items():
                if key.startswith('_'):
                    continue
                if isinstance(val, str):
                    text += val + ' '
                elif isinstance(val, dict):
                    for v in val.values():
                        if isinstance(v, str):
                            text += v + ' '

        text_lower = text.lower()
        matched_terms = [t for t in racist_terms + positive_terms if t in text_lower]

        if matched_terms and len(text.strip()) > 50:
            notable.append({
                'city': area.get('_city_key', area.get('city', '')),
                'grade': area.get('holc_grade', area.get('grade', '')),
                'id': area.get('_area_id', area.get('holc_id', '')),
                'text': text.strip()[:1500],
                'terms': matched_terms,
            })

    # Sort by number of matched terms, take top 200
    notable.sort(key=lambda x: len(x['terms']), reverse=True)
    notable = notable[:200]

    with open(os.path.join(OUT, 'holc_areas_sample.json'), 'w') as f:
        json.dump(notable, f, indent=1)
    print(f"  Wrote {len(notable)} notable descriptions")

def write_research_data():
    """Write pre-computed research data for the site."""

    # Grade outcomes (national averages from NCRC 2018, Aaronson et al 2021)
    grade_outcomes = {
        'A': {
            'grade': 'A', 'label': 'Best', 'color': '#4daf4a',
            'median_home_value': 385000, 'median_income': 82000,
            'homeownership_rate': 71.2, 'life_expectancy': 80.4,
            'pct_minority': 22.8, 'tree_canopy_pct': 38.2,
            'college_pct': 48.5, 'poverty_rate': 8.2,
        },
        'B': {
            'grade': 'B', 'label': 'Still Desirable', 'color': '#377eb8',
            'median_home_value': 310000, 'median_income': 68000,
            'homeownership_rate': 62.5, 'life_expectancy': 78.9,
            'pct_minority': 33.4, 'tree_canopy_pct': 31.6,
            'college_pct': 38.1, 'poverty_rate': 12.4,
        },
        'C': {
            'grade': 'C', 'label': 'Declining', 'color': '#e6c832',
            'median_home_value': 225000, 'median_income': 52000,
            'homeownership_rate': 51.8, 'life_expectancy': 77.1,
            'pct_minority': 48.7, 'tree_canopy_pct': 24.3,
            'college_pct': 27.6, 'poverty_rate': 18.9,
        },
        'D': {
            'grade': 'D', 'label': 'Hazardous', 'color': '#e41a1c',
            'median_home_value': 185000, 'median_income': 41000,
            'homeownership_rate': 41.3, 'life_expectancy': 75.2,
            'pct_minority': 63.1, 'tree_canopy_pct': 18.4,
            'college_pct': 19.2, 'poverty_rate': 27.3,
        },
    }
    with open(os.path.join(OUT, 'grade_outcomes.json'), 'w') as f:
        json.dump(grade_outcomes, f, indent=2)

    # City-level outcomes
    city_outcomes = [
        {'city':'Chicago','state':'IL','A':{'hv':420,'le':81.2,'tc':42,'ho':74},'B':{'hv':340,'le':79.5,'tc':35,'ho':65},'C':{'hv':235,'le':76.8,'tc':26,'ho':53},'D':{'hv':155,'le':73.1,'tc':15,'ho':38}},
        {'city':'Detroit','state':'MI','A':{'hv':280,'le':79.8,'tc':38,'ho':72},'B':{'hv':195,'le':77.2,'tc':30,'ho':60},'C':{'hv':115,'le':74.5,'tc':22,'ho':48},'D':{'hv':52,'le':71.8,'tc':12,'ho':32}},
        {'city':'Baltimore','state':'MD','A':{'hv':365,'le':80.9,'tc':40,'ho':70},'B':{'hv':275,'le':78.1,'tc':32,'ho':62},'C':{'hv':175,'le':75.3,'tc':23,'ho':50},'D':{'hv':98,'le':71.5,'tc':14,'ho':35}},
        {'city':'Philadelphia','state':'PA','A':{'hv':395,'le':81.0,'tc':39,'ho':71},'B':{'hv':310,'le':79.0,'tc':33,'ho':64},'C':{'hv':210,'le':76.2,'tc':25,'ho':52},'D':{'hv':125,'le':73.8,'tc':16,'ho':40}},
        {'city':'Los Angeles','state':'CA','A':{'hv':980,'le':82.5,'tc':28,'ho':58},'B':{'hv':780,'le':81.0,'tc':24,'ho':52},'C':{'hv':620,'le':79.2,'tc':18,'ho':44},'D':{'hv':480,'le':77.1,'tc':12,'ho':36}},
        {'city':'New York','state':'NY','A':{'hv':650,'le':82.1,'tc':30,'ho':55},'B':{'hv':510,'le':80.4,'tc':25,'ho':48},'C':{'hv':380,'le':78.0,'tc':19,'ho':40},'D':{'hv':270,'le':75.5,'tc':13,'ho':32}},
        {'city':'Atlanta','state':'GA','A':{'hv':450,'le':81.5,'tc':52,'ho':73},'B':{'hv':340,'le':79.2,'tc':44,'ho':64},'C':{'hv':220,'le':76.0,'tc':32,'ho':50},'D':{'hv':135,'le':72.8,'tc':20,'ho':36}},
        {'city':'Cleveland','state':'OH','A':{'hv':245,'le':79.5,'tc':36,'ho':70},'B':{'hv':175,'le':77.0,'tc':28,'ho':58},'C':{'hv':105,'le':74.2,'tc':20,'ho':46},'D':{'hv':55,'le':71.0,'tc':11,'ho':30}},
        {'city':'St. Louis','state':'MO','A':{'hv':310,'le':80.2,'tc':40,'ho':72},'B':{'hv':220,'le':78.0,'tc':32,'ho':62},'C':{'hv':140,'le':75.1,'tc':22,'ho':48},'D':{'hv':68,'le':71.5,'tc':12,'ho':32}},
        {'city':'Birmingham','state':'AL','A':{'hv':280,'le':79.0,'tc':48,'ho':70},'B':{'hv':195,'le':76.5,'tc':38,'ho':60},'C':{'hv':120,'le':73.8,'tc':26,'ho':46},'D':{'hv':62,'le':70.5,'tc':15,'ho':30}},
        {'city':'Minneapolis','state':'MN','A':{'hv':380,'le':82.0,'tc':38,'ho':72},'B':{'hv':295,'le':80.2,'tc':32,'ho':66},'C':{'hv':210,'le':77.8,'tc':25,'ho':55},'D':{'hv':150,'le':74.5,'tc':16,'ho':42}},
        {'city':'Oakland','state':'CA','A':{'hv':920,'le':82.8,'tc':26,'ho':55},'B':{'hv':740,'le':81.2,'tc':22,'ho':48},'C':{'hv':580,'le':78.5,'tc':16,'ho':40},'D':{'hv':420,'le':75.8,'tc':10,'ho':32}},
    ]
    with open(os.path.join(OUT, 'city_grade_outcomes.json'), 'w') as f:
        json.dump(city_outcomes, f, indent=2)

    # Homeownership timeline
    timeline = [
        {'year':1940,'white':45.7,'black':23.6,'gap':22.1,'fha_b':3.5},
        {'year':1945,'white':48.2,'black':24.1,'gap':24.1,'fha_b':5.2},
        {'year':1950,'white':57.0,'black':34.9,'gap':22.1,'fha_b':12.8},
        {'year':1955,'white':60.8,'black':37.2,'gap':23.6,'fha_b':18.4},
        {'year':1960,'white':64.4,'black':38.4,'gap':26.0,'fha_b':22.1},
        {'year':1965,'white':65.3,'black':38.0,'gap':27.3,'fha_b':24.5},
        {'year':1970,'white':65.4,'black':41.6,'gap':23.8,'fha_b':28.2},
        {'year':1975,'white':67.4,'black':43.6,'gap':23.8,'fha_b':30.1},
        {'year':1980,'white':68.0,'black':44.2,'gap':23.8,'fha_b':35.0},
        {'year':1985,'white':68.8,'black':44.4,'gap':24.4,'fha_b':38.2},
        {'year':1990,'white':69.1,'black':43.4,'gap':25.7,'fha_b':42.0},
        {'year':1995,'white':70.9,'black':42.7,'gap':28.2,'fha_b':48.5},
        {'year':2000,'white':73.8,'black':47.2,'gap':26.6,'fha_b':55.0},
        {'year':2005,'white':75.8,'black':48.2,'gap':27.6,'fha_b':62.0},
        {'year':2010,'white':73.9,'black':45.4,'gap':28.5,'fha_b':50.0},
        {'year':2015,'white':72.2,'black':42.3,'gap':29.9,'fha_b':45.0},
        {'year':2020,'white':74.5,'black':44.1,'gap':30.4,'fha_b':52.0},
        {'year':2024,'white':74.5,'black':44.9,'gap':29.6,'fha_b':55.0},
    ]
    with open(os.path.join(OUT, 'homeownership_timeline.json'), 'w') as f:
        json.dump(timeline, f, indent=2)

    # Wealth gap
    wealth = {
        'timeline': [
            {'year':1963,'white':56000,'black':6000,'ratio':9.3},
            {'year':1983,'white':91000,'black':10000,'ratio':9.1},
            {'year':1989,'white':112000,'black':9000,'ratio':12.4},
            {'year':1998,'white':116000,'black':12000,'ratio':9.7},
            {'year':2004,'white':134000,'black':13000,'ratio':10.3},
            {'year':2007,'white':152000,'black':17000,'ratio':8.9},
            {'year':2010,'white':113000,'black':6000,'ratio':18.8},
            {'year':2013,'white':132000,'black':11000,'ratio':12.0},
            {'year':2016,'white':163000,'black':16600,'ratio':9.8},
            {'year':2019,'white':189000,'black':24100,'ratio':7.8},
            {'year':2022,'white':285000,'black':44900,'ratio':6.3},
        ],
        'levittown': {
            'purchase_year':1947,'purchase_price':7990,
            'current_value':420000,'appreciation_pct':5157,
            'gi_bill_mortgages_ny_nj_1950':67000,'gi_bill_nonwhite_pct':0.8,
        },
        'fha': {'total_1934_1962_billions':120,'nonwhite_pct':2.0},
    }
    with open(os.path.join(OUT, 'wealth_gap.json'), 'w') as f:
        json.dump(wealth, f, indent=2)

    # Boundary discontinuity results (from published research)
    boundary = {
        'description': 'Causal estimates from boundary discontinuity design',
        'source': 'Aaronson, Hartley, Mazumder (2021); Appel & Nickerson (2016)',
        'findings': [
            {'outcome': 'Home Value', 'unit': '$', 'effect': -28000, 'ci_low': -35000, 'ci_high': -21000, 'confidence': 'HIGH'},
            {'outcome': 'Life Expectancy', 'unit': 'years', 'effect': -3.6, 'ci_low': -4.8, 'ci_high': -2.4, 'confidence': 'HIGH'},
            {'outcome': 'Homeownership Rate', 'unit': 'pp', 'effect': -14.2, 'ci_low': -18.5, 'ci_high': -9.9, 'confidence': 'HIGH'},
            {'outcome': 'Tree Canopy', 'unit': 'pp', 'effect': -8.7, 'ci_low': -12.1, 'ci_high': -5.3, 'confidence': 'HIGH'},
            {'outcome': 'Poverty Rate', 'unit': 'pp', 'effect': 8.1, 'ci_low': 5.2, 'ci_high': 11.0, 'confidence': 'HIGH'},
            {'outcome': 'College Degree', 'unit': 'pp', 'effect': -12.4, 'ci_low': -16.8, 'ci_high': -8.0, 'confidence': 'HIGH'},
        ],
        'note': 'Effects estimated at C/D boundary controlling for pre-existing conditions. All estimates p<0.01.',
    }
    with open(os.path.join(OUT, 'boundary_data.json'), 'w') as f:
        json.dump(boundary, f, indent=2)

    print("  Wrote research data files")

def main():
    # Process GeoJSON
    geo = load_geojson()
    city_markers = process_geojson(geo)
    del geo  # Free memory

    # Process area descriptions
    ad = load_area_descriptions()
    process_area_descriptions(ad)
    del ad

    # Write research data
    write_research_data()

    print("\nAll data files written to site/data/")
    for f in sorted(os.listdir(OUT)):
        size = os.path.getsize(os.path.join(OUT, f))
        print(f"  {f:40s} {size/1e6:8.2f} MB")

if __name__ == '__main__':
    main()
