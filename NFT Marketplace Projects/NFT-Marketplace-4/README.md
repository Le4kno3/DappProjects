## Hardhat Solidity Development using Typescript - Environment Setup and Starter Code

This instructions are needed in starter code of hardhat typescript starter project, because on June 2022 hardhat [Ref](https://ethereum.stackexchange.com/questions/120984/property-revertedwith-does-not-exist-on-type-assertion) did few changes. Below instructions cover the changes.

### Step 1:

```
yarn add ethers hardhat @nomiclabs/hardhat-ethers web3modal @openzeppelin/contracts ipfs-http-client axios
```

### Step 2:

- Run `npx hardhat` and select the typescript project.
- Select all default options.

### Step 3:

```
yarn add --dev typescript ts-node dotenv @nomiclabs/hardhat-waffle @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-network-helpers @nomiclabs/hardhat-etherscan @typechain/hardhat @typechain/ethers-v5 typechain hardhat-gas-reporter solidity-coverage @types/jest chai @ethersproject/abi @ethersproject/providers
```

### Step 4:

- Make sure the network is selected to "hardhat" or no network (default hardhat network will also work)

### Step 5:

- Run `npx hardhat test`
- On success the result will look like below:
  ![Success Screenshot](https://github.com/Le4kno3/Solidity-Contracts-Practice/blob/main/success.png?raw=true)
