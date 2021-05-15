require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();
// npx hardhat verify --network ropsten 0x5FbDB2315678afecb367f032d93F642f64180aa3 "Success" "SCS" 18
// npx hardhat verify --constructor-args scripts/token.js 0xE79dA49b082D21cfD313104D071cb3856C928d71 --network ropsten

const INFURA_URL = `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.5.0",
  networks:{
    ropsten: {
      url:INFURA_URL,
      accounts:[`0x${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  }
};
