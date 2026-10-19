"""Independent, offline geographic guards for the Oakland presentation batch."""
import json,math,hashlib
from pathlib import Path
load=lambda p:json.loads(Path(p).read_text())
r=load('data/maps/oakland-review-2026-10-19.json');municipal=load('data/maps/oakland-municipal-review-2026-10-19.json')[0];g=municipal['feature']['geometry'];polygons=g['coordinates']if g['type']=='MultiPolygon'else[g['coordinates']]
def ring(point,coords):
 x,y=point;inside=False
 for a,b in zip(coords,coords[1:]+coords[:1]):
  if(a[1]>y)!=(b[1]>y)and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return inside
def contains(point):return any(ring(point,p[0])and not any(ring(point,h)for h in p[1:])for p in polygons)
source=Path(r['coordinateLineage']['file']);assert hashlib.sha256(source.read_bytes()).hexdigest()==r['coordinateLineage']['sha256']
entities={e['id']:e for e in load(source)}
for row in r['districts'].values():
 e=entities[row['coordinateEntityId']];assert row['point']=={'lat':e['approximate_centroid']['lat'],'lon':e['approximate_centroid']['lng']}
roads=load('data/maps/road-context/CA-oakland.json')['features']
def distance(point,feature):
 origin=(point['lon'],point['lat']);sx=111320*math.cos(math.radians(origin[1]));sy=111320
 def xy(p):return((p[0]-origin[0])*sx,(p[1]-origin[1])*sy)
 lines=feature['geometry']['coordinates'];lines=[lines]if feature['geometry']['type']=='LineString'else lines;best=1e9
 for line in lines:
  for a,b in zip(line,line[1:]):
   ax,ay=xy(a);bx,by=xy(b);dx,dy=bx-ax,by-ay;t=max(0,min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy)))if dx or dy else 0;best=min(best,math.hypot(ax+t*dx,ay+t*dy))
 return best
locations={p['path']:p for p in load('data/maps/property-locations.json')}
for key,row in r['properties'].items():assert row['point']==locations[key]['point'],(key,'review/source point mismatch')
checked=[]
for kind in ['districts','properties']:
 seen=set()
 for key,row in r[kind].items():
  p=row['point']
  if not p:assert row['disposition']=='HOLD';continue
  assert contains((p['lon'],p['lat'])),key
  signature=(round(p['lon'],5),round(p['lat'],5));assert signature not in seen,(kind,key,'duplicate');seen.add(signature)
  if row['disposition']=='READY':assert row['sources']and row['reason'];assert row['precision']in ['APPROXIMATE_AREA_REFERENCE','CENSUS_ADDRESS_RANGE_INTERPOLATION']
  checked.append({'kind':kind,'key':key,'insideMunicipality':True,'disposition':row['disposition']})
hegen=[f for f in roads if f['properties']['name']=='Hegenberger Rd'];assert hegen
roadChecks=[]
for key,row in r['properties'].items():
 if row['disposition']=='READY'and'hegenberger' in key:
  meters=min(distance(row['point'],f)for f in hegen);assert meters<80,(key,meters);roadChecks.append({'key':key,'metersToNamedRoad':round(meters,1)})
p=r['districts']['CA/oakland/hegenberger-corridor']['point'];meters=min(distance(p,f)for f in hegen);assert meters<100,meters;roadChecks.append({'key':'CA/oakland/hegenberger-corridor','metersToNamedRoad':round(meters,1)})
assert r['districts']['CA/oakland/coliseum-industrial']['disposition']=='HOLD'
for ending in ['1212-broadway/','1000-broadway/','119-filbert-st/','1-kaiser-plz/']:
 rows=[v for k,v in r['properties'].items()if k.endswith(ending)];assert len(rows)==1 and rows[0]['disposition']=='HOLD'
print(json.dumps({'municipalGeometrySource':municipal['source'],'municipalVintage':municipal['vintage'],'coordinateRecordsChecked':len(checked),'allInsideNamedMunicipality':True,'duplicateLocationGroups':0,'districtReferencesAreApproximate':True,'propertyPositionsAreInterpolated':True,'namedRoadChecks':roadChecks,'reviewDispositions':checked},indent=2))
