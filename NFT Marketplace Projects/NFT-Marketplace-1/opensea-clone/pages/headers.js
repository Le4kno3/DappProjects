import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Link from "next/link";

const Headers = () => {
    return (
        // This code is the first thing that will executed on all pages
        <div>
            <nav className="border-b p-6">
                <p className="text-4xl font-bold">NIFTY Marketplace</p>
                <div className="flex mt-4"></div>
                <Link href="/">
                    <a className="mr-4 text-pink-500">Home</a>
                </Link>
                <Link href="/mint-nft">
                    <a className="mr-6 text-pink-500">MintNFT</a>
                </Link>
                <Link href="/load-nft">
                    <a className="mr-6 text-pink-500">LoadNFT</a>
                </Link>
                <Link href="/my-unsoldNft">
                    <a className="mr-6 text-pink-500">MyUnsoldNFT</a>
                </Link>
                <Link href="/my-purchases">
                    <a className="mr-6 text-pink-500">MyPurchasedNFT</a>
                </Link>
                <Link href="/creator-dashboard">
                    <a className="mr-6 text-pink-500">Dashboard</a>
                </Link>
            </nav>

            {/* Print the actual page now */}
            {/* <Component {...pageProps} /> */}
        </div>
    );
};

export default Headers;