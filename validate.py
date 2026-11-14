#!/usr/bin/env python3
import sys, json, re
ICONS={"user","role","policy","compute","storage","db","key","network","shield","log","api","queue","idp","org","device","cloud","lock","generic"}
KINDS={"user","app","idp","aws","store","network","key","attacker","service","generic"}
GKINDS={"account","vpc","subnet","zone","onprem","internet","org","generic"}
import os
AWSK=set(json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"tools","icon_keys.json"))))
ICONS=ICONS|AWSK
NEWT={"svc","cards","facts","pipeline","stack","hub","cycle","decision","matrix","tree"}
BT={"derja","text","callout","table","compare","steps","flow","arch","decode","policy","scenario","widget"}|NEWT
WIDGETS={"sharedResp","evalLogic","abacPlay"}
ARABIC=re.compile(r'[؀-ۿ]')
def main(path):
    errs=[];warns=[]
    try:
        data=json.load(open(path,encoding='utf-8'))
    except Exception as e:
        print("JSON INVALIDE:",e); sys.exit(1)
    if not isinstance(data,list): print("racine doit être un tableau"); sys.exit(1)
    ids=set()
    for L in data:
        lid=L.get("id","?")
        def E(m): errs.append(f"[{lid}] {m}")
        def W(m): warns.append(f"[{lid}] {m}")
        for k in ["id","part","title","emoji","level","minutes","core","src","hook","blocks","terms","oral","pitfalls","quiz","recap"]:
            if k not in L: E(f"champ manquant: {k}")
        if lid in ids: E("id dupliqué")
        ids.add(lid)
        h=L.get("hook",{})
        if not (isinstance(h,dict) and h.get("fr") and h.get("derja")): E("hook.fr et hook.derja requis")
        core=L.get("core",True)
        vis=0;scen=0
        for i,b in enumerate(L.get("blocks",[])):
            t=b.get("type"); loc=f"bloc#{i+1}({t})"
            if t not in BT: E(f"{loc}: type inconnu"); continue
            if t in NEWT: vis+=1
            if t=="derja" and not b.get("text"): E(f"{loc}: text requis")
            if t=="text" and not b.get("md"): E(f"{loc}: md requis")
            if t=="callout" and (b.get("tone") not in {"tip","warn","exam","info"} or not b.get("text")): E(f"{loc}: tone/text invalides")
            if t=="table":
                hd=b.get("head");rows=b.get("rows")
                if not hd or not rows: E(f"{loc}: head/rows requis")
                else:
                    for r in rows:
                        if len(r)!=len(hd): E(f"{loc}: ligne de {len(r)} cellules vs {len(hd)} colonnes: {r[:1]}")
            if t=="compare":
                c=b.get("cols",[])
                if not (2<=len(c)<=4): E(f"{loc}: 2 à 4 cols")
                for x in c:
                    if not x.get("name") or not x.get("points"): E(f"{loc}: col sans name/points")
            if t=="steps":
                if not b.get("items"): E(f"{loc}: items requis")
            if t=="flow":
                vis+=1
                ac={a.get("id") for a in b.get("actors",[])}
                if not (2<=len(ac)<=7): E(f"{loc}: 2 à 7 acteurs (a {len(ac)})")
                for a in b.get("actors",[]):
                    if a.get("kind","generic") not in KINDS: E(f"{loc}: kind acteur invalide {a.get('kind')}")
                st=b.get("steps",[])
                if not (3<=len(st)<=14): E(f"{loc}: 3 à 14 steps (a {len(st)})")
                for j,s in enumerate(st):
                    if s.get("from") not in ac or s.get("to") not in ac: E(f"{loc} step{j+1}: from/to inconnu")
                    if not s.get("label") or not s.get("detail"): E(f"{loc} step{j+1}: label/detail requis")
                    p=s.get("payload")
                    if p is not None and not (p.get("title") and isinstance(p.get("fields"),list) and all("k" in f and "v" in f for f in p["fields"])): E(f"{loc} step{j+1}: payload invalide")
            if t=="arch":
                vis+=1
                nodes={};
                for g in b.get("groups",[]):
                    if g.get("kind","generic") not in GKINDS: E(f"{loc}: kind groupe invalide {g.get('kind')}")
                    if "col" not in g or "row" not in g: E(f"{loc}: groupe sans col/row")
                    if not g.get("nodes"): E(f"{loc}: groupe vide {g.get('id')}")
                    for n in g.get("nodes",[]):
                        if n["id"] in nodes: E(f"{loc}: node dupliqué {n['id']}")
                        nodes[n["id"]]=1
                        if n.get("icon","generic") not in ICONS: E(f"{loc}: icon invalide {n.get('icon')}")
                eds={}
                for e in b.get("edges",[]):
                    eds[e["id"]]=1
                    if e.get("from") not in nodes or e.get("to") not in nodes: E(f"{loc}: edge {e.get('id')} nœud inconnu")
                    if e.get("style","solid") not in {"solid","dashed","deny"}: E(f"{loc}: style edge invalide")
                for j,s in enumerate(b.get("steps",[])):
                    for x in s.get("edges",[]):
                        if x not in eds: E(f"{loc} step{j+1}: edge inconnu {x}")
                    for x in s.get("nodes",[]):
                        if x not in nodes: E(f"{loc} step{j+1}: node inconnu {x}")
                    if not s.get("caption"): E(f"{loc} step{j+1}: caption requis")
                if len(b.get("edges",[]))<2: E(f"{loc}: au moins 2 edges")
            if t=="decode":
                vis+=1
                raw=b.get("raw","");pos=0
                if not raw: E(f"{loc}: raw requis")
                for p in b.get("parts",[]):
                    k=raw.find(p.get("s",""),pos)
                    if k<0 or not p.get("s"): E(f"{loc}: part introuvable (ou hors ordre): {p.get('s')!r}")
                    else: pos=k+len(p["s"])
            if t=="policy":
                vis+=1
                ln=b.get("lines",[])
                if not ln: E(f"{loc}: lines requis")
                else:
                    try: json.loads("\n".join(ln))
                    except Exception as ex: W(f"{loc}: le JSON de la policy n'est pas parsable ({str(ex)[:60]})")
                for n in b.get("notes",[]):
                    r=n.get("lines",[])
                    if not r or any((not isinstance(x,int)) or x<1 or x>len(ln) for x in r): E(f"{loc}: note.lines hors plage {r} (1..{len(ln)})")
                    if n.get("tone","info") not in {"info","good","warn","bad"}: E(f"{loc}: tone note invalide")
                for q in b.get("tryit",[]):
                    if not isinstance(q.get("ans"),bool): E(f"{loc}: tryit.ans doit être booléen")
            if t=="scenario":
                scen+=1
                o=b.get("opts",[])
                if not (2<=len(o)<=4) or sum(1 for x in o if x.get("ok"))!=1: E(f"{loc}: 2-4 opts avec exactement 1 ok:true")
                for x in o:
                    if not x.get("why"): E(f"{loc}: opt sans why")
            if t=="widget" and b.get("name") not in WIDGETS: E(f"{loc}: widget inconnu {b.get('name')}")
        nq=len(L.get("quiz",[]))
        for j,q in enumerate(L.get("quiz",[])):
            if not (2<=len(q.get("opts",[]))<=4) or not isinstance(q.get("ans"),int) or not (0<=q["ans"]<len(q["opts"])): E(f"quiz#{j+1}: ans/opts invalides")
            if not q.get("why"): E(f"quiz#{j+1}: why requis")
        for j,o in enumerate(L.get("oral",[])):
            if not (o.get("q") and o.get("a") and o.get("keys")): E(f"oral#{j+1}: q/a/keys requis")
        mins=dict(blocks=6 if core else 5, vis=2 if core else 1, scen=1, oral=3 if core else 2, pit=3 if core else 2, quiz=4 if core else 3, recap=4 if core else 3, terms=4 if core else 3)
        if len(L.get("blocks",[]))<mins["blocks"]: E(f"blocs < {mins['blocks']}")
        if vis<mins["vis"]: E(f"visuels (flow/arch/decode/policy) < {mins['vis']} (a {vis})")
        if scen<mins["scen"]: E("au moins 1 scenario")
        if len(L.get("oral",[]))<mins["oral"]: E(f"oral < {mins['oral']}")
        if len(L.get("pitfalls",[]))<mins["pit"]: E(f"pitfalls < {mins['pit']}")
        if nq<mins["quiz"]: E(f"quiz < {mins['quiz']}")
        if len(L.get("recap",[]))<mins["recap"]: E(f"recap < {mins['recap']}")
        if len(L.get("terms",[]))<mins["terms"]: E(f"terms < {mins['terms']}")
        if ARABIC.search(json.dumps(L,ensure_ascii=False)): E("caractères arabes détectés : derja en lettres latines uniquement")
    for w in warns: print("WARN",w)
    for e in errs: print("ERR ",e)
    print(f"{len(data)} leçons, {len(errs)} erreurs, {len(warns)} avertissements")
    sys.exit(1 if errs else 0)
main(sys.argv[1])
