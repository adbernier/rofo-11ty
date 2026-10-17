"""Import a dated Census geocoder batch. Only exact address/state/city matches qualify.
Run explicitly with CSV + matching input property snapshot. Never called at site build.
"""
import csv,json,re,sys
from pathlib import Path
rows=json.loads(Path(sys.argv[1]).read_text()); output=[]
checked_on=sys.argv[3] # Explicit acquisition date prevents silently re-dating an old batch.
assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',checked_on), 'ISO acquisition date required'
seen=set()
def street(value):
 value=value.split(',')[0].upper()
 value=re.sub(r'\s+(SUITE|STE|UNIT|FLOOR|FL)\b.*','',value)
 words={'STREET':'ST','AVENUE':'AVE','BOULEVARD':'BLVD','ROAD':'RD','DRIVE':'DR','HIGHWAY':'HWY','PARKWAY':'PKWY','PKY':'PKWY','CRESCENT':'CRES','PLACE':'PL','NORTH':'N','SOUTH':'S','EAST':'E','WEST':'W','SECOND':'2ND','FIFTH':'5TH'}
 return ''.join(words.get(w,w) for w in re.findall(r'[A-Z0-9]+',value))
for r in csv.reader(Path(sys.argv[2]).open()):
 index=int(r[0]);assert index not in seen and 0<=index<len(rows), 'Duplicate or invalid batch ID';seen.add(index)
 p=rows[index]; point=None; reason='No exact Census address match'
 if len(r)>5 and r[2:4]==['Match','Exact']:
  parts=[x.strip() for x in r[4].split(',')]; num=p['address'].split()[0].upper();matchednum=parts[0].split()[0].upper(); city=lambda s:re.sub('[^A-Z]','',s.upper())
  if len(parts)>=4 and parts[-2]==p['state'] and city(parts[-3])==city(p['city']) and num==matchednum and street(p['address'])==street(parts[0]):
   lon,lat=map(float,r[5].split(','));point={'lon':lon,'lat':lat};reason='Exact street/address and postal-city text match; address-range interpolation, not a parcel or entrance'
  else:reason='Match needs review: municipality, state, full street or complete house number differs'
 output.append({**p,'point':point,'status':'ADDRESS_MATCHED' if point else 'NEEDS_REVIEW','reason':reason,'matchedAddress':r[4] if len(r)>4 else None,'source':'https://geocoding.geo.census.gov/geocoder/locations/addressbatch','benchmark':'Public_AR_Current','checkedOn':checked_on,'method':'CENSUS_ADDRESS_RANGE'})
assert len(seen)==len(rows), 'Incomplete batch; missing input IDs'
# Retain the already verified Phoenix point-address evidence rather than substitute interpolated positions.
phoenix=json.loads(Path('assets/phoenix-industrial-maps/geography-records.json').read_text())
for p in output:
 if p['citySlug']=='phoenix':
  for k,v in phoenix['points'].items():
   if p['state']=='AZ' and street(p['address'])==street(v['matchedAddress']) and v.get('matchType')=='PointAddress' and v.get('score')==100:
    p.update(matchedAddress=v['matchedAddress'],point={'lon':v['lon'],'lat':v['lat']},status='ADDRESS_MATCHED',reason='Previously verified municipal PointAddress, score 100; not a suite entrance',method='MUNICIPAL_POINT_ADDRESS',source=phoenix['pointSource'],checkedOn=phoenix['sourceDate'])
Path('data/maps/property-locations.json').write_text(json.dumps(sorted(output,key=lambda p:p['path']),indent=2)+'\n');print({s:sum(x['status']==s for x in output) for s in ['ADDRESS_MATCHED','NEEDS_REVIEW']})
