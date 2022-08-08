import { useState } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';
import Image from 'next/image';
import { Utilities } from '../config';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
    nftTokenAddress, nftMarketplaceAddress
} from '../config';
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
// import { EtherscanProvider } from '@ethersproject/providers';

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', utility: '' });
    const router = useRouter();

    async function uploadImage(e) {
        const fileObject = e.target.files[0];
        // console.log("The file object is: ", fileObject);
        //try uploading the file
        try {
            const added = await client.add(
                fileObject,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            );
            //file saved in the url path below
            const ipfsImageURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(ipfsImageURL);
        } catch (e) {
            console.log('Error uploading file: ', e);
        }
    }

    //1. create item checks form inputs and create NFT Token URI using infuria IPFS
    async function createTokenURI() {
        const { name, description, price, utility } = formInput; //get the value from the form input

        //form validation
        if (!name || !description || !price || !fileUrl || !utility) {
            return;
        }

        //create a tokenURI
        const data = JSON.stringify({
            name, description, image: fileUrl, utility
        });

        //The NFT token to be listed will be uploaded to IPFS in form of JSON string
        // with {name, description, image, utility} properties
        try {
            const added = await client.add(data);
            const ipfsTokenURI = `https://ipfs.infura.io/ipfs/${added.path}`;

            //pass the tokenURI to create the listing on NFT Marketplace.
            createNewItem(ipfsTokenURI);
        } catch (error) {
            console.log(`Error uploading file: `, error);
        }
    }

    //2. List item for sale
    async function createNewItem(ipfsTokenURI) {
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
        let myNFTToken = new ethers.Contract(nftTokenAddress, NFTToken.abi, signer);

        //create a new token using the tokenURI.
        let transaction = await myNFTToken.createToken(ipfsTokenURI);

        //this transaction.wait() method fetch additional "event" details of the transaction
        let tx = await transaction.wait();

        //we need the tokenId to create
        //get the tokenId from the transaction that occured above
        //there events array that is returned, the first item from that event
        //is the event, third item is the token id.
        console.log('Transaction: ', tx);
        console.log('Transaction events: ', tx.events[0]);
        let event = tx.events[0];   //first event
        let value = event.args[2];  //3rd item of "args" key of first event is tokenId
        //let value = event.args.tokenId;  //tokenId key of item of "args" key of the first event is tokenId
        let tokenId = value.toNumber(); //we need to convert it a number

        //Now the token is created and necessary information is captured.
        //Below code is to create the listing of this token

        const price = ethers.utils.parseUnits(formInput.price, 'ether');

        //create instance of the marketplace contract.
        const myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, signer);

        //get the listing price
        let listingPrice = await myNFTMarket.getListingPrice();
        listingPrice = listingPrice.toString();

        //create the listing item in NFT marketplace + sending the listing amount by msg.sender
        //for wallet handling of the user, we need to connect metamask with our local ethereum blockchain
        //once connected, the below code will trigger metamask transaction window
        // to transfer the "listingPrice" amount from msg.sender
        //this is possible because the owner of the NFT token and NFT Marketplace are the same.
        transaction = await myNFTMarket.createMarketItem(
            nftTokenAddress, tokenId, price, { value: listingPrice }
        );

        //fetch the additional "event" data of the transaction.
        await transaction.wait();

        //after fetching the previous line, redirect page to homepage.
        router.push('/');
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-8 border rounded p-4"
                    type="number"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={uploadImage}
                />
                {
                    fileUrl && (

                        <Image
                            src={fileUrl}
                            alt="Picture of the author"
                            className="rounded mt-4"
                            width={350}
                            height={500}
                        // blurDataURL="data:..." automatically provided
                        // placeholder="blur" // Optional blur-up while loading
                        />
                    )
                }
                <h2 className="text-2xl py-2 bg-black text-white" style={{ marginTop: `20px` }}>Select Offer for the NFT.</h2>
                {
                    Utilities.map((value, key) => (
                        // eslint-disable-next-line react/jsx-key
                        <div>
                            <input type="radio" onChange={e => updateFormInput({ ...formInput, utility: key.toString() })} /> {key}. {value}
                        </div>
                    ))
                }
                <button style={{ marginTop: `30px` }} onClick={createTokenURI}
                    className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                >Create NFT</button>
            </div>
        </div>
    );
}