#!/bin/sh
# rebuild the page from the v10 baseline: ecosystem hero + type, then the warm paper pass
set -e
cd "$(dirname "$0")/.."
git show main:index.html > index.html
python3 tools/apply_hero_eco.py
python3 tools/apply_warm.py
python3 tools/apply_v12.py
