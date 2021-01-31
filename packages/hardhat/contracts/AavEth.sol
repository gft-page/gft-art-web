pragma solidity >=0.6.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./interfaces/ILendingPool.sol";
import "./interfaces/IUniswapV2Router02.sol";

contract AavEth {

  constructor() public {
    lendingPool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    uniswapRouter = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  }

  ILendingPool public lendingPool;
  IUniswapV2Router02 public uniswapRouter;
  address public wethAddress;

  event Deposit(address sender, address asset, uint256 EthAmount, uint256 assetAmount);
  event Withdraw(address sender, address asset, uint256 EthAmount, uint256 assetAmount);

  function depositEthForAToken(uint amountOutMin, address[] calldata path, address to, uint deadline) public payable {

      address _fromAsset = path[0];
      address _toAsset = path[path.length - 1];

      require(wethAddress == _fromAsset, "from asset must be WETH");
      require(wethAddress != _toAsset, "to asset must not be WETH");

      uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: msg.value}(amountOutMin, path, address(this), deadline);

      uint _amount = amounts[amounts.length - 1];
      IERC20 _asset = IERC20(_toAsset);
      _asset.approve(address(lendingPool), _amount);

      lendingPool.deposit(
        _toAsset,
        _amount,
        to,
        0
      );

      emit Deposit(to, _toAsset, msg.value, _amount);
  }

}
