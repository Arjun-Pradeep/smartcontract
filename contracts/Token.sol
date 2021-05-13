//SPDX-License-Identifier: Unlicense
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";


import "hardhat/console.sol";

contract Success is ERC20Mintable, ERC20Pausable, ERC20Detailed {
    
    constructor(string memory _name, string memory _symbol, uint8 _decimal) ERC20Detailed(_name, _symbol, _decimal) public{
            
    }

}




