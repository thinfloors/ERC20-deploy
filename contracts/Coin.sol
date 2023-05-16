/**
 * Submitted for verification at Etherscan.io on 2023-04-23
 */

// SPDX-License-Identifier: MIT
//
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Coin is Ownable, ERC20 {
    bool public limited;
    uint256 public maxHoldingAmount;
    uint256 public minHoldingAmount;
    address public uniswapV2Pair;
    mapping(address => bool) public blacklists;

    constructor(uint _totalSupply) ERC20("Coin", "COIN") {
        _mint(msg.sender, _totalSupply);
    }

    function blacklist(
        address _address,
        bool _isBlacklisting
    ) external onlyOwner {
        blacklists[_address] = _isBlacklisting;
    }

    function setRule(
        bool _limited,
        address _uniswapV2Pair,
        uint256 _maxHoldingAmount,
        uint256 _minHoldingAmount
    ) external onlyOwner {
        limited = _limited;
        uniswapV2Pair = _uniswapV2Pair;
        minHoldingAmount = _minHoldingAmount;
        maxHoldingAmount = _maxHoldingAmount;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!blacklists[to] && !blacklists[from], "Blacklisted");

        if (uniswapV2Pair == address(0)) {
            require(
                from == owner() || to == owner(),
                "trading has not started"
            );
            return;
        }

        if (limited && from == uniswapV2Pair) {
            require(
                super.balanceOf(to) + amount <= maxHoldingAmount &&
                    super.balanceOf(to) + amount >= minHoldingAmount,
                "Forbidden"
            );
        }
    }

    function burn(uint256 value) external {
        _burn(msg.sender, value);
    }
}
