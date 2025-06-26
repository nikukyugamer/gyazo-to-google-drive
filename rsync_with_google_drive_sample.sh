#!/usr/bin/env bash
set -euo pipefail

# downloaded_images/ 配下のファイルを削除する
cd downloaded_images/
# shellcheck disable=SC2012
ls -t | tail -n +101 | xargs rm
cd ..

rsync -acuz downloaded_images/*.* /path/to/Gyazo

exit 0
