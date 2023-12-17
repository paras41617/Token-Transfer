// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol;
    uint256 public totalSupply;

    address public owner;
    uint256 public tokensForSale;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event Withdrawal(address indexed owner, uint256 amount);

    event TransactionStatus(bool success, string message);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        owner = msg.sender;
        tokensForSale = _initialSupply / 2;

        balanceOf[msg.sender] = _initialSupply / 2;
    }

    function buyTokens(uint256 _amount) external payable {
        require(_amount > 0, "You must buy at least one token");
        require(_amount <= tokensForSale, "Not enough tokens available for sale");
        require(msg.value == _amount * 1 ether, "Incorrect Ether value");

        balanceOf[msg.sender] += _amount;
        tokensForSale -= _amount;

        emit Transfer(owner, msg.sender, _amount);
        emit TokensPurchased(msg.sender, _amount, msg.value);
        emit TransactionStatus(true, "Token purchase successful");
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        require(_value <= balanceOf[msg.sender], "Insufficient balance");
        require(_to != address(0), "Invalid address");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        require(_to != address(0), "Invalid address");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    function withdrawEther() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No Ether to withdraw");
        payable(owner).transfer(contractBalance);

        emit Withdrawal(owner, contractBalance);
        emit TransactionStatus(true, "Ether withdrawal successful");
    }

}


