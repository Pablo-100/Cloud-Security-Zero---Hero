import sys,json,re
keys=json.load(open('/home/claude/work/content/i18n/ui_keys.json'))
def ph(s): return sorted(re.findall(r'\{\w+\}',s))
def tags(s): return sorted(re.findall(r'</?\w+[^>]*>',s))
for lang in sys.argv[1:]:
    try: d=json.load(open(f'/home/claude/work/content/i18n/ui_{lang}.json'))
    except Exception as e: print(lang,'ERR',e); continue
    miss=[k for k in keys if k not in d]; errs=[]
    for k in keys:
        if k in d:
            v=d[k]
            if ph(k)!=ph(v): errs.append(('ph',k,v))
            if tags(k)!=tags(v): errs.append(('tag',k,v))
            if not v.strip(): errs.append(('empty',k,v))
    print(lang,'missing',len(miss),'errors',len(errs)); 
    for e in errs[:4]: print('  ',e)
