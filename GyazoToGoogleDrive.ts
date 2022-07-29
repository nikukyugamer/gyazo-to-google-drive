// @ts-ignore
import Gyazo from 'gyazo-api'
import url from 'url'
import { format } from 'date-fns'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)
const { execSync } = require('child_process')

type DownloadedFile = {
  itemUrl: string
  imageId: string
  getListedAt: Date
}

class GyazoToGoogleDrive {
  constructor() {
  }

  main() {
    client.list({ page: 1, per_page: 50 })
    .then((res: any) => {
      const downloadedFiles: DownloadedFile[] = []

      res.data.forEach((item: any) => {
        downloadedFiles.push(
          {
            itemUrl: item.url,
            imageId: item.image_id, // ファイル名やメタデータに使う予定だが、不要かもしれない（拡張子が含まれていない）
            getListedAt: new Date()
          }
        )
      })

      return downloadedFiles
    })
    .then((downloadedFiles: DownloadedFile[]) => {
      downloadedFiles.forEach((DownloadedFile: DownloadedFile) => {
        const parsedUrl = url.parse(DownloadedFile.itemUrl)
        const pathname = parsedUrl.pathname || ''
        const filename = pathname.split('/').pop()
        const downloadedFileLocalPath = `downloaded_images/${format(DownloadedFile.getListedAt, 'yyyyMMdd_HHmmss')}_${filename}`
        const downloadedFileRemotePath = DownloadedFile.itemUrl

        const wgetCommand = `wget -c -O ${downloadedFileLocalPath} ${downloadedFileRemotePath}`

        if (process.env.NOT_EXECUTE_WGET_COMMAND === 'true') {
          console.log(wgetCommand)
        } else {
          execSync(wgetCommand)
        }
      })
    })
    .catch((err: any) => {
      console.error({ err })
    });
  }

  printList ({ page, per_page }: { page: number, per_page: number }) {
    client.list({ page, per_page })
      .then((res: any) => {
        console.log(res.data)
      })
  }

  clearDownloadedImages() {
    execSync('rm downloaded_images/*.jpg & rm downloaded_images/*.png & rm downloaded_images/*.gif & rm downloaded_images/*.mp4')
  }
}

export default GyazoToGoogleDrive
