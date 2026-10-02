#!/usr/bin/env python3
"""Stage 1 — corpus identity: list snapshots -> deduped titles -> pageids.

Cache-first: reuses data/cache/corpus-scan.json when present (no network).
Emits data/build/corpus.json with per-soup source lists.
"""

import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'data/raw/wikipedia'
CACHE = ROOT / 'data/cache'
BUILD = ROOT / 'data/build'

UA = {
    'User-Agent': (
        'soup-quiz-dataset-pipeline/0.1 '
        '(https://github.com/stilkin/soup-quiz; dev contact via repo)'
    )
}
API = 'https://en.wikipedia.org/w/api.php'
LINK = re.compile(r'\[\[([^\]|]+)(?:\|[^\]]*)?\]\]')


def collect_names():
    names: dict[str, set] = {}

    def add(name, source):
        name = name.strip()
        if not name or ':' in name or name.startswith('List of'):
            return
        if name.lower() in ('soup', 'stew', 'noodle soup', 'dessert'):
            return
        names.setdefault(name, set()).add(source)

    main = (RAW / 'list-of-soups.wikitext').read_text(encoding='utf-8')
    table = re.search(r'==Soups==(.*?)==See also==', main, re.S).group(1)
    for chunk in re.split(r'\|-', table)[1:]:
        cells = [l[1:].strip() for l in chunk.split('\n') if l.startswith('|')]
        if cells:
            m = LINK.search(cells[0])
            if m:
                add(m.group(1), 'main')

    for path in sorted(RAW.glob('List_of_*.wikitext')):
        if path.name == 'List_of_porridges.wikitext':
            continue
        src = path.stem
        for line in path.read_text(encoding='utf-8').split('\n'):
            if re.match(r'^\*+\s', line) or line.startswith('|[['):
                m = LINK.search(line)
                if m:
                    add(m.group(1), src)
    return names


def resolve(names):
    scan = CACHE / 'corpus-scan.json'
    if scan.exists():
        data = json.loads(scan.read_text())
        sources = data.get('sources', {})
        corpus = {
            original: {
                'pageid': entry['pageid'],
                'title': entry['title'],
                'sources': sources.get(original, [entry['title']]),
            }
            for original, entry in data['corpus'].items()
            if original in names
        }
        unresolved = [u for u in data.get('unresolved', []) if u in names]
        return corpus, unresolved, True

    corpus, unresolved = {}, []
    all_names = sorted(names)
    for i in range(0, len(all_names), 25):
        batch = all_names[i:i + 25]
        params = urllib.parse.urlencode(
            {'action': 'query', 'format': 'json', 'titles': '|'.join(batch), 'redirects': '1'}
        ).encode()
        data = json.loads(_api(params))
        norm = {}
        for nr in data['query'].get('normalized', []):
            norm[nr['to']] = nr['from']
        for rd in data['query'].get('redirects', []):
            norm[rd['to']] = norm.get(rd['from'], rd['from'])
        for page in data['query']['pages'].values():
            if 'missing' in page:
                unresolved.append(page['title'])
                continue
            original = norm.get(page['title'], page['title'])
            if original in names:
                corpus[original] = {'pageid': page['pageid'], 'title': page['title'],
                                    'sources': sorted(names[original])}
        time.sleep(3)
    return corpus, unresolved, False


def _api(body):
    for attempt in range(5):
        try:
            return urllib.request.urlopen(
                urllib.request.Request(API, data=body, headers=UA), timeout=90
            ).read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(int(e.headers.get('Retry-After', '15')))
                continue
            raise
        except Exception:
            if attempt == 4:
                raise
            time.sleep(5)


def main():
    BUILD.mkdir(parents=True, exist_ok=True)
    names = collect_names()
    corpus, unresolved, cached = resolve(names)
    out = {'corpus': corpus, 'unresolved': unresolved}
    (BUILD / 'corpus.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f'candidates: {len(names)}  resolved: {len(corpus)}  unresolved: {len(unresolved)}'
          f'  ({"from cache — no network" if cached else "fetched"})')
    if unresolved:
        print('unresolved:', ', '.join(unresolved[:10]), '...' if len(unresolved) > 10 else '')
    return 0


if __name__ == '__main__':
    sys.exit(main())
