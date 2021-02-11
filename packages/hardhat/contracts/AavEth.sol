pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./AaveUniswapBase.sol";

contract AavEth is AaveUniswapBase {

  event Deposit(address sender, address asset, uint256 EthAmount, uint256 assetAmount);
  event Withdraw(address sender, address asset, uint256 EthAmount, uint256 assetAmount);

  function depositEthForAToken(address[] calldata path, address to) public payable returns (uint amountAsset) {

      address _fromAsset = path[0];
      address _toAsset = path[path.length - 1];

      require(Constants.WETH_ADDRESS == _fromAsset, "from asset must be WETH");
      require(Constants.WETH_ADDRESS != _toAsset, "to asset must not be WETH");

      uint[] memory amounts = UNISWAP_ROUTER.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp);

      uint _amount = amounts[amounts.length - 1];
      IERC20 _asset = IERC20(_toAsset);

      _asset.approve(ADDRESSES_PROVIDER.getLendingPool(), _amount);

      getLendingPool().deposit(
        _toAsset,
        _amount,
        to,
        0
      );

      emit Deposit(to, _toAsset, msg.value, _amount);

      return _amount;
  }

  function withdrawATokenToEth(uint256 amount, address[] calldata path, address to) public returns (uint amountAsset) {

    address _fromAsset = path[0];

    require(Constants.WETH_ADDRESS != _fromAsset, "from asset must not be WETH");
    require(Constants.WETH_ADDRESS == path[path.length - 1], "to asset must be WETH");

    DataTypes.ReserveData memory reserve = getAaveAssetReserveData(_fromAsset);

    IERC20 _aToken = IERC20(reserve.aTokenAddress);

    uint256 amountToWithdraw;

    if (amount == type(uint256).max) {
      amountToWithdraw = _aToken.balanceOf(msg.sender);
    } else {
      amountToWithdraw = amount;
    }

    _aToken.transferFrom(msg.sender, address(this), amountToWithdraw);

    getLendingPool().withdraw(
      _fromAsset,
      amountToWithdraw,
      address(this)
    );

    IERC20(_fromAsset).approve(Constants.UNISWAP_ROUTER_ADDRESS, amountToWithdraw);

    uint[] memory amounts = UNISWAP_ROUTER.swapExactTokensForETH(amountToWithdraw, 0, path, msg.sender, block.timestamp);

    emit Withdraw(to, _fromAsset, amounts[amounts.length - 1], amountToWithdraw);

    return amountToWithdraw;
  }

}
