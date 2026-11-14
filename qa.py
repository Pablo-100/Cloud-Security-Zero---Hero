import json,glob
from playwright.sync_api import sync_playwright
ids=[]
for f in sorted(glob.glob('/home/claude/work/content/*.json')): ids+= [l['id'] for l in json.load(open(f))]
bad=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'font' not in m.text.lower() else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    pg.goto('file:///home/claude/work/index.html#home'); pg.wait_for_timeout(500)
    for i in ids+['oral','quiz','glossaire','fiches','home']:
        errs.clear()
        pg.evaluate("h=>{location.hash=h}",('lesson-'+i) if i not in('oral','quiz','glossaire','fiches','home') else i); pg.wait_for_timeout(150)
        warn=pg.evaluate("()=>document.querySelectorAll('.callout.warn .md').length && [...document.querySelectorAll('.callout.warn')].filter(e=>e.textContent.includes('illisible')).length")
        sw=pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+2")
        if errs or warn or sw: bad.append((i,errs[:2],warn,sw))
    b.close()
print(len(ids),'routes; problems:',bad)
