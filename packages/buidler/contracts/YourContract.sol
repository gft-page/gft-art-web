pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@nomiclabs/buidler/console.sol";

//example from: https://docs.openzeppelin.com/contracts/3.x/erc721
contract YourContract is ERC721{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  event Mint(uint256 id, address to, string tokenURI);

  constructor() ERC721("YourNFT", "yNFT") public   {
    // what should we do on deploy?
  }

  function anyoneCanMint(address to, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit Mint(newItemId, to, tokenURI);
        return newItemId;
    }

}
