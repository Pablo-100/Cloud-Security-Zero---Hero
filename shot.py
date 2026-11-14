import sys, asyncio
from playwright.sync_api import sync_playwright
route=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1280; theme=sys.argv[4] if len(sys.argv)>4 else 'dark'
actions=sys.argv[5:] 
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':w,'height':int(__import__('os').environ.get('H','900'))},color_scheme=theme)
    errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    pg.goto('file:///home/claude/work/index.html#'+route)
    pg.wait_for_timeout(800)
    for a in actions:
        if a.startswith('click:'): pg.click(a[6:]); pg.wait_for_timeout(500)
        elif a.startswith('el:'): pass
        elif a.startswith('scroll:'): pg.evaluate("sel=>{const e=document.querySelector(sel); e&&e.scrollIntoView({block:'start'})}",a[7:]); pg.wait_for_timeout(500)
    el=[a for a in actions if a.startswith('el:')]
    if el: pg.locator(el[0][3:]).first.screenshot(path=out)
    else: pg.screenshot(path=out,full_page=False)
    print('errors:',[e for e in errs if 'fonts' not in e.lower() and 'ERR_' not in e][:8])
    b.close()
