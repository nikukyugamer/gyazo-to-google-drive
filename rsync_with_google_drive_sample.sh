#!/usr/bin/env bash
set -euo pipefail

rsync -acuz downloaded_images/*.* /path/to/Gyazo

exit 0
