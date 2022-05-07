const fs = require('fs')
const AWS = require('aws-sdk')
require('dotenv').config()

const id = process.argv[2]

const upload = (id) => {
  console.log(`upload: ${id}`)

  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  })

  fullSize = fs.readFileSync(`./token-data/dryades-${id}.jpg`)
  thumbSize = fs.readFileSync(`./token-data/dryades-${id}-thumb.jpg`)
  json = fs.readFileSync(`./token-data/${id}.json`)

  const fullSizeParams = {
    Bucket: process.env.S3_BUCKET,
    Key: `erc721-token-metadata/dryades-${id}.jpg`,
    Body: fullSize
  }
  s3.upload(fullSizeParams, (err, data) => {
    if (err) {
      console.log(`error uploading full size image: ${id}`)
      console.log(err)
    }
  })

  const thumbSizeParams = {
    Bucket: process.env.S3_BUCKET,
    Key: `erc721-token-metadata/dryades-${id}-thumb.jpg`,
    Body: thumbSize
  }
  s3.upload(thumbSizeParams, (err, data) => {
    if (err) {
      console.log(`error uploading thumbnail image: ${id}`)
      console.log(err)
    }
  })

  const jsonParams = {
    Bucket: process.env.S3_BUCKET,
    Key: `erc721-token-metadata/${id}.json`,
    Body: json
  }
  s3.upload(jsonParams, (err, data) => {
    if (err) {
      console.log(`error uploading json: ${id}`)
      console.log(err)
    }
  })
}

upload(id)
