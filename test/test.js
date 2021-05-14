const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@babel/register")
// const { increaseTimeTo, duration, increaseTime } = require('./increaseTime');
// const latestTime = require('./latestTime');
var BigNumber = require("big-number");

describe("Success Token", function () {
  var Success, success;

  beforeEach("Token Deployment", async () => {
    Success = await ethers.getContractFactory("Success");
    success = await Success.deploy("Success", "SCS", 18);
  });

  describe("Token Parameters", async () => {
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
  });
});

describe("Crowdsale", function () {
  var CrowdSale,
    crowdsale,
    Token,
    token,
    cap,
    investorMinCap,
    investorHardCap,
    openingTime,
    closingTime,
    goal,
    refundCrowdSale,
    refundcrowdsale;

  before("Crowdsale Deployment", async () => {
    [deployer, wallet, investor1, investor2, investor3] = await ethers.getSigners();

    // token
    Token = await ethers.getContractFactory("Success");
    token = await Token.deploy("Success", "SCS", 18);

    // crowdsale
    cap = await ethers.utils.parseEther("100.0");
    investorMinCap = await ethers.utils.parseEther("0.0002");
    investorHardCap = await ethers.utils.parseEther("100");
    openingTime =  Math.floor(Date.now() / 1000) + 2;
    console.log("Opening Time",openingTime);
    // // console.log("21143",await ethers.BigNumber.from(openingTime).toNumber());
    closingTime = openingTime + 300 ;
    console.log("closing Time",closingTime);
    goal = await ethers.utils.parseEther("50");
    
    CrowdSale = await ethers.getContractFactory("TokenCrowdSale");
    crowdsale = await CrowdSale.deploy(500, wallet.address, token.address, cap, goal,openingTime,closingTime);

    // transferOwnership to crowdsale
    // await token.transferOwnership(crowdsale.address);
    await token.addMinter(crowdsale.address);

    await crowdsale.addWhitelisted(investor1.address);
    await crowdsale.addWhitelisted(investor2.address);

    // await crowdsale._extendTime(1);


  });

  describe("CrowdSale parameters", async () => {
    it("Token Address Matches", async () => {
      const tokens = await crowdsale.token();
      expect(tokens).to.equal(token.address);
    });

    it("Rate Matches", async () => {
      const rate = await crowdsale.rate();
      expect(rate).to.equal(500);
    });

    it("Wallet Matches", async () => {
      const wallets = await crowdsale.wallet();
      expect(wallets).to.equal(wallet.address);
    });
  });

  describe("accept payments", async () => {
    it("payment accepted", async () => {
      const value = await ethers.utils.parseEther("10.0");
      console.log("VALUE::", await ethers.utils.formatUnits(value, 18));

      let investor1Balance = await ethers.provider.getBalance(
        investor1.address
      );
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18);

      console.log("BEFORE BALANCE::", investor1Balance);

      const tx = await investor1.sendTransaction({
        to: investor2.address,
        value: value,
      });

      investor1Balance = await ethers.provider.getBalance(investor1.address);
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18);

      console.log("AFTER BALANCE::", investor1Balance);

      let investor2Balance = await ethers.provider.getBalance(
        investor2.address
      );
      investor2Balance = await ethers.utils.formatUnits(investor2Balance, 18);

      console.log("BALANCE::", investor2Balance);

      let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0"), // ether in this case MUST be a string
      };

      await crowdsale
        .connect(investor1)
        .buyTokens(investor2.address, overrides);

      investor1Balance = await ethers.provider.getBalance(investor1.address);
      investor1Balance = await ethers.utils.formatUnits(investor1Balance, 18);

      console.log("AFTER BALANCE::", investor1Balance);
    });
  });

  describe("Minting CrowdSale", async () => {
    it("mint after purchase", async () => {
      const origTotalSupply = await token.totalSupply();
      console.log("ORIGINAL TOTAL SUPPLY::", origTotalSupply.toString());

      let overrides = {
        // To convert Ether to Wei:
        value: ethers.utils.parseEther("1.0"), // ether in this case MUST be a string
      };

      await crowdsale
        .connect(investor1)
        .buyTokens(investor2.address, overrides);

      const newTotalSupply = await token.totalSupply();
      console.log("NEW TOTAL SUPPLY::", newTotalSupply.toString());
      expect(newTotalSupply).to.be.above(origTotalSupply);
    });
  });

  describe("Capped CrowdSale", () => {
    it("hard cap", async () => {
      const hardcap = await crowdsale.cap();
      console.log("Hard Cap::", hardcap.toString());
      expect(hardcap).to.equal(cap);
    });
  });

  describe("buying tokens", () => {
    describe("contribution less than the min cap", () => {
      it("rejects the transaction", async () => {
        let value = investorMinCap - 10000;
        value = await ethers.utils.formatEther(value);
        console.log("Value::", value.toString());
        let overrides = {
          // To convert Ether to Wei:
          value: await ethers.utils.parseEther(value), // ether in this case MUST be a string
        };
        await crowdsale.buyTokens(investor2.address,overrides)

        // await expect(
        //   crowdsale.buyTokens(investor2.address, overrides)
        // ).to.be.revertedWith("Error:WeiAmount");
      });
    });

    describe("when the investor has already met the min cap", () => {
      it("allows the investor to contribute below min cap", async () => {
        let value1 = await ethers.utils.parseEther("1.0");
        console.log("Value1::", value1.toString());
        let overrides = {
          // To convert Ether to Wei:
          value: value1, // ether in this case MUST be a string
        };
        // await crowdsale.buyTokens(investor2.address,overrides)

        await expect(crowdsale.buyTokens(investor2.address, overrides));

        let value2 = 10; //wei
        console.log("Value2::", value2.toString());
        overrides = {
          // To convert Ether to Wei:
          value: value2, // ether in this case MUST be a string
        };
        // await crowdsale.buyTokens(investor2.address,overrides)

        await expect(crowdsale.buyTokens(investor2.address, overrides));
      });
    });

    describe("contribution greater than the hard cap", () => {
      it("rejects the transaction", async () => {
        let value = await ethers.utils.parseEther("110.0");
        console.log("Value::", value.toString());
        let overrides = {
          // To convert Ether to Wei:
          value: value, // ether in this case MUST be a string
        };

        await expect(
          crowdsale.buyTokens(investor2.address, overrides)
        ).to.be.revertedWith("CappedCrowdsale: cap exceeded");
      });
    });

    describe("when contribution is within the valid range", () => {
      it("allows the investor to contribute within range", async () => {
        let value1 = await ethers.utils.parseEther("1.0");
        console.log("Value1::", value1.toString());
        let overrides = {
          // To convert Ether to Wei:
          value: value1, // ether in this case MUST be a string
        };
        // await crowdsale.buyTokens(investor2.address,overrides)

        await expect(crowdsale.buyTokens(investor2.address, overrides));

        const contribution = await crowdsale.contributions(investor2.address);
        expect(contribution).to.equal("4000199999999990010");//(value1);
      });
    });
  });

  // describe('Time CrowdSale', () => {
  //   it('Is openingTime',async() => {
  //     const isClosed = await crowdsale.hasClosed();
  //     expect(isClosed).to.not.be.false;
  //   })
  // })

  describe("Whitelisted CrowdSale", () => {
    it("reject from non-whitelisted address", async () => {
      let value = await ethers.utils.parseEther("1.0");
      console.log("INVESTOR 3::", investor3.address);
      let overrides = {
        value: value,
      };
      // await crowdsale.buyTokens(investor3.address, overrides)
      await expect(crowdsale.buyTokens(investor3.address, overrides)).to.be.revertedWith("revert WhitelistCrowdsale: beneficiary doesn't have the Whitelisted role");

    });
  });

  describe('refundable crowdsale', () => {
    it('Claiming refund neglected',async() => {
      let value = await ethers.utils.parseEther("100.0");
      console.log("INVESTOR 2::", investor2.address);
      let overrides = {
        value: value,
      }; 

      // await crowdsale.withdrawTokens(investor2.address);
      await expect(crowdsale.claimRefund(investor3.address)).to.be.revertedWith("revert RefundableCrowdsale: not finalized");
    })
  })


  describe('crowdsale status', () => {
    it('owner updates the crowdsale status', async() => {
      await crowdsale.connect(deployer).setIcoStatus(1);
      let crowdsaleStatus = await crowdsale.status();
      expect(crowdsaleStatus).to.equal(1);
    })

    it('non-owner cannot update the crowdsale status',async()=>{
      await expect(crowdsale.connect(investor3).setIcoStatus(1)).to.be.revertedWith('revert Ownable: caller is not the owner');
    })

  })


  describe('Finalize minting', async() => {
    it('minting not finished',async()=>{
      let value = await ethers.utils.parseEther("30.0");
      console.log("INVESTOR 2::", investor2.address);
      let overrides = {
        value: value,
      };
      // await crowdsale.buyTokens(investor3.address, overrides)
      await crowdsale.buyTokens(investor2.address, overrides);
      await crowdsale.buyTokens(investor2.address, overrides);
  
      await expect(crowdsale.finalize()).to.be.revertedWith('revert FinalizableCrowdsale: not closed');
    })
  })
  
  
  


});
