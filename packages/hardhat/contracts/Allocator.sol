pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IWETH9.sol";
import "./IGovernor.sol";

contract Allocator is ReentrancyGuard {

  event Distribute( address indexed token, address indexed wallet, uint256 amount );

  IWETH9 wethContract;
  IGovernor governorContract;

  constructor(address governor, address payable weth) public {
    governorContract = IGovernor(governor);
    wethContract = IWETH9(weth);
  }

  receive() external payable {
    wethContract.deposit{value:msg.value}();
  }

  function distribute(address tokenAddress) public nonReentrant {
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));
    for(uint8 i = 0; i < governorContract.recipientsLength(); i++){
      uint256 amount = balance * governorContract.ratios(i) / governorContract.denominator();
      tokenContract.transfer( governorContract.recipients(i), amount );
      emit Distribute( tokenAddress, governorContract.recipients(i), amount );
    }
  }
}
