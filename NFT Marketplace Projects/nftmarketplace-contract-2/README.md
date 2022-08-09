### About the Project

**Note: Live testnet takes about atmost 2 min to complete the transaction, so dont close the tab or do anything. You should see 2 metamask notifications that transaction are processing, let them finishe the processing and wait. On successful transaction, you will automatically be redirected to the homepage, after than click the marketplace menu to see your newly minted token.**

-   This is copy of an alreayd present NFT marketplace creatd by "beauwilliams".
-   There were some changes needed to the original project for it to be deployed to Polygon testnet (like the rpc_url fetch from .env file, etc.)
-   Make sure to edit the .env-example file

[https://github.com/beauwilliams/demo-next-typescript-hardhat-marketplace](https://github.com/beauwilliams/demo-next-typescript-hardhat-marketplace)

# Demo NFT Marketplace

### Goals:

-   Concise code
-   Well typed
-   Modern react code using hooks + functional features
-   Code can be easily refactored
-   Easy for other developers to contribute and leverage the code
-   Fast. Server side rendering as much as possible
-   Extensible. Code in this project is useful in many dapps or as providing inspiration

### Tech stack:

_code_

-   Typescript (default is JS [any type / untyped], typed where possible. Aiming for fully typed code a.k.a proper Typescript code)
    _content frameworks_
-   NextJs (React fairy dust. More is more. NextJs makes make aspects of react development a lot easier)

_styles_

-   Tailwind CSS + PostCSS (Tailwind supplies CSS, postCSS is the preprocessor)

_ethereum dev tools_

-   Hardhat (Based smart contracts dev suite)
-   Ethers (Because it's the standard library to interact with blockchain and is a well trodden library many developers have already navigated)
-   Web3Modal (It's nice yeah.. I'm not happy with the wallet integration code yet. It's a mess **WIP**)

# DEVS START HERE

_the 2 steps to success_

1. install `tmux` on your local machine if not installed already

2. run `source DEVS-RUN-ME-FIRST.sh`

### Starting the servers

1. run `start`

_or ./start.sh if you chose not to set up this projects aliases_

### Stopping the servers

1. run `stop`

_or ./stop.sh if you chose not to set up this projects aliases_

# Preview

![nft_market_preview](https://i.ibb.co/y4hnL8Q/Screen-Shot-2021-12-24-at-2-38-52-pm.png)
