// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "./NFT.sol";

contract CotryNFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    //define counters
    Counters.Counter private _itemsIds; //List of all unique item id, created incrementedly from 0, for each NFT Token listed on NFT Marketplace.
    Counters.Counter private _itemsSold;    //Items sold in marketplace from the begining of time.
    Counters.Counter private _itemsDeleted;

    // owner of the marketplace
    address payable owner;

    // price for putting something to sale in the Marketplace
    uint256 listingPrice = 0.01 ether;  //approx 15-20$

    constructor() {
        //set the owner of the contract to the one that deployed it
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftTokenContractAddress;
        uint256 tokenId;
        address payable creator;    //The person who first create/minted the NFT token.
        address payable seller;     //The person who currently owns the NFT token and wants to sell in marketplace.
        address payable buyer;      //The person who buys the NFT token from the seller in marketplace.
        address payable owner;      //current owner, yes this is redundant, but it resolves any confusion.
        uint256 price;
        bool sold;
    }

    //mapping to store the MarketItem struct.
    mapping(uint256 => MarketItem) private idToMarketItem;

    //
    /// EVENTS : define the events, which will be used later.
    //
    event MarketItemCreated(
        uint256 indexed itemId,     //unique ID of items listed on marketplace.
        address indexed nftTokenContractAddress,
        uint256 indexed tokenId,
        address creator,
        address owner,
        address seller,
        address buyer,
        uint256 price
    );

    event ProductUpdated(
        uint256 indexed itemId,
        uint256 indexed oldPrice,
        uint256 indexed newPrice
    );

    event MarketItemDeleted(uint256 itemId);

    event MarketListPriceUpdated(uint256 listingPrice);

    event ProductSold(
        uint256 indexed itemId,
        address indexed nftTokenContractAddress,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address buyer,
        address owner,
        uint256 price
    );

    event ProductListed(
        uint256 indexed itemId
    );

    //
    /// MODIFIERS : To check authorization of accessing a function.
    //
    modifier onlyMarketplaceOwner() { //Only MarketplaceOwner (Cotry master wallet)
        require(
            owner == msg.sender,
            "Only the NFT Marketplace owner (Cotry) master wallet can perform the action, ensure msg.sender is cotry master wallet."
        );
        _;
    }

    modifier onlyNFTBuyer(uint256 itemId) { // Only the owner of the NFT token, after the NFT is sold. (oenrt)
        require(
            idToMarketItem[itemId].buyer != address(0) && idToMarketItem[itemId].buyer == msg.sender,
            "The item is not sold yet OR the msg.sender is not the owner who purchased NFT from marketplace."
        );
        _;
    }

    modifier onlyNFTOwner(uint256 itemId) { // Only the owner of the NFT token, after the NFT is sold. (oenrt)
        require(
            idToMarketItem[itemId].owner != address(0) && idToMarketItem[itemId].owner == msg.sender,
            "Either the msg.sender is not the owner, or the NFT token does not have any owner. i.e. null address(0) is the current owner."
        );
        _;
    }

    modifier onlyNFTSeller(uint256 itemId) {    //Only the NFT token owner, before the NFT is sold (seller).
        require(
            idToMarketItem[itemId].buyer == address(0) && idToMarketItem[itemId].seller == msg.sender,
            "Either the item is sold OR the msg.sender is not the seller."
        );
        _;
    }

    //
    /// FUNCTIONS:
    //
    function setListingPrice(uint256 updatedPrice) public onlyMarketplaceOwner {
        listingPrice = updatedPrice;

        //broadcast the blockchain about the change in listing price.
        emit MarketListPriceUpdated(listingPrice);
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    //new NFT listing on marketplace. Token ownership will be transferred to NFT Market contract. Anyone can sell their NFT token in the marketplace.
    function createMarketItem(address nftTokenContractAddress, uint256 tokenId, uint256 price)
        public
        payable
        nonReentrant
    {
        require(price > 0, "Price must be at least 1 wei");

        _itemsIds.increment();
        uint256 itemId = _itemsIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftTokenContractAddress,
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        //The NFT Token will be will be transferred from the current owner (before NFT is listed on marketplace), to the Cotry Contract.
        IERC721(nftTokenContractAddress).transferFrom(msg.sender, address(this), tokenId);

        // only after a successful listint of the NFT token, the listing fees will be charged to the seller (msg.sender)
        require(msg.value == listingPrice, "Listing fee required");

        emit MarketItemCreated(
            itemId,
            nftTokenContractAddress,
            tokenId,
            msg.sender,
            msg.sender,
            msg.sender,
            address(0),
            price
        );
    }

    //only marketplace owner can update a market item price, that is already listed in marketplace.
    function updateMarketItemPrice(uint256 itemId, uint256 newPrice)
        public
        payable
        onlyMarketplaceOwner
    {
        MarketItem storage item = idToMarketItem[itemId];
        uint256 oldPrice = item.price;
        item.price = newPrice;

        emit ProductUpdated(itemId, oldPrice, newPrice);
    }

    //sell NFT token that is listed in marketplace.
    function createMarketSale(address nftTokenContractAddress, uint256 itemId)
        public
        payable
        nonReentrant
        onlyMarketplaceOwner
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        //update the marketplace state first
        idToMarketItem[itemId].buyer = payable(msg.sender);
        idToMarketItem[itemId].owner = payable(msg.sender); //housekeeping
        idToMarketItem[itemId].sold = true;

        //then transfer the NFT, because I have already checked that the msg.sender has sent me the required money to buy NFT.
        IERC721(nftTokenContractAddress).transferFrom(address(this), msg.sender, tokenId);

        //housekeeping - update the items sold counter.
        _itemsSold.increment();

        //seller is given the price of the NFT token.
        idToMarketItem[itemId].seller.transfer(msg.value);

        //when NFT token is sold, then only the listing price is sent to Cotry (Marketplace owner).
        payable(owner).transfer(listingPrice);

        //broadcast about the NFT sell
        emit ProductSold(
            idToMarketItem[itemId].itemId,
            idToMarketItem[itemId].nftTokenContractAddress,
            idToMarketItem[itemId].tokenId,
            idToMarketItem[itemId].creator,
            idToMarketItem[itemId].seller,
            idToMarketItem[itemId].buyer,
            payable(msg.sender),
            idToMarketItem[itemId].price
        );
    }

    //If the buyer after buying NFT from cotry marketplace, wants to resell the NFT token
    function putItemToResell(address nftTokenContractAddress, uint256 itemId, uint256 newPrice)
        public
        payable
        nonReentrant
        onlyNFTOwner(itemId)
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(newPrice > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        //create a new NFT instance
        IERC721(nftTokenContractAddress).transferFrom(msg.sender, address(this), tokenId);

        address payable oldOwner = idToMarketItem[itemId].owner;
        idToMarketItem[itemId].buyer = payable(address(0));
        idToMarketItem[itemId].seller = oldOwner;
        idToMarketItem[itemId].owner = oldOwner;
        idToMarketItem[itemId].price = newPrice;
        idToMarketItem[itemId].sold = false;
        _itemsSold.decrement();

        emit ProductListed(itemId);
    }

    function fetchMarketItems()
        public
        view
        returns (MarketItem[] memory) 
    {
        uint256 itemCount = _itemsIds.current();    //get total number of items
        //this count is needed to store the collection of unsold market items
        uint256 unsoldItemCount = _itemsIds.current() - _itemsSold.current() - _itemsDeleted.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (
                idToMarketItem[i + 1].buyer == address(0) &&    //no buyer bought this NFT
                idToMarketItem[i + 1].sold == false &&  //not sold
                idToMarketItem[i + 1].tokenId > 0  //valid NFT token, assuming non-negative token ID are not allowed.
            ) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //fetches a single item using its item ID.
    function fetchSingleItem(uint256 itemId)
        public
        view
        returns (MarketItem memory)
    {
        return idToMarketItem[itemId];
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemsIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //NFT token created by an author that is not sold.
    function fetchAuthorsCreations(address author) public view returns (MarketItem[] memory){
        uint256 totalItemCount = _itemsIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].creator == author && !idToMarketItem[i + 1].sold) {   //if the author has an NFT token, and it is not sold.
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].creator == author && !idToMarketItem[i + 1].sold) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
