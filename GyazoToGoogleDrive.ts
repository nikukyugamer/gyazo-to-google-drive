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
const DEFAULT_MAX_PAGE_NUMBER = 1

type DownloadedFile = {
  itemUrl: string
  imageId: string
  createdAt: string
  getListedAt: Date
}

class GyazoToGoogleDrive {
  constructor() {
    // TODO: 書く
  }

  // 仕様は https://gyazo.com/api/docs を参照
  async main(
    maxPageNumber: number = DEFAULT_MAX_PAGE_NUMBER,
    per_page: number = 100
  ) {
    let currentPage = 1
    let hasMoreData = true

    while (hasMoreData && currentPage <= maxPageNumber) {
      try {
        const res = await client.list({ page: currentPage, per_page })

        if (!res.data || res.data.length === 0) {
          hasMoreData = false
          break
        }

        const downloadedFiles: DownloadedFile[] = []

        res.data.forEach((item: any) => {
          // この時点ではダウンロードしていないからこの命名はあまりよくない
          downloadedFiles.push({
            itemUrl: item.url,
            imageId: item.image_id,
            createdAt: item.created_at,
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

          const downloadedFilename = `${this.convertCreatedAtToFilenameDatetime(
            DownloadedFile.createdAt
          )}_${filename}`
          const downloadedFileLocalPath = `${downloadedDirectory}/${downloadedFilename}`
          const downloadedFileRemotePath = DownloadedFile.itemUrl

          const wgetCommand = `wget -c -O ${downloadedFileLocalPath} ${downloadedFileRemotePath}`

          if (process.env.NOT_EXECUTE_WGET_COMMAND === 'true') {
            console.log(wgetCommand)
          } else {
            try {
              execSync(wgetCommand)
            } catch (error) {
              console.error(
                `image_id: ${DownloadedFile.imageId} のダウンロードに失敗しました。`,
                error
              )
              continue
            }
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
    const fileNames = fs.readdirSync(downloadedDirectory)

    for (const fileName of fileNames) {
      if (fileName.includes(imageId)) {
        return true
      }
    }

    return false
  }

  convertCreatedAtToFilenameDatetime(createdAt: string): string {
    const date = new Date(createdAt.replace(' ', 'T'))
    const zeroPadding = (num: number) => num.toString().padStart(2, '0')

    const yyyymmdd = `${date.getFullYear()}${zeroPadding(
      date.getMonth() + 1
    )}${zeroPadding(date.getDate())}`
    const hhmmss = `${zeroPadding(date.getHours())}${zeroPadding(
      date.getMinutes()
    )}${zeroPadding(date.getSeconds())}`

    return `${yyyymmdd}_${hhmmss}`
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
