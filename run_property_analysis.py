import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/Users/joshuafeuer/.openclaw/workspace/setready')
PROPS_DIR = BASE / 'public/images/properties'
OUT = BASE / 'data/property-analysis.json'
ANALYZER = Path('/Users/joshuafeuer/.openclaw/skills/property-vision-analyzer/scripts/analyze_property.py')


def save(results):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open('w') as f:
        json.dump(results, f, indent=2)


def main():
    results = {
        'analyzed_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'total_properties': 0,
        'properties': [],
        'errors': []
    }
    save(results)

    folders = sorted([p for p in PROPS_DIR.iterdir() if p.is_dir()])
    for folder in folders:
        cmd = ['python3', str(ANALYZER), str(folder), '--max-images', '10']
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        except Exception as e:
            results['errors'].append({'property_id': folder.name, 'error': f'runner exception: {e}'})
            save(results)
            print(f'ERROR {folder.name}: {e}', file=sys.stderr, flush=True)
            continue

        if proc.returncode != 0:
            results['errors'].append({
                'property_id': folder.name,
                'error': f'analyzer exit {proc.returncode}',
                'stderr': proc.stderr[-4000:],
                'stdout': proc.stdout[-4000:]
            })
            save(results)
            print(f'ERROR {folder.name}: analyzer exit {proc.returncode}', file=sys.stderr, flush=True)
            continue

        out = proc.stdout.strip()
        try:
            parsed = json.loads(out)
        except json.JSONDecodeError as e:
            results['errors'].append({
                'property_id': folder.name,
                'error': f'json parse error: {e}',
                'stdout': out[-4000:],
                'stderr': proc.stderr[-4000:]
            })
            save(results)
            print(f'ERROR {folder.name}: json parse error', file=sys.stderr, flush=True)
            continue

        results['properties'].append({
            'property_id': parsed.get('property_id', folder.name),
            'rooms_detected': parsed.get('rooms_detected', []),
            'amenities': parsed.get('amenities', []),
            'style': parsed.get('style'),
            'features': parsed.get('features', []),
            'bedrooms_visible': parsed.get('bedrooms_visible', 0),
            'bathrooms_visible': parsed.get('bathrooms_visible', 0),
            'confidence': parsed.get('confidence', 0)
        })
        results['total_properties'] = len(results['properties'])
        save(results)
        print(f'DONE {folder.name}', flush=True)

    results['total_properties'] = len(results['properties'])
    save(results)
    print(f'COMPLETE total={results["total_properties"]} errors={len(results["errors"])}', flush=True)


if __name__ == '__main__':
    main()
