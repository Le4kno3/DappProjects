import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { nftTokenAddress, nftMarketplaceAddress } from '@cache/deploy';
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";

describe("NFTMarket - runtime testing", function () {

    it("Query the contract", async function () {

        //get accounts
        const [owner, nftowner, nftbuyer] = await ethers.getSigners();

        // const signer = ethers.provider.getSigner();

        //Deploy NFTMarket contract
        const myNFTToken = new ethers.Contract(nftTokenAddress, NFTToken.abi, owner);
        const NFTMarketAddress = nftMarketplaceAddress; //NFTMarket contract address
        console.log("NFT Marketplace Address is: ", NFTMarketAddress);

        //Create NFTToken contract instance
        const myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, owner);
        const NFTTokenAddress = nftTokenAddress;
        console.log("NFT Token Address is: ", NFTTokenAddress);

        let listingPrice = (await myNFTMarket.getListingPrice()).toString();

        const auctionPrice = ethers.utils.parseUnits("0.01", "ether");

        //we are now creating 2 NFT tokens in the NFTToken contract
        const tx1 = await myNFTToken.connect(nftowner).createToken("https://www.mytoken1.com");
        const tx2 = await myNFTToken.connect(nftowner).createToken("https://www.mytoken2.com");
        const count = await myNFTToken.tokenCount();

        console.log(count);

        //approve NFT Marketplace to create the new tokens
        await myNFTToken.connect(nftowner).approve(NFTMarketAddress, 1);

        //list these 2 NFT Tokens on marketplace.
        await myNFTMarket.connect(nftowner).createMarketItem(NFTTokenAddress, 1, auctionPrice, { value: listingPrice });
        // await myNFTMarket.createMarketItem(NFTTokenAddress, 2, auctionPrice, { value: listingPrice });

        //A "buyer" buys the 1st NFT token.
        // await myNFTMarket.connect(buyer).createMarketSale(NFTTokenAddress, 1, { value: auctionPrice });

        //fetch market items - it should only have the 2nd NFT token.
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
});
