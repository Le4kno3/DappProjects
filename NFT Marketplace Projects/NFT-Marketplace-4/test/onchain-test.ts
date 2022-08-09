import { ethers } from "hardhat";
// import { ethers } from "@nomiclabs/hardhat-ethers";

import { expect } from "chai";

import { nftTokenAddress, nftMarketplaceAddress } from './../cache/deploy';
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";

let myNFTMarket: any;
let NFTMarketAddress: string;
let myNFTToken: any;
let NFTTokenAddress: string;
let ownerAddress: any;
let sellerAddress: any;
let buyerAddress: any;
let listingPrice: number;
let provider: any;

console.log("NFT Marketplace Address is: ", nftMarketplaceAddress);
console.log("NFT Token Address is: ", nftTokenAddress);

beforeEach(async () => {

  // provider = ethers.provider;
  [ownerAddress, sellerAddress, buyerAddress] = await ethers.getSigners();

  //set provider


  myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, ownerAddress);


  NFTMarketAddress = myNFTMarket.address;

  myNFTToken = new ethers.Contract(nftTokenAddress, NFTToken.abi, ownerAddress);

  NFTTokenAddress = myNFTToken.address;

  listingPrice = await myNFTMarket.connect(ownerAddress).getListingPrice();
  // listingPrice = 0.0025;
});

describe("MarketPlace", () => {
  it("Should deploy marketplace and NFT contracts", async () => {
    const nftMarketAddress = await myNFTMarket.address;

    expect(nftMarketAddress).to.equal(NFTMarketAddress);
  });

  it("Should have a listing price", async () => {

    const expectedListingPrice = ethers.utils.parseEther('0.0025');

    expect(listingPrice).to.equal(expectedListingPrice);

  });

  it("Should create market item", async () => {
    //we are now creating 2 NFT tokens in the NFTToken contract
    const tx = await myNFTToken.connect(ownerAddress).createToken("https://www.mytoken1.com");
    // const tx2 = await myNFTToken.connect(ownerAddress).createToken("https://www.mytoken2.com");
    // const count = await myNFTToken.tokenCount();

    const itemPrice = ethers.utils.parseUnits('0.1', 'ether');

    //transaction of token
    const tokenID = (await myNFTToken.getLastTokenID()).toString();
    console.log("The created token ID is: ", tokenID);

    //fetch token ID and owner

    //
    // await myNFTMarket.connect(ownerAddress).createMarketItem(NFTTokenAddress, 1, itemPrice, { value: listingPrice });

    // const createdItem = await myNFTMarket.fetchSingleItem(1);

    // expect(createdItem.price).to.equal(itemPrice);
    let items = await myNFTMarket.fetchRemainingMarketItems();

    items = await Promise.all(items.map(async (i: { tokenId: { toString: () => any; }; price: { toString: () => any; }; seller: any; owner: any; }) => {
      const tokenUri = await myNFTToken.tokenURI(i.tokenId);

      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      };
      return item;
    }));
    console.log(items);
  });

  // it("Should create market sale", async () => {

  //   await myNFTToken.connect(sellerAddress).createToken("www.mytoken.com");

  //   const listingPrice = await myNFTMarket.getListingPrice();

  //   const auctionPrice: any = ethers.utils.parseEther('100');

  //   await myNFTMarket.connect(ownerAddress).createMarketItem(NFTTokenAddress, 1, 100, { value: listingPrice });

  //   await expect(await myNFTMarket.connect(buyerAddress)
  //     .createMarketSale(NFTTokenAddress, 1, { value: 100 }))
  //     .to.changeEtherBalance(buyerAddress, -100)
  //     .to.changeEtherBalance(sellerAddress, 100)
  //     .to.changeEtherBalance(ownerAddress, listingPrice);
  // });

  // it("Should update market item price", async () => {
  //   await myNFTToken.createToken("www.mytoken.com");

  //   const listingPrice = await myNFTMarket.getListingPrice();

  //   const initialPrice = ethers.utils.parseUnits('100', 'ether');

  //   await myNFTMarket.createMarketItem(NFTTokenAddress, 1, initialPrice, { value: listingPrice });

  //   const updatedPrice = ethers.utils.parseUnits('150', 'ether');

  //   await myNFTMarket.updateMarketItemPrice(1, updatedPrice);

  //   const updatedItem = await myNFTMarket.fetchSingleItem(1);

  //   expect(updatedItem.price).to.equal(updatedPrice);
  // });

  // it("should not update price if requester is not seller", async () => {

  //   await myNFTToken.connect(sellerAddress).createToken("www.mytoken.com");

  //   const listingPrice = await myNFTMarket.getListingPrice();

  //   await myNFTMarket.connect(sellerAddress).createMarketItem(NFTTokenAddress, 1, 100, { value: listingPrice });

  //   await expect(myNFTMarket.connect(nonAuthorizedPerson).updateMarketItemPrice(1, 150))
  //     .to.be.reverted;

  //   await expect(market.connect(marketplaceOwner).updateMarketItemPrice(1, 150))
  //     .to.be.revertedWith("Only the product can do this operation");
  // });

  //   it("should allow buyer to resell an owned item", async () => {
  //     const [, creator, buyer] = await ethers.getSigners();

  //     await myNFTToken.connect(creator).createToken("www.mytoken.com");

  //     const listingPrice = await myNFTMarket.getListingPrice();

  //     await myNFTMarket.connect(creator).createMarketItem(NFTTokenAddress, 1, 100, { value: listingPrice });

  //     const unsoldItem = await myNFTMarket.fetchSingleItem(1);

  //     await myNFTMarket.connect(buyer).createMarketSale(NFTTokenAddress, 1, { value: 100 });

  //     await myNFTMarket.connect(buyer).putItemToResell(NFTTokenAddress, 1, 150, { value: listingPrice });

  //     const item = await myNFTMarket.fetchSingleItem(1);

  //     expect(item.owner).to.equal(unsoldItem.owner);
  //     expect(item.seller).to.equal(buyer.address);
  //     expect(item.creator).to.equal(creator.address);
  //   });
});
