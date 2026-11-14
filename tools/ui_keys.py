#!/usr/bin/env python3
"""Extrait les clés i18n de l'interface depuis engine/js/*.js.

Clés = premier argument littéral de T('...') (et de TK('...'), marqueur utilisé pour
les constantes de niveau module). Gère ' " ` et les échappements ; ignore commentaires,
chaînes et regex quand il cherche les appels. Écrit content/i18n/ui_keys.json (trié, unique).
Usage : python3 tools/ui_keys.py [--verbose]
"""
import json, os, re, sys
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(W, 'engine', 'js')
FILES = ['00_core.js', '10_blocks.js', '15_visual.js', '20_flow.js', '22_iso.js',
         '40_widgets.js', '45_services.js', '50_views.js', '07_i18n.js', '06_iconmap.js']
OUT = os.path.join(W, 'content', 'i18n', 'ui_keys.json')
IDENT = re.compile(r'[A-Za-z0-9_$]')
ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}

def read_string(src, i):
    """src[i] est le guillemet ouvrant ; renvoie (valeur, index après le guillemet fermant, a_interpolation)."""
    q = src[i]; i += 1; out = []; interp = False
    while i < len(src):
        c = src[i]
        if c == '\\':
            n = src[i + 1]
            if n == 'u':
                if src[i + 2] == '{':
                    j = src.index('}', i); out.append(chr(int(src[i + 3:j], 16))); i = j + 1
                else:
                    out.append(chr(int(src[i + 2:i + 6], 16))); i += 6
            elif n == 'x':
                out.append(chr(int(src[i + 2:i + 4], 16))); i += 4
            elif n == '\n':
                i += 2
            else:
                out.append(ESC.get(n, n)); i += 2
            continue
        if q == '`' and c == '$' and src[i + 1:i + 2] == '{':
            interp = True
        if c == q:
            return ''.join(out), i + 1, interp
        out.append(c); i += 1
    raise ValueError('chaîne non terminée')

def skip_regex(src, i):
    i += 1; cls = False
    while i < len(src):
        c = src[i]
        if c == '\\': i += 2; continue
        if c == '[': cls = True
        elif c == ']': cls = False
        elif c == '/' and not cls:
            i += 1
            while i < len(src) and src[i].isalpha(): i += 1
            return i
        i += 1
    return i

def scan(src, fname, verbose=False):
    keys, dyn = [], []
    i, n, prev = 0, len(src), ''
    while i < n:
        c = src[i]
        if c == '/' and src[i + 1:i + 2] == '/':
            i = src.find('\n', i); i = n if i < 0 else i; continue
        if c == '/' and src[i + 1:i + 2] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"`':
            _, i, _ = read_string(src, i); prev = '"'; continue
        if c == '/':
            if prev == '' or prev in '(,=:[!&|?{};+-*%<>~^' :
                i = skip_regex(src, i); prev = '"'; continue
            prev = c; i += 1; continue
        m = re.match(r'(TK|T)\(\s*', src[i:]) if c == 'T' and not (i and IDENT.match(src[i - 1])) and not src[:i].endswith('function ') else None
        if m:
            j = i + m.end()
            line = src.count('\n', 0, i) + 1
            if j < n and src[j] in '\'"`':
                val, k, interp = read_string(src, j)
                # l'argument doit se terminer ici (pas de concaténation) : suivant = , ou )
                rest = src[k:k + 40].lstrip()
                if interp or not rest[:1] in (',', ')'):
                    dyn.append((fname, line, 'littéral composé/interpolé : ' + src[i:k + 20].replace('\n', ' ')))
                else:
                    keys.append(val)
            else:
                dyn.append((fname, line, 'clé non littérale : ' + src[i:i + 30].replace('\n', ' ')))
            i = j; prev = '('; continue
        if not c.isspace():
            prev = c
        i += 1
    return keys, dyn

def main():
    verbose = '--verbose' in sys.argv
    allk, alld = [], []
    for f in FILES:
        src = open(os.path.join(JS, f), encoding='utf-8').read()
        k, d = scan(src, f, verbose); allk += k; alld += d
        if verbose: print(f'{f}: {len(k)} appels, {len(d)} dynamiques')
    uniq = sorted(set(allk))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(uniq, fh, ensure_ascii=False, indent=1)
    print(f'{len(uniq)} clés distinctes ({len(allk)} appels) -> {os.path.relpath(OUT, W)}')
    for f, l, m in alld:
        print(f'  [info : clé non littérale, couverte par une constante TK/T] {f}:{l} {m}')

if __name__ == '__main__':
    main()
