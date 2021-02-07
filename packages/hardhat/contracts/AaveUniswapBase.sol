pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/math/SafeMath.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./interfaces/ILendingPool.sol";
import "./interfaces/ILendingPoolAddressesProvider.sol";
import "./interfaces/IProtocolDataProvider.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IUniswapV2Router02.sol";
import { Constants } from "./constants/Constants.sol";
import { DataTypes } from './libraries/DataTypes.sol';

contract AaveUniswapBase {

  using SafeMath for uint256;

  constructor() public {
    ADDRESSES_PROVIDER = ILendingPoolAddressesProvider(Constants.LENDING_POOL_ADDRESSES_PROVIDER_ADDRESS);
    UNISWAP_ROUTER = IUniswapV2Router02(Constants.UNISWAP_ROUTER_ADDRESS);
  }

  ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
  IUniswapV2Router02 public immutable UNISWAP_ROUTER;

  function getLendingPool() internal view returns (ILendingPool) {
    address _lendingPoolAddress = ADDRESSES_PROVIDER.getLendingPool();
    return ILendingPool(_lendingPoolAddress);
  }

  function getPriceOracle() internal view returns (IPriceOracleGetter) {
    address _priceOracleAddress = ADDRESSES_PROVIDER.getPriceOracle();
    return IPriceOracleGetter(_priceOracleAddress);
  }

  function getProtocolDataProvider() internal view returns (IProtocolDataProvider)  {
    return IProtocolDataProvider(ADDRESSES_PROVIDER.getAddress(Constants.PROTOCOL_DATA_PROVIDER_LOOKUP));
  }

  function getAaveAssetReserveData(address asset) internal view returns (DataTypes.ReserveData memory) {
    return getLendingPool().getReserveData(asset);
  }

}
