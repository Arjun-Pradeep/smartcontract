const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Success Token", function () {

  var Success, success; 

  beforeEach('Token Deployment', async() => {

      Success = await ethers.getContractFactory("Success");
      success = await Success.deploy("Success","SCS",18);

  })

  describe('Token Parameters', async()=> {

    it("Token Name Matches", async function () {
  
      await success.deployed();
  
      expect(await success.name()).to.equal("Success");

    });

    it("Token Symbol Matches", async function () {
  
      await success.deployed();
  
      expect(await success.symbol()).to.equal("SCS");

    });

    it("Token Decimal Matches", async function () {
  
      await success.deployed();
  
      expect(await success.decimals()).to.equal(18);

    });

  })

});


describe("Crowdsale", function() {

  var CrowdSale, crowdsale, Token, token;

  beforeEach('Crowdsale Deployment', async()=>{

    [deployer, wallet] = await ethers.getSigners();

    // token
    Token = await ethers.getContractFactory("Success");
    token = await Token.deploy("Success","SCS",18);

    // crowdsale
    CrowdSale = await ethers.getContractFactory('TokenCrowdSale');
    crowdsale = await CrowdSale.deploy(500, wallet.address, token.address);

  })

  describe('CrowdSale parameters',async() => {
    
    it('Token Address Matches',async() => {
      const tokens = await crowdsale.token();
      expect(tokens).to.equal(token.address);
    })

    it('Rate Matches',async() => {
      const rate = await crowdsale.rate();
      expect(rate).to.equal(500);
    })

    it('Wallet Matches',async() => {
      const wallets = await crowdsale.wallet();
      expect(wallets).to.equal(wallet.address);
    })

  })

})