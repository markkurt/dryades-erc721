## REFERENCE

https://www.freecodecamp.org/news/solidity-tutorial-hardhat-nfts/

https://learn.figment.io/tutorials/create-nft-smart-contract-with-hardhat

https://docs.palm.io/HowTo/Mint-NFT-using-Hardhat/

https://nftschool.dev/tutorial/minting-service/#how-minting-works

https://docs.openzeppelin.com/contracts/3.x/api/presets#ERC721PresetMinterPauserAutoId

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

https://docs.avax.network/dapps/smart-contracts/verify-smart-contract-using-hardhat-and-snowtrace/


## DIRECTIONS

# clone repo and install dependencies
- `git clone `
- `npm install`

# populate the .env file
- copy `.env.example` to `.env`
- create an account infura and copy the project code and secret to the INFURA_PROJECT and INFURA_PROJECT_SECRET
- create an s3 bucket to store the imagery and get the access key and secret.  Put in S3BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.  (should use IPFS)
- export your private key from metamask for the account used to pay gas: view account details on your mainnet account and click export private key.  Put private key in PRIVATE_KEY
- you will not have the contract address until you publish it, so you can leave it blank for now.  It's only needed when you transfer tokens.

# run tests
- `npx hardhat test`

# compile and publish smart contract
- `npx hardhat compile`
- `npx hardhat deploy --network mainnet`
- at the end of the deploy, the contract address will be output to the console.  put that in the `.env` file as the CONTRACT_ADDRESS

# verify contract on etherscan
- `npx hardhat flatten ./contracts/DryadesNFT.sol >> ./artifacts/DryadesNFT-verification.sol`
- go through and remove all `// SPDX-License-Identifier: MIT` in the output file except the first one
- upload to etherscan to validate the contract

# deal with images (this is pretty hacky)

# mint an nft
- `npx hardhat mint --network mainnet --account [address of NFT owner]`

# transfer an nft
- `npx hardhat transfer --network mainnet --tokenid [id to transfer] --account [address of new NFT owner]`

