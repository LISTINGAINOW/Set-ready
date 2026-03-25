import json
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

BASE = Path('/Users/joshuafeuer/.openclaw/workspace/setready')
PROPS_DIR = BASE / 'public/images/properties'
OUT = BASE / 'data/property-analysis.json'
ANALYZER = Path('/Users/joshuafeuer/.openclaw/skills/property-vision-analyzer/scripts/analyze_property.py')
MAX_WORKERS = 4
TIMEOUT = 3600

lock = Lock()


def load_results():
    if OUT.exists():
        data = json.loads(OUT.read_text())
    else:
        data = {
            'analyzed_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'total_properties': 0,
            'properties': [],
            'errors': []
        }
    data.setdefault('analyzed_at', datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))
    data.setdefault('properties', [])
    data.setdefault('errors', [])
    data['total_properties'] = len(data['properties'])
    return data


def save(results):
    results['total_properties'] = len(results['properties'])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2))


def analyze(folder: Path):
    cmd = ['python3', str(ANALYZER), str(folder), '--max-images', '10']
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=TIMEOUT)
    return folder.name, proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def main():
    results = load_results()
    done_ids = {p.get('property_id') for p in results['properties']}
    folders = [p for p in sorted(PROPS_DIR.iterdir()) if p.is_dir() and p.name not in done_ids]
    save(results)
    print(f'START remaining={len(folders)} done={len(done_ids)}', flush=True)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(analyze, folder): folder.name for folder in folders}
        for fut in as_completed(futures):
            folder_name = futures[fut]
            try:
                property_id, returncode, stdout, stderr = fut.result()
                if returncode != 0:
                    entry = {
                        'property_id': property_id,
                        'error': f'analyzer exit {returncode}',
                        'stderr': stderr[-4000:],
                        'stdout': stdout[-4000:]
                    }
                    with lock:
                        results['errors'].append(entry)
                        save(results)
                    print(f'ERROR {property_id}: analyzer exit {returncode}', flush=True)
                    continue
                parsed = json.loads(stdout)
                entry = {
                    'property_id': parsed.get('property_id', property_id),
                    'rooms_detected': parsed.get('rooms_detected', []),
                    'amenities': parsed.get('amenities', []),
                    'style': parsed.get('style'),
                    'features': parsed.get('features', []),
                    'bedrooms_visible': parsed.get('bedrooms_visible', 0),
                    'bathrooms_visible': parsed.get('bathrooms_visible', 0),
                    'confidence': parsed.get('confidence', 0),
                }
                with lock:
                    results['properties'] = [p for p in results['properties'] if p.get('property_id') != entry['property_id']]
                    results['properties'].append(entry)
                    save(results)
                print(f'DONE {property_id}', flush=True)
            except Exception as e:
                with lock:
                    results['errors'].append({'property_id': folder_name, 'error': f'runner exception: {e}'})
                    save(results)
                print(f'ERROR {folder_name}: {e}', flush=True)

    with lock:
        save(results)
    print(f'COMPLETE total={len(results["properties"])} errors={len(results["errors"])}', flush=True)


if __name__ == '__main__':
    main()
