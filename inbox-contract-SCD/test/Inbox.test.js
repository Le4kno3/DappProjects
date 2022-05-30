const assert = require('assert'); // used for test, to assert that some value is equal to another value.
const ganache = require('ganache-cli'); //dont use ganache-core here
const Web3 = require('web3'); //capital W, because Web3 is a constructor, so wherever we will call Web3, it will create a new instace of it.
const web3 = new Web3(ganache.provider()); //linking ganache provider "ethereum environment" to web3 instance
const { interface, bytecode } = require('../compile'); // require('./compile') will return exported modules.
//  { interface, bytecode } = { assembly: {....}, bytecode: {...},  functionHashes: {...}, gasEstimates: {...}, interface: {...}, metadata: {...} and so on}

let accounts;
let inbox;
const INITIAL_STRING = 'Hi there!';

beforeEach(async () => {
    // Get a list of all acoounts
    accounts = await web3.eth.getAccounts(); // eth = ethereum module of web3 library, of ethereum module we are calling getAccounts9)
    // Use one fo those accounts to deploy the contract

    // inbox is javacript representation of smart contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_STRING] })
        .send({ from: accounts[0], gas: '1000000' }); //we can directly send money because, in ganache, the accounts are unblocked, so do not require public or private key
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        console.log(inbox.options.address);
        assert.ok(inbox.options.address); // if the contract has address, then the object is successfully deployed.
    });

    it('has a default message', async () => {
        let message = await inbox.methods.message().call();
        assert.strictEqual(message, 'Hi there!');

        message = await inbox.methods.setMessage('Bye there!').send({ from: accounts[0] });
        //console.log(message);
        message = await inbox.methods.message().call();
        assert.strictEqual(message, 'Bye there!'); // remember when we deployed the smart contract, we gave "Hi there!" as arguments
    });
});
