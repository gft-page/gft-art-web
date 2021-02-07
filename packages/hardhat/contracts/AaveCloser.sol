pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/math/SafeMath.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./interfaces/ILendingPool.sol";
import "./interfaces/ILendingPoolAddressesProvider.sol";
import "./interfaces/IProtocolDataProvider.sol";
import "./interfaces/IUniswapV2Router02.sol";
import { Constants } from "./constants/Constants.sol";
import { DataTypes } from './libraries/DataTypes.sol';

contract AaveCloser {

  using SafeMath for uint256;

  constructor() public {
    ADDRESSES_PROVIDER = ILendingPoolAddressesProvider(Constants.LENDING_POOL_ADDRESSES_PROVIDER_ADDRESS);
    UNISWAP_ROUTER = IUniswapV2Router02(Constants.UNISWAP_ROUTER_ADDRESS);
  }

  ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
  IUniswapV2Router02 public immutable UNISWAP_ROUTER;

  event Deposit(address sender, address asset, uint256 EthAmount, uint256 assetAmount);
  event Withdraw(address sender, address asset, uint256 EthAmount, uint256 assetAmount);

  function getLendingPool() internal view returns (ILendingPool) {
    address _lendingPoolAddress = ADDRESSES_PROVIDER.getLendingPool();
    return ILendingPool(_lendingPoolAddress);
  }

  function getProtocolDataProvider() external view returns (IProtocolDataProvider)  {
    return IProtocolDataProvider(ADDRESSES_PROVIDER.getAddress(Constants.PROTOCOL_DATA_PROVIDER_LOOKUP));
  }

  function getAaveAssetReserveData(address asset) internal view returns (DataTypes.ReserveData memory) {
    return getLendingPool().getReserveData(asset);
  }

  function executeOperation(
          address[] calldata assets,
          uint256[] calldata amounts,
          uint256[] calldata premiums,
          address initiator,
          bytes calldata params
      )
          external
          returns (bool)
      {

          //
          // This contract now has the funds requested.
          // Your logic goes here.
          //

          // At the end of your logic above, this contract owes
          // the flashloaned amounts + premiums.
          // Therefore ensure your contract has enough to repay
          // these amounts.

          // Approve the LendingPool contract allowance to *pull* the owed amount
          for (uint i = 0; i < assets.length; i++) {
              uint amountOwing = amounts[i].add(premiums[i]);
              IERC20(assets[i]).approve(ADDRESSES_PROVIDER.getLendingPool(), amountOwing);
          }

          return true;
      }

  function repayBorrowWithCollateral(uint256 repayAmount, uint256 amountOwing, bytes memory params) public returns (bool) {

  }

  function flashLoanToRepayBorrowWithCollateral(uint256 repayAmount, uint256 maxCollateralAmount, address[] calldata path) public {

    address receiverAddress = address(this);

    address[] memory assets = new address[](1);
    assets[0] = path[path.length - 1];

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = repayAmount;

    // 0 = no debt, 1 = stable, 2 = variable
    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    address onBehalfOf = address(this);
    bytes memory subParams = abi.encode(maxCollateralAmount, path);
    bytes memory params = abi.encode(1, subParams);
    uint16 referralCode = 0;

    getLendingPool().flashLoan(
        receiverAddress,
        assets,
        amounts,
        modes,
        onBehalfOf,
        params,
        referralCode
    );

  }

}
