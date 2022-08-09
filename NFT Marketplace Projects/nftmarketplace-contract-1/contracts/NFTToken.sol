//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTToken is ERC721URIStorage {
    /// @dev auto-increment field for each token
    /// @param
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; //this variable can be viewed by public, but cannot be called.

    //owner of NFT Token and Marketplace are same.
    address nftMarketAddress; //address of the NFT marketplace

    constructor(address marketplaceAddress) ERC721("Nifty Tokens", "IFTY") {
        nftMarketAddress = marketplaceAddress;
    }

    /// @notice create a new token and assign it to the caller of the function.
    /// @param tokenURI: token URI
    function createToken(string memory tokenURI) public returns (uint256) {
        //sets a new token id for the token to be minted. Like: 0, 1, 2, 3, 4, ...
        _tokenIds.increment();

        //this stores the newly assinged tokenID
        uint256 newItemId = _tokenIds.current();

        //mint a new token
        _mint(msg.sender, newItemId);

        //given the token is valid, tokenURI is created using baseURI and tokenId
        _setTokenURI(newItemId, tokenURI);

        //give marketplace authority to make transaction on behalf of the user.
        //If this is not done, any the marketplace cannot buy and sell
        // this token in the marketplace, here both marketplace and token belong
        //to the same owner so it was easy to supply marketplace address
        //and give the required approval.
        setApprovalForAll(nftMarketAddress, true);

        //returns the new token id as uint
        return newItemId;
    }
}
