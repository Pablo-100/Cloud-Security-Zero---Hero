# Cloud Security 0→Hero

Plateforme web interactive pour apprendre la sécurité cloud AWS de zéro à hero (cours TEK-UP ING5-SSIR) :
90 leçons, ~1 000 schémas, 129 fiches services avec les icônes d'architecture AWS, entraînement à l'oral, examen blanc.

- **Schémas** : flux animés, architectures, avec bascule **Réseau (3D isométrique) / Séquence**.
- **Fiches services** : rôle, pourquoi l'utiliser, quand, confusions fréquentes, points d'examen.
- **20 langues** pour l'interface (EN, FR, ES, PT, IT, DE, NL, PL, TR, ID, VI, EL, UK, RU, ZH-CN, ZH-TW, JA, KO, HI, AR) ; leçons en français et en anglais.

## Construire
```bash
python3 build.py index.html   # génère le site en un seul fichier HTML (aucune dépendance)
python3 qa.py                 # vérifie les 90 routes (playwright requis)
python3 tools/check.py all    # valide la structure du contenu
```

## Structure
- `engine/` : moteur (JS vanilla + CSS) assemblé par `build.py`
- `content/` : leçons (`*.json`), patchs visuels, catalogue de services, traductions (`i18n/`)
- `icons/` : génération du sprite d'icônes AWS
- `tools/` : validation et pipeline de traduction

## Mentions
AWS et les icônes de services sont des marques d'Amazon Web Services, Inc. ; utilisées ici uniquement pour illustrer des schémas pédagogiques. Projet indépendant, non affilié à AWS. Les supports de cours d'origine ne sont pas inclus.
