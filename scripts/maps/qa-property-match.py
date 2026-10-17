"""Independent fixtures for the evidence importer. All outputs stay in a temporary tree."""
import json,csv,tempfile,subprocess,sys
from pathlib import Path
script=Path(__file__).with_name('prepare-map-evidence.py').resolve()
phoenix=Path('assets/phoenix-industrial-maps/geography-records.json').read_text()
cases=[('phoenix point','1002 S 56th Ave','1002 S 56TH AVE, PHOENIX, AZ, 85043','Non_Exact',True),('phoenix wrong direction','1002 N 56th Ave','1002 S 56TH AVE, PHOENIX, AZ, 85043','Exact',False),('abbreviation','3033 Richmond Pky','3033 RICHMOND PKWY, RICHMOND, CA, 94806','Exact',True),('unit','3401 Quebec Street, Suite 9000','3401 QUEBEC ST, DENVER, CO, 80207','Exact',True),('wrong street','100 Bush St','100 MARKET ST, SAN FRANCISCO, CA, 94104','Exact',False),('house suffix','100A Bush St','100B BUSH ST, SAN FRANCISCO, CA, 94104','Exact',False),('house prefix','100 Bush St','1000 BUSH ST, SAN FRANCISCO, CA, 94104','Exact',False),('wrong city','100 Bush St','100 BUSH ST, OAKLAND, CA, 94612','Exact',False),('wrong state','100 Bush St','100 BUSH ST, SAN FRANCISCO, NY, 94104','Exact',False),('nonexact','100 Bush St','100 BUSH ST, SAN FRANCISCO, CA, 94104','Non_Exact',False)]
with tempfile.TemporaryDirectory(prefix='rofo-map-import-')as temp:
 root=Path(temp);(root/'data/maps').mkdir(parents=True);(root/'assets/phoenix-industrial-maps').mkdir(parents=True);(root/'assets/phoenix-industrial-maps/geography-records.json').write_text(phoenix)
 for name,address,matched,kind,expected in cases:
  city,state=('Phoenix','AZ')if name.startswith('phoenix')else('Richmond','CA')if name=='abbreviation'else('Denver','CO')if name=='unit'else('San Francisco','CA')
  row={'address':address,'city':city,'citySlug':city.lower().replace(' ','-'),'state':state,'path':'/public-property/'};(root/'input.json').write_text(json.dumps([row]))
  with (root/'result.csv').open('w')as f:csv.writer(f).writerow(['0',address,'Match',kind,matched,'-122.4,37.79'])
  subprocess.run([sys.executable,str(script),'input.json','result.csv','2026-10-17'],cwd=root,check=True,capture_output=True);actual=json.loads((root/'data/maps/property-locations.json').read_text())[0]['point']is not None;assert actual==expected,name
 # Corrupt batch associations must fail, rather than emit a silently incomplete record set.
 (root/'input.json').write_text(json.dumps([row,row]));r=subprocess.run([sys.executable,str(script),'input.json','result.csv','2026-10-17'],cwd=root,capture_output=True);assert r.returncode!=0
 with (root/'result.csv').open('a')as f:csv.writer(f).writerow(['0',address,'No_Match'])
 r=subprocess.run([sys.executable,str(script),'input.json','result.csv','2026-10-17'],cwd=root,capture_output=True);assert r.returncode!=0
print(json.dumps({'addressMatchingFixtures':len(cases),'incompleteBatchRejected':True,'duplicateIdsRejected':True,'allPassed':True},indent=2))
