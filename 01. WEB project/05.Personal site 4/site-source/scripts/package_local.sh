#!/usr/bin/env bash
set -euo pipefail
helper=/c/Users/vbogd/.codex/plugins/cache/openai-bundled/sites/0.1.57/skills/sites-hosting/scripts/package-site.sh
exec bash "$helper" "$PWD" /tmp/valbo-products-site.tar.gz
