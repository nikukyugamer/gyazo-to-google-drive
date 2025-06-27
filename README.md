# gyazo-to-google-drive

- Gyazo の画像を Google Drive に保存する

# Public Repository だと丸見え

- GitHub Actions で完結させようと思ったけど、秘匿したい画像まで丸見えになる
    - 手元の cron を使ってやるようにした

# シェルスクリプトの設定

```bash
$ cp rclone_to_google_photos.example.sh rclone_to_google_photos.sh

# <YOUR_REMOTE_NAME> を自分のリモート名に変更する
$ vim rclone_to_google_photos.sh
```

# crontab の設定

- こんな感じ

```crontab
00 * * * * cd /path/to/gyazo-to-google-drive && $(which pnpm) download_and_rclone
```
