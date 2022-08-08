const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket - runtime testing", function () {
  // it("Should create and execute market sales", async function () {

  //   //get accounts
  //   const [owner, buyer] = await ethers.getSigners();

  //   //Deploy NFTMarket contract
  //   const NFTMarket = await ethers.getContractFactory("NFTMarket", owner);
  //   const myNFTMarket = await NFTMarket.deploy();
  //   await myNFTMarket.deployed();
  //   const NFTMarketAddress = myNFTMarket.address; //NFTMarket contract address
  //   console.log("NFT Marketplace Address is: ", NFTMarketAddress);

  //   //Deploy NFTToken contract
  //   const NFTToken = await ethers.getContractFactory("NFTToken", owner);
  //   const myNFTToken = await NFTToken.deploy(NFTMarketAddress);
  //   await myNFTToken.deployed();
  //   const NFTTokenAddress = myNFTToken.address;
  //   console.log("NFT Token Address is: ", NFTTokenAddress);

  //   let listingPrice = (await myNFTMarket.getListingPrice()).toString();

  //   const auctionPrice = ethers.utils.parseUnits("0.1", "ether");

  //   //we are now creating 2 NFT tokens in the NFTToken contract
  //   await myNFTToken.createToken("https://www.mytoken1.com");
  //   await myNFTToken.createToken("https://www.mytoken2.com");

  //   //list these 2 NFT Tokens on marketplace.
  //   await myNFTMarket.createMarketItem(NFTTokenAddress, 1, auctionPrice, { value: listingPrice });
  //   await myNFTMarket.createMarketItem(NFTTokenAddress, 2, auctionPrice, { value: listingPrice });

  //   //A "buyer" buys the 1st NFT token.
  //   await myNFTMarket.connect(buyer).createMarketSale(NFTTokenAddress, 1, { value: auctionPrice });

  //   //fetch market items - it should only have the 2nd NFT token.
  //   let items = await myNFTMarket.fetchRemainingMarketItems();

  //   items = await Promise.all(items.map(async i => {
  //     const tokenUri = await myNFTToken.tokenURI(i.tokenId);

  //     let item = {
  //       price: i.price.toString(),
  //       tokenId: i.tokenId.toString(),
  //       seller: i.seller,
  //       owner: i.owner,
  //       tokenUri
  //     };
  //     return item;
  //   }));
  //   console.log(items);

  // });

  it("Should approve, list and buy the item.", async function () {

    //get accounts
    const [deployer, owner, buyer] = await ethers.getSigners();

    //Deploy NFTMarket contract
    const NFTMarket = await ethers.getContractFactory("NFTMarket", deployer);
    const myNFTMarket = await NFTMarket.deploy();
    await myNFTMarket.deployed();
    const NFTMarketAddress = myNFTMarket.address; //NFTMarket contract address
    console.log("NFT Marketplace Address is: ", NFTMarketAddress);

    //Deploy NFTToken contract
    const OtherNFTToken = await ethers.getContractFactory("OtherNFTToken", deployer);
    const myOtherNFTToken = await OtherNFTToken.deploy();
    await myOtherNFTToken.deployed();
    const OtherNFTTokenAddress = myOtherNFTToken.address;
    console.log("NFT Token Address is: ", OtherNFTTokenAddress);

    let listingPrice = (await myNFTMarket.getListingPrice()).toString();

    const auctionPrice = ethers.utils.parseUnits("0.1", "ether");

    //we are now creating 2 NFT tokens in the NFTToken contract
    const tx1 = await myOtherNFTToken.connect(owner).createToken("https://www.mytoken1.com");
    const tx2 = await myOtherNFTToken.connect(owner).createToken("https://www.mytoken2.com");
    const count = await myOtherNFTToken.tokenCount();

    console.log(count);

    //approve NFT Marketplace to create the new tokens
    await myOtherNFTToken.connect(owner).approve(NFTMarketAddress, 1);

    // //list these 2 NFT Tokens on marketplace.
    await myNFTMarket.connect(owner).createMarketItem(OtherNFTTokenAddress, 1, auctionPrice, { value: listingPrice });
    // await myNFTMarket.createMarketItem(NFTTokenAddress, 2, auctionPrice, { value: listingPrice });

    // //A "buyer" buys the 1st NFT token.
    // await myNFTMarket.connect(buyer).createMarketSale(NFTTokenAddress, 1, { value: auctionPrice });

    //fetch market items - it should only have the 2nd NFT token.
    let items = await myNFTMarket.fetchRemainingMarketItems();

    items = await Promise.all(items.map(async i => {
      const tokenUri = await myOtherNFTToken.tokenURI(i.tokenId);

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
});
