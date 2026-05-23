#!/usr/bin/env python3
"""
Download HOLC (Home Owners' Loan Corporation) redlining data from the
Mapping Inequality project at the University of Richmond.

Downloads GeoJSON polygons for all 239 mapped cities plus area description
metadata. Outputs:
  - data/holc_polygons.geojson   (all graded areas, all cities)
  - data/holc_areas.json         (area descriptions + metadata)
  - data/holc_cities.json        (city-level summary)
"""

import json, os, sys, time, urllib.request, urllib.error

OUT = os.path.join(os.path.dirname(__file__), '..', 'site', 'data')
os.makedirs(OUT, exist_ok=True)

# Mapping Inequality API
MI_API = "https://dsl.richmond.edu/panorama/redlining/data"

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'OneHundredYears/1.0 (research)'})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None

def main():
    print("Downloading full HOLC GeoJSON from Mapping Inequality...")
    full_url = "https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/fullDownload.geojson"
    full = fetch_json(full_url)
    if full:
        process_full_download(full)
    else:
        print("ERROR: Could not download HOLC data. Check network.")
        sys.exit(1)

def process_full_download(full_geojson):
    """Process the full GeoJSON download from Mapping Inequality."""
    features = full_geojson.get('features', [])
    print(f"Downloaded {len(features)} HOLC areas")

    # Extract city summaries
    cities = {}
    areas = []
    grade_colors = {'A': '#4daf4a', 'B': '#377eb8', 'C': '#ffff33', 'D': '#e41a1c'}

    for f in features:
        props = f.get('properties', {})
        city = props.get('city', 'Unknown')
        state = props.get('state', '')
        grade = props.get('holc_grade', '')
        holc_id = props.get('holc_id', '')
        desc = props.get('area_description_data', {})

        city_key = f"{city}, {state}"
        if city_key not in cities:
            cities[city_key] = {
                'city': city, 'state': state,
                'grades': {'A': 0, 'B': 0, 'C': 0, 'D': 0},
                'total_areas': 0
            }
        cities[city_key]['total_areas'] += 1
        if grade in cities[city_key]['grades']:
            cities[city_key]['grades'][grade] += 1

        # Flatten area description
        area_desc_text = ''
        if isinstance(desc, dict):
            # Extract text from nested structure
            for section in desc.values():
                if isinstance(section, str):
                    area_desc_text += section + ' '
                elif isinstance(section, dict):
                    for v in section.values():
                        if isinstance(v, str):
                            area_desc_text += v + ' '
        elif isinstance(desc, str):
            area_desc_text = desc

        areas.append({
            'city': city,
            'state': state,
            'grade': grade,
            'holc_id': holc_id,
            'description': area_desc_text.strip()[:2000],  # Cap length
        })

        # Set color property for rendering
        f['properties']['fill'] = grade_colors.get(grade, '#888')
        f['properties']['fill-opacity'] = 0.4

    # Write outputs
    print(f"Writing {len(features)} polygons...")
    with open(os.path.join(OUT, 'holc_polygons.geojson'), 'w') as f_out:
        json.dump(full_geojson, f_out)

    # Write simplified version for web (no full descriptions in geojson)
    slim_features = []
    for f in features:
        slim = {
            'type': 'Feature',
            'geometry': f['geometry'],
            'properties': {
                'city': f['properties'].get('city', ''),
                'state': f['properties'].get('state', ''),
                'grade': f['properties'].get('holc_grade', ''),
                'id': f['properties'].get('holc_id', ''),
            }
        }
        slim_features.append(slim)

    slim_geojson = {'type': 'FeatureCollection', 'features': slim_features}
    with open(os.path.join(OUT, 'holc_slim.geojson'), 'w') as f_out:
        json.dump(slim_geojson, f_out)
    print(f"  Slim GeoJSON: {len(slim_features)} features")

    # Write area descriptions
    with open(os.path.join(OUT, 'holc_areas.json'), 'w') as f_out:
        json.dump(areas, f_out, indent=1)
    print(f"  Area descriptions: {len(areas)}")

    # Write city summaries
    city_list = sorted(cities.values(), key=lambda c: c['city'])
    with open(os.path.join(OUT, 'holc_cities.json'), 'w') as f_out:
        json.dump(city_list, f_out, indent=1)
    print(f"  Cities: {len(city_list)}")

    # Write per-city GeoJSON index for lazy loading
    city_index = {}
    for f in features:
        props = f.get('properties', {})
        city_key = f"{props.get('city', '')}, {props.get('state', '')}"
        if city_key not in city_index:
            city_index[city_key] = []
        city_index[city_key].append(len(city_index[city_key]))

    # Compute city centroids for the overview map
    city_markers = []
    for ck, info in cities.items():
        # Find centroid from features
        lats, lons = [], []
        for f in features:
            p = f.get('properties', {})
            if f"{p.get('city','')}, {p.get('state','')}" == ck:
                geom = f.get('geometry', {})
                coords = extract_coords(geom)
                for lon, lat in coords:
                    lats.append(lat)
                    lons.append(lon)
        if lats:
            city_markers.append({
                'city': info['city'],
                'state': info['state'],
                'lat': sum(lats)/len(lats),
                'lon': sum(lons)/len(lons),
                'total': info['total_areas'],
                'grades': info['grades'],
            })

    with open(os.path.join(OUT, 'holc_city_markers.json'), 'w') as f_out:
        json.dump(city_markers, f_out, indent=1)
    print(f"  City markers: {len(city_markers)}")

    print("Done.")

def extract_coords(geom):
    """Recursively extract [lon,lat] pairs from a geometry."""
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
    return coords

def process_cities(cities_data):
    """Process structured city list from API."""
    print(f"Got {len(cities_data)} cities, downloading full GeoJSON...")
    # Redirect to full download
    full_url = "https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/fullDownload.geojson"
    full = fetch_json(full_url)
    if full:
        process_full_download(full)
    else:
        print("ERROR: Could not download full GeoJSON")
        sys.exit(1)

if __name__ == '__main__':
    main()
