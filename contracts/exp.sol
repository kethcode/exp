// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// ----------------------------------------------------------------------------
/// Overview
/// ----------------------------------------------------------------------------

// based on import "@rari-capital/solmate/src/tokens/ERC20.sol";
// based on https://github.com/m1guelpf/erc721-drop/blob/main/src/LilOwnable.sol

/// ----------------------------------------------------------------------------
/// Library Imports
/// ----------------------------------------------------------------------------
import "./solmate_ERC20_abridged.sol";
import "./LilOwnable.sol";

// import "hardhat/console.sol";

/// ----------------------------------------------------------------------------
/// Errors
/// ----------------------------------------------------------------------------

error isSoulbound();
error NotAuthorized();
error BalanceTooLow();

/**
 * @title exp
 * @dev redacted
 */

contract exp is ERC20, LilOwnable {
  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------
  event TokenAdminSet(address indexed _adminAddr, bool indexed _isAdmin);

  /// ------------------------------------------------------------------------
  /// Variables
  /// ------------------------------------------------------------------------
  mapping(address => bool) public tokenAdmins;

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------

  /**
   * @param _name token name
   * @param _symbol token symbol
   * @param _decimals decimal places
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol, _decimals) {
    // allow owner to mint
    tokenAdmins[msg.sender] = true;
  }

  /// ------------------------------------------------------------------------
  /// Basic ERC20 Functionality
  /// ------------------------------------------------------------------------
  //function setApprovedMinter(address _minterAddr, bool _approved) public {
  function setTokenAdmin(address _adminAddr, bool _isAdmin) public {
    if (msg.sender != _owner) revert NotOwner();
    tokenAdmins[_adminAddr] = _isAdmin;
    emit TokenAdminSet(_adminAddr, _isAdmin);
  }

  function mint(address to, uint256 value) public virtual {
    if (tokenAdmins[msg.sender] == false) revert NotAuthorized();
    _mint(to, value);
  }

  function burn(address from, uint256 value) public virtual {
    if ((tokenAdmins[msg.sender] == false) && (msg.sender != from))
      revert NotAuthorized();
    if(balanceOf[from] < value) revert BalanceTooLow();
    _burn(from, value);
  }

  function approve(address spender, uint256 amount)
    public
    pure
    override
    returns (bool)
  {
    revert isSoulbound();
  }

  function transfer(address to, uint256 amount)
    public
    pure
    override
    returns (bool)
  {
    revert isSoulbound();
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public pure override returns (bool) {
    revert isSoulbound();
  }
}
