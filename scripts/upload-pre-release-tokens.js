const sharp = require('sharp')
const fs = require('fs')
const AWS = require('aws-sdk')
require('dotenv').config()

const id = process.argv[2]
console.log(`generating token for: ${id}`)

const generateOverlay = async (id) => {
  const overlay = `
    <svg width="100" height="100">
      <style>
      .title { fill: #fff; font-size: 70px; font-weight: bold; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" class="title">${id}</text>
    </svg>
  `

  const svg = Buffer.from(overlay)
  const image = await sharp('./source-images/dryades-acorn-bw.png')
    .composite([
      {
        input: svg,
        top: 0,
        left: 0
      }
    ])
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`./token-data/dryades-${id}.jpg`)
  
  const thumb = await sharp(`./token-data/dryades-${id}.jpg`)
    .resize(350, 350)
    .toFile(`./token-data/dryades-${id}-thumb.jpg`)
}

const generateJson = (id) => {
  const json = {
    'name': `Dryades Token #${id}`,
    'description': `Dryades Token #${id}`,
    'image': `https://dryades-dao.s3.amazonaws.com/erc721-token-metadata/dryades-${id}-thumb.jpg`,
    'external_url': `https://dryades-dao.s3.amazonaws.com/erc721-token-metadata/dryades-${id}.jpg`
  }

  fs.writeFileSync(`./token-data/${id}.json`, JSON.stringify(json))
}

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

const run = async (id) => {
  await generateOverlay(id)
  await generateJson(id)
  await upload(id)    
}

run(id)
