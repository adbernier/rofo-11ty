import json
import pathlib
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET

site = pathlib.Path(sys.argv[1])
results = []
for source in sorted(site.rglob('*.xml')):
    if 'sitemap' not in source.name:
        continue
    entry = {'path': str(source.relative_to(site)), 'bytes': source.stat().st_size}
    try:
        tree = ET.parse(source).getroot()
        urls = [node.text for node in tree.findall('.//{*}loc')]
        entry.update(validXML=True, urls=len(urls), duplicateUrls=len(urls)-len(set(urls)), missing=[], noindex=[], foreign=[])
        for value in urls:
            url = urllib.parse.urlparse(value or '')
            if url.scheme != 'https' or url.netloc != 'www.rofo.com' or url.query or url.fragment:
                entry['foreign'].append(value)
                continue
            target = site / url.path.lstrip('/')
            if url.path.endswith('/'):
                target = target / 'index.html'
            if not target.is_file():
                entry['missing'].append(value)
            elif target.suffix == '.html':
                html = target.read_text()
                if any(re.search(r'name=[\"\']robots[\"\']', tag, re.I) and re.search(r'content=[\"\'][^\"\']*noindex', tag, re.I) for tag in re.findall(r'<meta\b[^>]*>', html, re.I)):
                    entry['noindex'].append(value)
    except ET.ParseError as error:
        entry.update(validXML=False, error=str(error))
    results.append(entry)
print(json.dumps(results))
