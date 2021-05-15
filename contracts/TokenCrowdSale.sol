pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/RefundablePostDeliveryCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";
import "hardhat/console.sol";

contract TokenCrowdSale is
    Crowdsale,
    ERC20Mintable,
    Pausable,
    Ownable,
    MintedCrowdsale,
    CappedCrowdsale,
    TimedCrowdsale,
    WhitelistCrowdsale,
    RefundablePostDeliveryCrowdsale
{
    //Token divisions
    uint256 public reserveWallet = 30;
    uint256 public interestpayout = 20;
    uint256 public teamMemberHRWallet = 10;
    uint256 public companyGeneralFundWallet = 13;
    uint256 public airDropWallet = 2;
    uint256 public tokenSaleWallet = 25;

    //Token Address
    address public reserveWalletAddress;
    address public interestpayoutAddress;
    address public teamMemberHRWalletAddress;
    address public companyGeneralFundWalletAddress;
    address public airDropWalletAddress;

    // Investor Contributions
    uint256 public investorMinCap = 200000000000000; // 0.002 ETH
    uint256 public investorHardCap = 100000000000000000000; // 100 ETH

    mapping(address => uint256) public contributions;

    enum icoStatus {preIco, ico}

    icoStatus public status = icoStatus.preIco;

    constructor(
        uint256 _rate,
        address payable _wallet,
        IERC20 _token,
        uint256 _cap,
        uint256 _goal,
        uint256 _openingTime,
        uint256 _closingTime,
        address _reserveWalletAddress,
        address _interestpayoutAddress,
        address _teamMemberHRWalletAddress,
        address _companyGeneralFundWalletAddress,
        address _airDropWalletAddress
    )
        public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        TimedCrowdsale(_openingTime, _closingTime)
        RefundableCrowdsale(_goal)
    {
        require(_goal <= _cap);
        reserveWalletAddress = _reserveWalletAddress;
        interestpayoutAddress = _interestpayoutAddress;
        teamMemberHRWalletAddress = _teamMemberHRWalletAddress;
        companyGeneralFundWalletAddress = _companyGeneralFundWalletAddress;
        airDropWalletAddress = _airDropWalletAddress;
        
    }

    /**
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount)
        internal
    {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        uint256 _newContribution = contributions[_beneficiary].add(_weiAmount);
        require(
            _newContribution >= investorMinCap &&
                _newContribution <= investorHardCap,
            "Error:WeiAmount"
        );
        contributions[_beneficiary] = _newContribution;
    }

    /**
     * For updating the crowdsale status
     * @param _status Crowdsale status
     */
    function setIcoStatus(uint256 _status) public onlyOwner {
        if (uint256(icoStatus.preIco) == _status) {
            status = icoStatus.preIco;
        } else if (uint256(icoStatus.ico) == _status) {
            status = icoStatus.ico;
        }
    }

    // @dev finalization task
    function _finalization() internal { 
        if (goalReached()) {
            ERC20Mintable.finishMinting();
            uint256 totalMinted = ERC20Mintable.totalSupply();
            console.log("TOTAL MINTED::", totalMinted); 
            uint256 finalTotalSupply = totalMinted.div(tokenSaleWallet).mul(100);
            
            ERC20Mintable.mint(
                reserveWalletAddress,
                finalTotalSupply.div(reserveWallet)
            );
            ERC20Mintable.mint(
                interestpayoutAddress,
                finalTotalSupply.div(interestpayout)
            );
            ERC20Mintable.mint(
                teamMemberHRWalletAddress,
                finalTotalSupply.div(teamMemberHRWallet)
            );
            ERC20Mintable.mint(
                companyGeneralFundWalletAddress,
                finalTotalSupply.div(companyGeneralFundWallet)
            );
            ERC20Mintable.mint(
                airDropWalletAddress,
                finalTotalSupply.div(airDropWallet)
            );

            Pausable.unpause();
        }
        super._finalization();
    }
}
