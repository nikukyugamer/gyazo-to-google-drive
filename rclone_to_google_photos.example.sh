#!/usr/bin/env bash
set -euo pipefail

# downloaded_images/ 配下のファイルを削除する
cd downloaded_images/
# shellcheck disable=SC2046,SC2012
if [ $(ls -1 | wc -l) -gt 1000 ]; then
  # shellcheck disable=SC2012
  ls -t | tail -n +101 | xargs rm
fi
cd ..

rclone copy --progress downloaded_images --include "*.*" <YOUR_REMOTE_NAME>:upload

exit 0
