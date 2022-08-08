const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const provider = new HDWalletProvider(
    'METAMASK PASS PHARSE MASKED',
    'https://rinkeby.infura.io/ RINKEBY INFURA API MASKED'
);

const web3 = new Web3(provider); //now this "web3" is completed configured to connect to Rinkeby Network

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deply from accounts', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', gasPrice: '5000000000', from: accounts[0] });

    console.log(interface);
    console.log('Contract deployed to', result.options.address);
};
deploy();
