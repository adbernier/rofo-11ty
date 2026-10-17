import json,xml.etree.ElementTree as ET
from pathlib import Path
m=json.loads(Path('data/maps/generated-manifest.json').read_text());checked=0
for record in m['measurements']:
 root=ET.parse(Path('assets/reviewed-maps')/record['file']).getroot();w,h=map(float,root.attrib['viewBox'].split()[2:]);groups={}
 for g in root.iter():
  if 'data-map-group' not in g.attrib:continue
  group=groups.setdefault(g.attrib['data-map-group'],[])
  for node in g.iter():
   if node.tag.endswith('rect'):
    b={k:float(node.attrib[k]) for k in ['x','y','width','height']}
    assert b['x']>=0 and b['y']>=0 and b['x']+b['width']<=w+.1 and b['y']+b['height']<=h+.1,(record['file'],b)
    for a in group:
     assert not(b['x']<a['x']+a['width'] and b['x']+b['width']>a['x'] and b['y']<a['y']+a['height'] and b['y']+b['height']>a['y']),(record['file'],'label collision')
    group.append(b)
 assert max(map(len,groups.values()))<=12
 checked+=1
out={'svgVariantsChecked':checked,'parseableXml':True,'labelsWithinViewports':True,'noLabelBoxCollisionsWithinVisibleGroups':True};print(json.dumps(out,indent=2))
