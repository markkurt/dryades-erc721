const { BigNumber } = require("ethers");
const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-web3")
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require("@nomiclabs/hardhat-ethers")
require('dotenv').config();

task('accounts', 'prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task('estimateDeployCost', 'estimate gas to deploy the contract', async (taskArgs, hre) => {
  const DryadesNFT = await hre.ethers.getContractFactory('DryadesNFT')
  const estimatedGas = await ethers.provider.estimateGas(DryadesNFT.getDeployTransaction().data)

  console.log(`estimated gas: ${estimatedGas}`)
})

task('deploy', 'deploy the smart contract', async (taskArgs, hre) => {
  const DryadesNFT = await hre.ethers.getContractFactory('DryadesNFT')
  const dryadesNFTAbi = DryadesNFT.abi
  const dryadesNFT = await DryadesNFT.deploy()

  await dryadesNFT.deployed()

  console.log('DryadesNFT contract deployed at', dryadesNFT.address)

  await hre.run('verify:verify', {
    address: dryadesNFT.address,
    constructorArguments: []
  })
})

task('mint', 'mint a token')
  .addParam('account', 'the recipting account')
  .setAction(async (taskArgs) => {
    const recipient = web3.utils.toChecksumAddress(taskArgs.account)

    const { ethers } = require('hardhat');
    const contract = require('./artifacts/contracts/DryadesNFT.sol/DryadesNFT.json')
    const contractInterface = contract.abi
    
    let provider = ethers.provider
    
    const privateKey = `0x${process.env.PRIVATE_KEY}`
    const wallet = new ethers.Wallet(privateKey)
    
    wallet.provider = provider
    const signer = wallet.connect(provider)
    
    const nft = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractInterface,
      signer
    )

    const mint = async () => {
      console.log(`minting for: ${recipient}`)

      try {
        const tx = await nft.mint(recipient)
        const receipt = await tx.wait()
        const hexTokenId = await receipt.events[0].topics[3]
        const tokenId = web3.utils.hexToNumber(hexTokenId)

        console.log(`tokenId: ${tokenId} confirmed in tx: ${receipt.transactionHash}`)
      } catch (e) {
        console.log(e)
      }
    }
    
    await mint()
  })

  task('transfer', 'transfer a token')
  .addParam('tokenid', 'id of token to transfer')
  .addParam('account', 'recipient account')
  .setAction(async (taskArgs) => {
    const recipient = web3.utils.toChecksumAddress(taskArgs.account)
    const tokenId = BigNumber.from(taskArgs.tokenid)

    const { ethers } = require('hardhat');
    const contract = require('./artifacts/contracts/DryadesNFT.sol/DryadesNFT.json')
    const contractInterface = contract.abi
    
    let provider = ethers.provider
    
    const privateKey = `0x${process.env.PRIVATE_KEY}`
    const wallet = new ethers.Wallet(privateKey)
    
    wallet.provider = provider
    const signer = wallet.connect(provider)
    
    const nft = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractInterface,
      signer
    )

    const transfer = async () => {
      console.log(`transferring token ${tokenId} to ${recipient}`)

      const tx = await nft.transferFrom(signer.address, recipient, tokenId)
      const receipt = await tx.wait()
    }

    await transfer()
  })
  
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.1",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT}`,
      accounts: [
        process.env.PRIVATE_KEY
      ],
      gasPrice: 3500000000000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_TOKEN,
  }
}
