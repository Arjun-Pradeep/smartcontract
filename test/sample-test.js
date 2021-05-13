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

    [deployer, wallet, investor1, investor2] = await ethers.getSigners();

    // token
    Token = await ethers.getContractFactory("Success");
    token = await Token.deploy("Success","SCS",18);

    // crowdsale
    CrowdSale = await ethers.getContractFactory('TokenCrowdSale');
    crowdsale = await CrowdSale.deploy(500, wallet.address, token.address);

    // transferOwnership to crowdsale
    // await token.transferOwnership(crowdsale.address);
    await token.addMinter(crowdsale.address);

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

  describe('accept payments', async() => {

    it('payment accepted', async()=> {
      const value = await ethers.utils.parseEther("10.0");
      console.log("VALUE::",await ethers.utils.formatUnits(value, 18));
      
      let investor1Balance = await ethers.provider.getBalance(investor1.address);
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18)

      console.log("BEFORE BALANCE::",investor1Balance);

      const tx = await investor1.sendTransaction({
        to: investor2.address,
        value: value
      })

      investor1Balance = await ethers.provider.getBalance(investor1.address);
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18)

      console.log("AFTER BALANCE::",investor1Balance);

      let investor2Balance = await ethers.provider.getBalance(investor2.address);
      investor2Balance = await ethers.utils.formatUnits(investor2Balance, 18)
      
      console.log("BALANCE::",investor2Balance);

      let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    };

      await crowdsale.connect(investor1).buyTokens(investor2.address,overrides);
      
      investor1Balance = await ethers.provider.getBalance(investor1.address);
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18)

      console.log("AFTER BALANCE::",investor1Balance);
    })

  })

  describe('Minting CrowdSale',async()=>{
    it('mint after purchase',async()=>{
      const origTotalSupply = await token.totalSupply();
      console.log("ORIGINAL TOTAL SUPPLY::",origTotalSupply.toString())

      let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0")     // ether in this case MUST be a string
    };

      await crowdsale.connect(investor1).buyTokens(investor2.address,overrides);
  
      const newTotalSupply = await token.totalSupply();
      console.log("NEW TOTAL SUPPLY::",newTotalSupply.toString())
    })
    
  })

})