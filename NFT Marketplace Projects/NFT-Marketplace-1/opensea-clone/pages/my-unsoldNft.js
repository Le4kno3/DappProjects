import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal";
import Image from 'next/image';

import { nftTokenAddress, nftMarketplaceAddress, Utilities, availableVouchers, expiredVouchers, userDatabase } from '../config';
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function MyAssets() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    let currentVoucher = '';

    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        // If we use the below it will directly connect to our local ethereum blockchain, but we dont want that.
        // const provider = new ethers.providers.JsonRpcProvider();
        // We want that any transaction that requires money to be send must use metamask
        //to do so we need to use "Web3Modal();"
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        //fetch the connected account from metamask
        const signer = provider.getSigner();

        //create the contract instance using msg.sender's metamask account
        const myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, signer);
        const myNFTToken = new ethers.Contract(nftTokenAddress, NFTToken.abi, provider);

        //data will be an array of NFTs
        const data = await myNFTMarket.fetchMyUnsoldNFTs();

        // console.log(data);

        //transform the result as per our need + any additions
        const items = await Promise.all(data.map(async i => {
            const tokenUri = await myNFTToken.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                utility: Utilities[parseInt(meta.data.utility)]
            };
            return item;
        }));


        setNfts(items);
        setLoadingState('loaded');
    }
    //if loaded and found no NFTs bought by the user then,
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">All assets sold.</h1>);

    //else if loaded and some NFTs are bought by the user
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">


                                <Image
                                    src={nft.image}
                                    alt="Picture of the author"
                                    className="rounded"
                                    width={350}
                                    height={500}
                                // blurDataURL="data:..." automatically provided
                                // placeholder="blur" // Optional blur-up while loading
                                />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}