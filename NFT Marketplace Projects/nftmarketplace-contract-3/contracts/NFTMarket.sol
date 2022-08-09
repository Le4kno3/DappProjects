//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//security
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter; //"Counters" is a library, we can assign additional features to datatype Counters.Counter (like uint)

    //now use the data type to define a new object/variable.
    /// @notice counter start with 1, not 0, because when a new item is added, we increment, and then if we want to know the total items we do _itemIds.current()
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    //the owner of the smart contract (NFT Marketplace).
    //this is already defined in Ownable.sol import so keep in mind
    address payable owner;

    /// @dev people who want their NFT images to be displayed in my NFT Marketplace website, should pay NFT Marketplace contract 0.0025 ethers.
    uint256 listingPrice = 0.0025 ether;

    /// @notice  itemId vs tokenId, difference is where it is used, TokenId is used when a new token is minted, ItemId is used when a seller want to sell a NFT Token in NFT Marketplace
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller; // the one who currently owns the NFT token, but has displayed the NFT token for sale in NFT Marketplace
        address payable owner;
        uint256 price;
        bool sold;
    }

    //a way to access values of the MarketItem struct above by passing an integer Id.
    mapping(uint256 => MarketItem) private _MarketItems;

    //log message when item is sold.
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    /// @dev function to get market listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function setListingPrice(uint256 inputPrice) public returns (uint256) {
        if (msg.sender == address(this) || msg.sender == owner) {
            listingPrice = inputPrice;
        }
        return listingPrice;
    }

    /// @dev This function is for sellers, that want to list their own NFT tokens (nftContract) in NFT Marketplace.
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be above 0"); //to make sure NFT price is greater than 0, in a sense it should be purchasable.

        //the seller should pay listing price.
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        //increment the itemIds counter and store current itemId post increment.
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        _MarketItems[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), //seller putting the nft up for sale
            payable(address(0)), //no new owner yet (as the nft is yet to be sold on marketplace)
            price,
            false
        );

        //Transfer NFT ownership to this contract.
        /// @dev This contract should have permissions to sell token when a buyer in marketplace buy a NFT token.
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        //log this in transaction logs
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            address(msg.sender),
            address(0),
            price,
            false
        );
    }

    /// @notice function to create a sale
    // This function will be executed when a persons buy a token from marketplace.
    // The money will be transfered to smart contract.
    // The smart contract then transfers the money to seller using `seller.transfer(amount)
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = _MarketItems[itemId].price;
        uint256 tokenId = _MarketItems[itemId].tokenId;

        //check to ensure the itemId exists
        // require(itemId <= _itemIds.current(), "Wrong item Id submitted");

        //check if the contract received the required payment for the sale.
        require(msg.value == price, "Send the right price.");

        // update the MarketItems data structure.
        _MarketItems[itemId].owner = payable(msg.sender);
        _MarketItems[itemId].sold = true;

        //increment the total sold items by 1.
        _itemsSold.increment();

        //pay the seller the amount from the contract.
        _MarketItems[itemId].seller.transfer(msg.value);

        //transfer ownership of the token from seller to buyer.
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // safeTransferFrom(address(this), msg.sender, tokenId);

        //finally when the item is sold, the owner of the NFT Marketplace will actually get profit of amount = listingPrice
        payable(owner).transfer(listingPrice);

        //emit a item sold event
    }

    /// @notice total number of items unsold on our platform
    function fetchRemainingMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();

        //total number of items that are unsold = total items ever count - total itesm unsold.
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            //because counters start with 1
            //check if the item has not been sold.
            //by checking if the item is sold.
            if (!_MarketItems[i].sold) {
                // uint256 currentId = _MarketItems[i].itemId;
                // MarketItem storage currentItem = _MarketItems[currentId];
                // items[currentIndex] = currentItem;
                items[currentIndex] = _MarketItems[i];
                currentIndex++;
            }
        }
        return items;
    }

    /// @notice Get list of NFTs that msg.sender have listed (created item).
    function fetchMyItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();

        uint256 itemsCreatedCount = 0;

        //to know the count of items owned by the caller "msg.sender".
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].seller == msg.sender) {
                itemsCreatedCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemsCreatedCount);

        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].seller == msg.sender) {
                // uint256 currentId = _MarketItems[i].itemId;
                // MarketItem storage currentItem = _MarketItems[currentId];
                // items[currentIndex] = currentItem;
                items[currentIndex] = _MarketItems[i];
                currentIndex++;
            }
        }

        return items;
    }

    /// @notice Get list of NFTs owned/bought by msg.sender (bought on marketplace).
    function fetchMyPurchasedNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();

        uint256 itemsOwnedCount = 0;

        //to know the count of items owned by the caller "msg.sender".
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].owner == msg.sender) {
                itemsOwnedCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemsOwnedCount);

        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].owner == msg.sender) {
                // uint256 currentId = _MarketItems[i].itemId;
                // MarketItem storage currentItem = _MarketItems[currentId];
                // items[currentIndex] = currentItem;
                items[currentIndex] = _MarketItems[i];
                currentIndex++;
            }
        }

        return items;
    }

    /// @notice Get list of NFTs listed by msg.sender but not sold.
    function fetchMyUnsoldNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();

        uint256 itemsUnsoldCount = 0;

        //to know the count of items owned by the caller "msg.sender".
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].seller == msg.sender && !_MarketItems[i].sold) {
                itemsUnsoldCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemsUnsoldCount);

        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_MarketItems[i].seller == msg.sender && !_MarketItems[i].sold) {
                // uint256 currentId = _MarketItems[i].itemId;
                // MarketItem storage currentItem = _MarketItems[currentId];
                // items[currentIndex] = currentItem;
                items[currentIndex] = _MarketItems[i];
                currentIndex++;
            }
        }

        return items;
    }
}
