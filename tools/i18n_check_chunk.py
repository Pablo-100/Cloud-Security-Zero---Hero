import sys,json,re,os
def toks(s):
    return (s.count('**'), s.count('`'), sorted(re.findall(r'\$\{[^}]*\}',s)), sorted(re.findall(r'https?://\S+',s)), s.count('\n'))
def check(lang,k):
    src=json.load(open(f'/home/claude/work/content/i18n/src/{k:03d}.json'))
    p=f'/home/claude/work/content/i18n/out_{lang}/{k:03d}.json'
    if not os.path.exists(p): return ['missing']
    out=json.load(open(p)); errs=[]
    if len(out)!=len(src): return [f'length {len(out)}!={len(src)}']
    for i,(a,b) in enumerate(zip(src,out)):
        if not isinstance(b,str) or not b.strip(): errs.append(f'{k:03d}[{i}] empty'); continue
        ta,tb=toks(a),toks(b)
        if ta[0]!=tb[0] or ta[1]!=tb[1] or ta[2]!=tb[2] or ta[3]!=tb[3]: errs.append(f'{k:03d}[{i}] markup differs: {a[:50]!r}')
    return errs
if __name__=='__main__':
    lang=sys.argv[1]; ks=[int(x) for x in sys.argv[2:]] or range(len(os.listdir('/home/claude/work/content/i18n/src')))
    tot=0
    for k in ks:
        e=check(lang,k); tot+=len(e)
        for x in e[:5]: print(x)
    print('errors',tot)
