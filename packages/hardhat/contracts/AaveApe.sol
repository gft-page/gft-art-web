pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./AaveUniswapBase.sol";

contract AaveApe is AaveUniswapBase {

  event Ape(address ape, address apeAsset, address borrowAsset, uint256 borrowAmount, uint256 apeAmount, uint256 interestRateMode);
  event Unwind(address ape, address apeAsset, address borrowAsset, uint256 amountOwing, uint256 apeAmount, uint256 interestRateMode);

  function getAvailableBorrowInAsset(address borrowAsset, address ape) public view returns (uint256) {
    ( ,,uint256 availableBorrowsETH,,,) = getLendingPool().getUserAccountData(ape);
    console.log('availableBorrows', availableBorrowsETH);
    return getAssetAmount(borrowAsset, availableBorrowsETH);
  }

  function getAssetAmount(address asset, uint256 amountInEth) public view returns (uint256) {
    uint256 assetPrice = getPriceOracle().getAssetPrice(asset);
    console.log('assetPrice', assetPrice);
    (uint256 decimals ,,,,,,,,,) = getProtocolDataProvider().getReserveConfigurationData(asset);
    uint256 assetAmount = amountInEth.mul(10**decimals).div(assetPrice);
    console.log('assetAmount', assetAmount);
    return assetAmount;
  }

  function superApe(address apeAsset, address borrowAsset, uint256 interestRateMode, uint levers) public returns (bool) {

    for (uint i = 0; i < levers; i++) {
      ape(apeAsset, borrowAsset, interestRateMode);
    }

    return true;
  }

  function ape(address apeAsset, address borrowAsset, uint256 interestRateMode) public returns (bool) {

      uint256 borrowAmount = getAvailableBorrowInAsset(borrowAsset, msg.sender);

      ILendingPool _lendingPool = getLendingPool();

      _lendingPool.borrow(
        borrowAsset,
        borrowAmount,
        interestRateMode,
        0,
        msg.sender
      );

      address[] memory path = new address[](2);
      path[0] = borrowAsset;
      path[1] = apeAsset;

      IERC20(borrowAsset).approve(Constants.UNISWAP_ROUTER_ADDRESS, borrowAmount);

      uint[] memory amounts = UNISWAP_ROUTER.swapExactTokensForTokens(borrowAmount, 0, path, address(this), block.timestamp);

      uint outputAmount = amounts[amounts.length - 1];

      IERC20(apeAsset).approve(ADDRESSES_PROVIDER.getLendingPool(), outputAmount);

      _lendingPool.deposit(
        apeAsset,
        outputAmount,
        msg.sender,
        0
      );

      emit Ape(msg.sender, apeAsset, borrowAsset, borrowAmount, outputAmount, interestRateMode);

      return true;
  }

  function uniswapTokensForExactTokens(
    uint amountOut,
    uint amountInMax,
    address fromAsset,
    address toAsset
  ) internal returns (uint[] memory amounts) {
    IERC20(fromAsset).approve(Constants.UNISWAP_ROUTER_ADDRESS, amountInMax);

    address[] memory path = new address[](2);
    path[0] = fromAsset;
    path[1] = toAsset;

    return UNISWAP_ROUTER.swapTokensForExactTokens(amountOut, amountInMax, path, address(this), block.timestamp);
  }

  function closePosition(address ape, address apeAsset, address borrowAsset, uint256 repayAmount, uint256 amountOwing, uint256 rateMode) internal returns (bool) {

    IERC20(borrowAsset).approve(ADDRESSES_PROVIDER.getLendingPool(), repayAmount);

    getLendingPool().repay(
      borrowAsset,
      repayAmount,
      rateMode,
      ape
    );

    uint256 maxCollateralAmount = getAvailableBorrowInAsset(apeAsset, ape);

    DataTypes.ReserveData memory reserve = getAaveAssetReserveData(apeAsset);

    IERC20 _aToken = IERC20(reserve.aTokenAddress);

    console.log(_aToken.balanceOf(ape), maxCollateralAmount);

    if(_aToken.balanceOf(ape) < maxCollateralAmount) {
      maxCollateralAmount = _aToken.balanceOf(ape);
    }

    _aToken.transferFrom(ape, address(this), maxCollateralAmount);

    getLendingPool().withdraw(
      apeAsset,
      maxCollateralAmount,
      address(this)
    );

    IERC20(apeAsset).approve(Constants.UNISWAP_ROUTER_ADDRESS, maxCollateralAmount);

    uint[] memory amounts = uniswapTokensForExactTokens(amountOwing, maxCollateralAmount, apeAsset, borrowAsset);

    uint256 leftoverAmount = maxCollateralAmount.sub(amounts[0]);

    IERC20(apeAsset).approve(ADDRESSES_PROVIDER.getLendingPool(), leftoverAmount);

    getLendingPool().deposit(
      apeAsset,
      leftoverAmount,
      ape,
      0
    );

    IERC20(borrowAsset).approve(ADDRESSES_PROVIDER.getLendingPool(), amountOwing);

    emit Unwind(ape, apeAsset, borrowAsset, amountOwing, amounts[0], rateMode);

    return true;
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
        require(msg.sender == ADDRESSES_PROVIDER.getLendingPool(), 'only the lending pool can call this function');

        (address ape, address apeAsset, uint256 rateMode) = abi.decode(params, (address, address, uint256));

        address borrowAsset = assets[0];
        uint256 repayAmount = amounts[0];
        uint256 amountOwing = repayAmount.add(premiums[0]);

        return closePosition(ape, apeAsset, borrowAsset, repayAmount, amountOwing, rateMode);

      }

  function unwindApe(address apeAsset, address borrowAsset, uint256 interestRateMode) public {

    (,uint256 stableDebt, uint256 variableDebt,,,,,,) = getProtocolDataProvider().getUserReserveData(borrowAsset, msg.sender);

    uint256 repayAmount;
    if(interestRateMode == 1) {
      repayAmount = stableDebt;
    } else if (interestRateMode == 2) {
      repayAmount = variableDebt;
    }

    address receiverAddress = address(this);

    address[] memory assets = new address[](1);
    assets[0] = borrowAsset;

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = repayAmount;

    // 0 = no debt, 1 = stable, 2 = variable
    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    address onBehalfOf = address(this);
    bytes memory params = abi.encode(msg.sender, apeAsset, interestRateMode);
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
