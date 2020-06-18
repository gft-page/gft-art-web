pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract xMoonLanding {
    IERC20 moons;
    uint256 public price;
    address public owner;

    constructor(uint256 _price, address _token) public {
        owner = msg.sender;
        price = _price;
        moons = IERC20(_token);
    }

    function updatePrice(uint256 _price) public {
        require(msg.sender == owner, "xMoonLanding:updatePrice NOT THE OWNER");
        price = _price;
    }

    function updateOwner(address _owner) public {
        require(msg.sender == owner, "xMoonLanding:updateOwner NOT THE OWNER");
        owner = _owner;
    }

    function earlyAccess() public {
        require(
            moons.transferFrom(msg.sender, address(this), price),
            "xMoonLanding:earlyAccess UNABLE TO GET EARLY ACCESS"
        );
        emit EarlyAccess(msg.sender, price);
    }
    event EarlyAccess(address sender, uint256 price);

    function withdraw(address account, uint256 amount) public {
        require(msg.sender == owner, "xMoonLanding:withdraw NOT THE OWNER");
        moons.transfer(account, amount);
    }
}
