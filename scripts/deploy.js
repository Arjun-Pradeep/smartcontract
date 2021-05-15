
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(`DEPLOYER ADDRESS :: ${deployer.address}`);

  const Token = await ethers.getContractFactory('Success');
  const token = await Token.deploy("Success", "SCS", 18);
  
  console.log("TOKEN CONTRACT ADDRESS :: ", token.address)
  
  const rate = 500;
  const wallet = 0x61022f75C169E722ECC4293083296ADCb8b0467; //1
  const cap = 50000000000;
  const goal = 50000000000;
  const openingTime = 412;
  const closingTime = 23;
  const reserveWalletAddress = 0x2A55Cf377A2cD70F1a82B90b2dfb1cB68c45d8BD;//2
  const interestpayoutAddress = 0xFEa69588b99f46f86710c161A898236BF65a326B;//3
  const teamMemberHRWalletAddress = 0x9A1B0ADBB943d3a6d33003B8838A7A530e350E3E;//4
  const companyGeneralFundWalletAddress = 0x9B2c23aDB38C1d5CE9c6AF057F2cA19841BB58C5;//5
  const airDropWalletAddress = 0x940FA1593544824d9ed4E05Fb6041A423f73Fc1E;//6


  // token 50000000000 - 50 bn
  const CrowdSale = await ethers.getContractFactory("TokenCrowdSale");
  const crowdsale = await CrowdSale.deploy(500, wallet, token.address, cap, goal,openingTime,closingTime,
    reserveWalletAddress,interestpayoutAddress,teamMemberHRWalletAddress,companyGeneralFundWalletAddress,airDropWalletAddress);

  console.log("CROWDSALE CONTRACT ADDRESS :: ", crowdsale.address);

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
