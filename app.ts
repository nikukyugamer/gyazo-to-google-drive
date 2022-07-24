// @ts-ignore
import Gyazo from 'gyazo-api'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)

client.list({ page: 1, per_page: 50 })
  .then((res: any) => {
    const urls = res.data.map((item: any) => {
      return item.url
    })

    const image_ids = res.data.map((item: any) => {
      return item.image_id
    })

    console.log(urls)
    console.log(image_ids)
  })
  .catch((err: any) => {
    console.error({ err })
  });
