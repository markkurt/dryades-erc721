const fs = require('fs')
const sharp = require('sharp')
require('dotenv').config()

const blacklist = ['.DS_Store']
const directory = process.argv[2]

fs.readdir(directory, (err, files) => {
  const list = files.filter((x) => {
    const stats = fs.statSync(`${directory}/${x}`)
    return stats.isFile() && (blacklist.indexOf(x) < 0)
  })
  const randomized = list.sort((a, b) => 0.5 - Math.random())
  randomized.forEach(async (item, index) => {
    const name = item.match(/[0-9]_(.*)\.png/)[1]
    const capitalName = name.charAt(0).toUpperCase() + name.slice(1)

    console.log(`${index} - ${capitalName} - ${list[index]} -> ./token-data/dryades-${index}.png`)

    fs.copyFileSync(`${directory}/${item}`, `./token-data/dryades-${index}.png`)

    const jpeg = await sharp(`./token-data/dryades-${index}.png`)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`./token-data/dryades-${index}.jpg`)

    const thumb = await sharp(`./token-data/dryades-${index}.jpg`)
      .resize(350, 350)
      .toFile(`./token-data/dryades-${index}-thumb.jpg`)

    const json = {
      name: `Dryades Token #${index}`,
      description: `Dryades Acorn ${capitalName}`,
      image: `https://dryades-dao.s3.amazonaws.com/erc721-token-metadata/dryades-${index}-thumb.jpg`,
      external_url: `https://dryades-dao.s3.amazonaws.com/erc721-token-metadata/dryades-${index}.jpg`,
      attributes: [
        {
          trait_type: 'Material',
          value: capitalName
        }
      ]
    }

    fs.writeFileSync(`./token-data/${index}.json`, JSON.stringify(json))
  })
})
