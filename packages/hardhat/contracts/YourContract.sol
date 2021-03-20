pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

// import "hardhat/console.sol";

import "./IERC1155.sol";
import "./IERC721.sol";

contract YourContract {
    constructor() public {}

    function distributeSame1155s(
        address nft,
        uint256 tokenID,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) public {
        require(recipients.length == amounts.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            ERC1155(nft).safeTransferFrom(
                msg.sender,
                recipients[i],
                tokenID,
                amounts[i],
                ""
            );
        }
    }

    function distribute1155s(
        address nft,
        address[] calldata recipients,
        uint256[] calldata tokenIDs,
        uint256[] calldata amounts
    ) public {
        require(tokenIDs.length == recipients.length);
        require(recipients.length == amounts.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            ERC1155(nft).safeTransferFrom(
                msg.sender,
                recipients[i],
                tokenIDs[i],
                amounts[i],
                ""
            );
        }
    }

    function distribute721s(
        address nft,
        address[] calldata recipients,
        uint256[] calldata tokenIDs
    ) public {
        require(tokenIDs.length == recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            ERC721(nft).safeTransferFrom(
                msg.sender,
                recipients[i],
                tokenIDs[i]
            );
        }
    }
}
