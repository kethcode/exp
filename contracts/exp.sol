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
   * @dev standard constructor that sets the ERC20 parameters
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol, _decimals) {
    // deployer is initial owner per LilOwnable

    // deployer is initial tokenAdmin
    tokenAdmins[msg.sender] = true;
  }

  /// ------------------------------------------------------------------------
  /// Basic ERC20 Functionality
  /// ------------------------------------------------------------------------

  /**
   * @param _adminAddr tokenAdmin address
   * @param _isAdmin enable or disable mint/burn priviledges
   * @dev manages the permissions mapping for mint/brun priviledges
   */
  function setApprovedMinter(address _adminAddr, bool _isAdmin) public {
    if (msg.sender != _owner) revert NotOwner();
    tokenAdmins[_adminAddr] = _isAdmin;
    emit TokenAdminSet(_adminAddr, _isAdmin);
  }

  /**
   * @param to recipient
   * @param value number of tokens to mint
   * @dev creates and transfers soulbound tokens. caller must be tokenAdmin.
   */
  function mint(address to, uint256 value) public {
    if (tokenAdmins[msg.sender] == false) revert NotAuthorized();
    _mint(to, value);
  }

  /**
   * @param from target
   * @param value number of tokens to burn
   * @dev destroys soulbound tokens. caller must be tokenAdmin or target
   */
  function burn(address from, uint256 value) public {
    if ((tokenAdmins[msg.sender] == false) && (msg.sender != from))
      revert NotAuthorized();
    if (balanceOf[from] < value) revert BalanceTooLow();
    _burn(from, value);
  }
}
