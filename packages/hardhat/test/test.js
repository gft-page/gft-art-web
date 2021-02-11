require("@nomiclabs/hardhat-waffle");
const { use, expect } = require("chai");

let daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

/*
describe("AaveApe", function () {
  it("Should ape and unwind", async function () {
    const AaveApe = await ethers.getContractFactory("AaveApe");

    aaveApe = await AaveApe.deploy();

    const ethGateway = await ethers.getContractAt('WETHGateway', "0xDcD33426BA191383f1c9B431A342498fdac73488")
    const [owner] = await ethers.getSigners();
    let metadata = {
      value: ethers.utils.parseEther("5")
    }
    let ethDeposit = await ethGateway['depositETH'](owner.address, 0, metadata)
    let receipt = await ethers.provider.getTransactionReceipt(ethDeposit.hash)
    console.log('eth deposit gas', receipt.gasUsed.toString(), ethers.utils.formatEther(receipt.gasUsed.mul(ethDeposit.gasPrice)))

    const lendingPoolAddressesProvider = await ethers.getContractAt('ILendingPoolAddressesProvider', "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5")
    lendingPoolAddress = await lendingPoolAddressesProvider['getLendingPool']()

    lendingPool = await ethers.getContractAt('ILendingPool', lendingPoolAddress)
    let daiReserveData = await lendingPool['getReserveData'](daiAddress)
    let daiStableDebtToken = await ethers.getContractAt('IStableDebtToken', daiReserveData.stableDebtTokenAddress)
    let daiDebtApproval = await daiStableDebtToken['approveDelegation'](aaveApe.address, ethers.constants.MaxUint256)

    let wethReserveData = await lendingPool['getReserveData'](wethAddress)
    let wethAToken = await ethers.getContractAt('IAToken', wethReserveData.aTokenAddress)
    let ownerATokenBalanceWeth = await wethAToken.balanceOf(owner.address)
    console.log('weth before', ethers.utils.formatEther(ownerATokenBalanceWeth))
    //let maxBorrow = await aaveApe['getAvailableBorrowInAsset'](daiAddress, owner.address);
    //console.log('max borrow', ethers.utils.formatEther(maxBorrow))
    let ape = await aaveApe['ape'](wethAddress, daiAddress, 1)
    receipt = await ethers.provider.getTransactionReceipt(ape.hash)
    console.log('ape gas',receipt.gasUsed.toString(), ethers.utils.formatEther(receipt.gasUsed.mul(ape.gasPrice)))
    ownerATokenBalanceWeth = await wethAToken.balanceOf(owner.address)
    console.log('weth after', ethers.utils.formatEther(ownerATokenBalanceWeth))
    await wethAToken['approve'](aaveApe.address, ethers.constants.MaxUint256)
    let unwind = await aaveApe['unwindApe'](wethAddress, daiAddress, 1)
    receipt = await ethers.provider.getTransactionReceipt(unwind.hash)
    console.log('unwind gas',receipt.gasUsed.toString(), ethers.utils.formatEther(receipt.gasUsed.mul(unwind.gasPrice)))
    ownerATokenBalanceWeth = await wethAToken.balanceOf(owner.address)
    console.log('weth after unwind', ethers.utils.formatEther(ownerATokenBalanceWeth))
  });

});
*/
  describe("AavEth", function () {
    it("Should deploy AavEth", async function () {
      const AavEth = await ethers.getContractFactory("AavEth");

      aavEth = await AavEth.deploy();
    });

    describe("depositEthForAToken()", function () {
      it("Should emit Deposit event", async function () {

        const [owner] = await ethers.getSigners();

        let timeLimit = 600
        let deadline = Math.floor(Date.now() / 1000) + timeLimit
        let metadata = {
          value: ethers.utils.parseEther("10")
        }

        await expect(aavEth['depositEthForAToken']([wethAddress, daiAddress], owner.address, metadata)).to.emit(aavEth, 'Deposit');
      });
    });

    describe("withdrawATokenToEth", function () {
      it("Should emit a withdraw event", async function () {

        const lendingPoolAddressesProvider = await ethers.getContractAt('ILendingPoolAddressesProvider', "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5")
        lendingPoolAddress = await lendingPoolAddressesProvider['getLendingPool']()

        lendingPool = await ethers.getContractAt('ILendingPool', lendingPoolAddress)
        let daiReserveData = await lendingPool['getReserveData'](daiAddress)

        let daiAToken = await ethers.getContractAt('IAToken', daiReserveData.aTokenAddress)

        const [owner] = await ethers.getSigners();

        let ethBalance = await owner.getBalance()

        let daiApproval = await daiAToken['approve'](aavEth.address, ethers.constants.MaxUint256)

        await expect(aavEth['withdrawATokenToEth'](ethers.constants.MaxUint256, [daiAddress, wethAddress], owner.address)).to.emit(aavEth, 'Withdraw');

        ethBalance = await owner.getBalance()
      });
    });


  });
