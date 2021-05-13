pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";

contract TokenCrowdSale is Crowdsale, MintedCrowdsale, CappedCrowdsale, TimedCrowdsale {
 
    // Investor Contributions
    uint256 public investorMinCap = 200000000000000; // 0.002 ETH
    uint256 public investorHardCap = 100000000000000000000; // 100 ETH

    mapping(address=>uint256) public contributions;

    constructor(uint256 _rate, address payable _wallet, IERC20 _token, uint256 _cap, uint256 _openingTime, uint256 _closingTime) 
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        TimedCrowdsale(_openingTime, _closingTime)
        public {


    } 

    /**
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        uint256 _newContribution = contributions[_beneficiary].add(_weiAmount);
        require(_newContribution >= investorMinCap && _newContribution <= investorHardCap,"Error:WeiAmount");
        contributions[_beneficiary] = _newContribution;
    } 

}