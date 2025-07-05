// @ts-ignore

import { format } from 'date-fns'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
// @ts-ignore
import Gyazo from 'gyazo-api'
import url from 'url'

dotenv.config()

const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)
const { execSync } = require('child_process')

// TODO: 外部から時間を注入できるようにしたい
const SLEEP_SECONDS = 2
const MAX_PAGES = 100

type DownloadedFile = {
  itemUrl: string
  imageId: string
  getListedAt: Date
}

class GyazoToGoogleDrive {
  constructor() {
    // TODO: 書く
  }

  // 仕様は https://gyazo.com/api/docs を参照
  async main(startPage: number = 1, per_page: number = 100) {
    let currentPage = startPage
    let hasMoreData = true

    while (hasMoreData && currentPage <= MAX_PAGES) {
      try {
        const res = await client.list({ page: currentPage, per_page })

        if (!res.data || res.data.length === 0) {
          hasMoreData = false
          break
        }

        const downloadedFiles: DownloadedFile[] = []

        res.data.forEach((item: any) => {
          downloadedFiles.push({
            itemUrl: item.url,
            imageId: item.image_id,
            getListedAt: new Date(),
          })
        })

        for (let index = 0; index < downloadedFiles.length; index++) {
          const DownloadedFile = downloadedFiles[index]
          const parsedUrl = url.parse(DownloadedFile.itemUrl)
          const pathname = parsedUrl.pathname || ''
          const filename = pathname.split('/').pop()
          const downloadedDirectory = 'downloaded_images'

          if (
            this.sameIdFileExistsInDownloadedFileLocalPath(
              DownloadedFile.imageId,
              downloadedDirectory
            )
          ) {
            console.log(`${DownloadedFile.imageId} already exists.`)
            continue
          }

          const downloadedFilename = `${format(
            DownloadedFile.getListedAt,
            'yyyyMMdd_HHmmss'
          )}_${filename}`
          const downloadedFileLocalPath = `${downloadedDirectory}/${downloadedFilename}`
          const downloadedFileRemotePath = DownloadedFile.itemUrl

          const wgetCommand = `wget -c -O ${downloadedFileLocalPath} ${downloadedFileRemotePath}`

          if (process.env.NOT_EXECUTE_WGET_COMMAND === 'true') {
            console.log(wgetCommand)
          } else {
            execSync(wgetCommand)
          }

          // ファイルダウンロード間で少し待つ
          if (index < downloadedFiles.length - 1) {
            execSync(`sleep ${SLEEP_SECONDS}`)
          }
        }

        currentPage++

        if (hasMoreData) {
          execSync(`sleep ${SLEEP_SECONDS}`)
        }
      } catch (err) {
        console.error({ err })
        hasMoreData = false
      }
    }
  }

  sameIdFileExistsInDownloadedFileLocalPath(
    imageId: string,
    downloadedDirectory: string
  ) {
    const files = fs.readdirSync(downloadedDirectory)

    for (const file of files) {
      if (file.includes(imageId)) {
        return true
      }
    }

    return false
  }

  printList({ page, per_page }: { page: number; per_page: number }) {
    client.list({ page, per_page }).then((res: any) => {
      console.log(res.data)
    })
  }

  clearDownloadedImages() {
    execSync(
      'rm downloaded_images/*.jpg & rm downloaded_images/*.png & rm downloaded_images/*.gif & rm downloaded_images/*.mp4'
    )
  }

  getExtensionFromFilename(filename: string) {
    return filename.split('.').pop()
  }

  getImageIdFromFilename(filename: string) {
    return filename.split('_').pop()
  }

  getDateTimeStringFromFilename(filename: string) {
    return filename.split('_', 2).join('_')
  }
}

export default GyazoToGoogleDrive
