const { expect } = require('chai');


describe('Dryades mint tests', () => {
  let dryades;

  beforeEach(async () => {
    const DryadesNFT = await hre.ethers.getContractFactory('DryadesNFT')
    dryades = await DryadesNFT.deploy()

    await dryades.deployed()
  });

  it('NFT is minted successfully', async () => {
    [account1] = await hre.ethers.getSigners()

    const balance0 = await dryades.balanceOf(account1.address)
    expect(balance0.toString()).to.equal('0')

    const tx = await dryades.connect(account1).mint(account1.address);

    const balance1 = await dryades.balanceOf(account1.address)
    expect(balance1.toString()).to.equal('1')
  })

  it('tokenURI is set correctly', async () => {
    [account1, account2] = await hre.ethers.getSigners()

    const baseTokenURI = 'https://dryades-dao.s3.amazonaws.com/erc721-token-metadata/'

    const tx1 = await dryades.connect(account1).mint(account1.address)
    const receipt1 = await tx1.wait()
    const hexTokenId1 = await receipt1.events[0].topics[3]
    const tokenId1 = web3.utils.hexToNumber(hexTokenId1)

    const tx2 = await dryades.connect(account1).mint(account2.address)
    const receipt2 = await tx2.wait()
    const hexTokenId2 = await receipt2.events[0].topics[3]
    const tokenId2 = web3.utils.hexToNumber(hexTokenId2)

    expect(await dryades.tokenURI(tokenId1)).to.equal(`${baseTokenURI}${tokenId1}.json`)
    expect(await dryades.tokenURI(tokenId2)).to.equal(`${baseTokenURI}${tokenId2}.json`)
  })

  it('transfers correctly', async () => {
    [account1, account2] = await hre.ethers.getSigners()

    const balance0 = await dryades.balanceOf(account1.address)
    expect(balance0.toString()).to.equal('0')

    const tx1 = await dryades.connect(account1).mint(account1.address)
    const txWait = await tx1.wait()
    const hexId = await txWait.events[0].topics[3]
    const tokenId = web3.utils.hexToNumber(hexId)

    const balance1 = await dryades.balanceOf(account1.address)
    expect(balance1.toString()).to.equal('1')

    const balance3 = await dryades.balanceOf(account2.address)
    expect(balance3.toString()).to.equal('0')

    const tx2 = await dryades.connect(account1).transferFrom(account1.address, account2.address, tokenId)

    const balance4 = await dryades.balanceOf(account2.address)
    expect(balance4.toString()).to.equal('1')

    const balance5 = await dryades.balanceOf(account1.address)
    expect(balance5.toString()).to.equal('0')
  })

  it('only token owner can transfer', async () => {
    [account1, account2] = await hre.ethers.getSigners()

    const tx1 = await dryades.connect(account1).mint(account2.address)
    const txWait = await tx1.wait()
    const hexId = await txWait.events[0].topics[3]
    const tokenId = web3.utils.hexToNumber(hexId)

    try {
      const tx2 = await dryades.connect(account1).transferFrom(account2.address, account1.address, tokenId)
    } catch (e) {
      expect(e.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721: transfer caller is not owner nor approved\'')
    }
  })

  it('only publisher of contract can mint', async () => {
    [account1, account2] = await hre.ethers.getSigners()

    try {
      const tx1 = await dryades.connect(account2).mint(account1.address)
    } catch (e) {
      expect(e.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721PresetMinterPauserAutoId: must have minter role to mint\'')
    }
  })

  it('token owner cannot transfer when paused', async () => {
    [account1, account2, account3] = await hre.ethers.getSigners()

    const tx1 = await dryades.connect(account1).mint(account2.address)
    const txWait = await tx1.wait()
    const hexId = await txWait.events[0].topics[3]
    const tokenId = web3.utils.hexToNumber(hexId)

    await dryades.connect(account1).pause()

    try {
      await dryades.connect(account2).transferFrom(account2.address, account3.address, tokenId)
    } catch (e) {
      expect(e.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721Pausable: token transfer while paused\'')
    }
  })
})
