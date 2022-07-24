// @ts-ignore
import Gyazo from 'gyazo-api'
import url from 'url'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)
const { execSync } = require('child_process')

type DownloadedFile = {
  url: string
  imageId: string
}

class GyazoToGoogleDrive {
  constructor() {
  }

  main() {
    client.list({ page: 1, per_page: 50 })
    .then((res: any) => {
      const downloadedFiles: DownloadedFile[] = []

      res.data.forEach((item: any) => {
        // TODO: created_at を含めて、ファイル名に日時情報を追加したい
        downloadedFiles.push(
          {
            url: item.url,
            imageId: item.image_id // TODO: ファイル名やメタデータに使う予定だが、不要かもしれない
          }
        )
      })

      return downloadedFiles
    })
    .then((downloadedFiles: DownloadedFile[]) => {
      downloadedFiles.forEach((DownloadedFile: DownloadedFile) => {
        const parsedUrl = url.parse(DownloadedFile.url)
        const downloadedFileLocalPath = `downloaded_images/${parsedUrl.pathname}`
        const downloadedFileRemotePath = DownloadedFile.url

        const wgetCommand = `wget -c -O ${downloadedFileLocalPath} ${downloadedFileRemotePath}`

        execSync(wgetCommand)
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
