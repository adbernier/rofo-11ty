import difflib
import hashlib
import json
import pathlib
import re
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[3]
BASE = ROOT / 'candidate/_site'
PRIOR = ROOT / 'publication-rehearsal-v2'
OUT = ROOT / 'content-disposition-v3'
OUT.mkdir(exist_ok=True)

class Inventory(HTMLParser):
    def __init__(self):
        super().__init__(); self.main = False; self.skip = 0; self.heading = None; self.anchor = None
        self.sections = []; self.links = []; self.images = []; self.text = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.main = True
        if not self.main: return
        if tag in ('script', 'style'): self.skip += 1
        if re.fullmatch(r'h[1-4]', tag): self.heading = {'level':tag, 'label':''}
        if tag == 'a': self.anchor = {'url':attrs.get('href',''), 'label':''}
        if tag == 'img': self.images.append(attrs)
    def handle_endtag(self, tag):
        if tag == 'main': self.main = False
        if not self.main: return
        if tag in ('script', 'style'): self.skip = max(0,self.skip-1)
        if re.fullmatch(r'h[1-4]', tag) and self.heading is not None:
            self.heading['label'] = ' '.join(self.heading['label'].split()); self.sections.append(self.heading); self.heading = None
        if tag == 'a' and self.anchor is not None:
            self.anchor['label'] = ' '.join(self.anchor['label'].split()); self.links.append(self.anchor); self.anchor = None
    def handle_data(self, value):
        if not self.main or self.skip: return
        self.text.append(value)
        if self.heading is not None: self.heading['label'] += value
        if self.anchor is not None: self.anchor['label'] += value

def sha(value): return hashlib.sha256(value).hexdigest()
rows = json.loads((ROOT/'inputs/combined-correspondence.json').read_text())
qualified = {r['recordId']:r for r in json.loads((ROOT/'inputs/qualified-evidence-manifest.json').read_text())}
ledger = []
for row in rows:
    if row['disposition'] != 'supported-existing': continue
    rel = row['canonicalPath'].lstrip('/')+'index.html'
    old = (BASE/rel).read_bytes(); proposed = (PRIOR/rel).read_bytes()
    before = Inventory(); before.feed(old.decode()); after = Inventory(); after.feed(proposed.decode())
    key = sha(row['recordId'].encode())[:20]; folder = OUT/'comparisons'/key; folder.mkdir(parents=True,exist_ok=True)
    (folder/'old.html').write_bytes(old); (folder/'proposed-v2.html').write_bytes(proposed)
    (folder/'old-vs-proposed-v2.diff').write_text(''.join(difflib.unified_diff(old.decode().splitlines(True),proposed.decode().splitlines(True),fromfile='baseline/'+rel,tofile='proposed-v2/'+rel)))
    text = ' '.join(' '.join(before.text).split())
    local_links = []; ctas = []; external = []
    for link in before.links:
        url = urlparse(link['url'])
        if url.scheme or url.netloc: external.append(link); continue
        target = BASE/url.path.lstrip('/')
        if url.path.endswith('/'): target = target/'index.html'
        if url.path == '/best-fit-locations/':
            ctas.append({**link,'routeExists':(ROOT/'candidate/functions/best-fit-locations.js').is_file(),'intentRestriction':'Existing parameters preserved verbatim only because update is held; historical category is not approved new user intent.'})
        elif target.is_file(): local_links.append({**link,'targetExists':True,'targetSHA256':sha(target.read_bytes()),'role':'contextual navigation, not newly asserted subject ancestry/type/suitability'})
    media = []
    for image in before.images:
        url = urlparse(image.get('src','')); p = BASE/url.path.lstrip('/')
        media.append({**image,'exists':p.is_file(),'sha256':sha(p.read_bytes()) if p.is_file() else None,'kind':'illustrative placeholder' if '/placeholders/' in url.path else 'existing reviewed map' if '/reviewed-maps/' in url.path else 'existing media requiring specific reuse assessment','action':'preserve existing output and asset reference; no new photo/rights approval inferred'})
    restrictions = re.findall(r'[^.!?]*(?:unconfirmed|verify|not verified|approximate|availability|suitability|not a live|representative)[^.!?]*[.!?]?',text,re.I)
    claim_candidates = re.findall(r'[^.!?]*(?:offers?\b|provides?\b|typical\b|\d{4}\b|square feet|sq\.?\s*ft|good fit|ideal for|best fit)[^.!?]*[.!?]?',text,re.I)
    evidence = {'baselineHTML':str(BASE/rel),'baselineSHA256':sha(old),'priorReplacementHTML':str(PRIOR/rel),'priorReplacementSHA256':sha(proposed),'comparisonFolder':str(folder),'canonicalCorrespondenceEvidence':row['evidence']}
    ledger.append({'recordId':row['recordId'],'canonicalPath':row['canonicalPath'],'decision':'hold-update-preserve-current','reason':'Full replacement would remove existing local context/navigation/media/restrictions. Canonical matching and newly qualified facts do not clear that removal or requalify legacy claims; a narrower additive/retention design needs review. Independent new profiles continue.','evidence':evidence,
        'preserve':{'canonicalAndCompleteExistingBody':True,'headings':before.sections,'validatedExistingLocalLinks':local_links,'existingCTAs':ctas,'media':media,'evidenceRestrictions':restrictions,'externalSourceOrContextLinks':external},
        'replace':{'approvedBodyReplacement':False,'proposedNewResearchFacts':qualified[row['recordId']]['claims'],'qualificationScope':'Only the new source-specific claims are independently evidence-qualified; that does not authorize deleting or endorsing other content.'},
        'withhold':{'fullV2Replacement':True,'legacyClaimsForSeparateSourceReconciliation':claim_candidates,'claimStatus':'Not requalified for new publication; not a finding that every existing claim is false or unsupported. Legitimate navigation/context is separately retained.'},
        'hold':{'update':True,'existingOutputMustRemainSHA256':sha(old),'blocksIndependentNewPages':False},
        'exactLossInventory':{'headingsAbsentInV2':[h for h in before.sections if h['label'] not in [n['label'] for n in after.sections]],'linksAbsentInV2':[l for l in before.links if l['url'] not in [n['url'] for n in after.links]],'imagesAbsentInV2':[i for i in before.images if i.get('src') not in [n.get('src') for n in after.images]]}})
assert len(ledger)==32
(OUT/'existing-content-disposition.json').write_text(json.dumps(ledger,indent=2)+'\n')
print(json.dumps({'auditedExistingPages':len(ledger),'updatesHeld':len(ledger),'unchangedExistingBodiesRequired':True,'independentNewPagesBlocked':False}))
