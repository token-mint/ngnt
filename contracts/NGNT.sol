pragma solidity ^0.5.0;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@0x/contracts-utils/contracts/src/LibBytes.sol";

import './Ownable.sol';
import './Blacklistable.sol';
import "./Pausable.sol";

contract NGNT is GSNRecipient, Ownable, ERC20, Pauseable, Blacklistable {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint8 public decimals;
    string public currency;
    address public masterMinter;
    bool internal initialized;

    uint256 public gsnFee;
    mapping(address => uint256) internal balances;
    mapping(address => mapping(address => uint256)) internal allowed;
    uint256 internal totalSupply_ = 0;
    mapping(address => bool) internal minters;
    mapping(address => uint256) internal minterAllowed;

    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed burner, uint256 amount);
    event GSNFeeUpdated(uint256 oldFee, uint256 newFee);
    event GSNFeeCharged(uint256 fee, address user);
    event MinterConfigured(address indexed minter, uint256 minterAllowedAmount);
    event MinterRemoved(address indexed oldMinter);
    event MasterMinterChanged(address indexed newMasterMinter);

    function initialize(
        string _name,
        string _symbol,
        string _currency,
        uint8 _decimals,
        address _masterMinter,
        address _pauser,
        address _blacklister,
        address _owner,
        uint256 _gsnFee
    ) public {
        require(!initialized);
        require(_masterMinter != address(0));
        require(_pauser != address(0));
        require(_blacklister != address(0));
        require(_owner != address(0));

        name = _name;
        symbol = _symbol;
        currency = _currency;
        decimals = _decimals;
        masterMinter = _masterMinter;
        pauser = _pauser;
        blacklister = _blacklister;
        gsnFee = _gsnFee;
        setOwner(_owner);
        initialized = true;
    }

    /**
      * @dev Throws if called by any account other than a minter
    */
    modifier onlyMinters() {
        require(minters[_msgSender()] == true);
        _;
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint. Must be less than or equal to the minterAllowance of the caller.
     * @return A boolean that indicates if the operation was successful.
    */
    function mint(address _to, uint256 _amount) whenNotPaused onlyMinters notBlacklisted(_msgSender()) notBlacklisted(_to) public returns (bool) {
        require(_to != address(0));
        require(_amount > 0);

        uint256 mintingAllowedAmount = minterAllowed[_msgSender()];
        require(_amount <= mintingAllowedAmount);

        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        minterAllowed[_msgSender()] = mintingAllowedAmount.sub(_amount);
        emit Mint(_msgSender(), _to, _amount);
        emit Transfer(0x0, _to, _amount);
        return true;
    }

    /**
     * @dev Throws if called by any account other than the masterMinter
    */
    modifier onlyMasterMinter() {
        require(_msgSender() == masterMinter);
        _;
    }

    /**
     * @dev Get minter allowance for an account
     * @param minter The address of the minter
     */
    function minterAllowance(address minter) public view returns (uint256) {
        return minterAllowed[minter];
    }

    /**
     * @dev Checks if account is a minter
     * @param account The address to check
    */
    function isMinter(address account) public view returns (bool) {
        return minters[account];
    }

    /**
     * @dev Get allowed amount for an account
     * @param owner address The account owner
     * @param spender address The account spender
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowed[owner][spender];
    }

    /**
     * @dev Get totalSupply of token
    */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
     * @dev Get token balance of an account
     * @param account address The account
     */
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    /**
     * @dev Adds blacklisted check to approve
     * @return True if the operation was successful.
    */
    function approve(address _spender, uint256 _value) whenNotPaused notBlacklisted(_msgSender()) notBlacklisted(_spender) public returns (bool) {
        allowed[_msgSender()][_spender] = _value;
        emit Approval(_msgSender(), _spender, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @return bool success
    */
    function transferFrom(address _from, address _to, uint256 _value) whenNotPaused notBlacklisted(_to) notBlacklisted(_msgSender()) notBlacklisted(_from) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][_msgSender()]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][_msgSender()] = allowed[_from][_msgSender()].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     * @return bool success
    */
    function transfer(address _to, uint256 _value) whenNotPaused notBlacklisted(_msgSender()) notBlacklisted(_to) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_msgSender()]);

        balances[_msgSender()] = balances[_msgSender()].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_msgSender(), _to, _value);
        return true;
    }

    /**
     * @dev Function to add/update a new minter
     * @param minter The address of the minter
     * @param minterAllowedAmount The minting amount allowed for the minter
     * @return True if the operation was successful.
    */
    function configureMinter(address minter, uint256 minterAllowedAmount) whenNotPaused onlyMasterMinter public returns (bool) {
        minters[minter] = true;
        minterAllowed[minter] = minterAllowedAmount;
        emit MinterConfigured(minter, minterAllowedAmount);
        return true;
    }

    /**
     * @dev Function to remove a minter
     * @param minter The address of the minter to remove
     * @return True if the operation was successful.
    */
    function removeMinter(address minter) onlyMasterMinter public returns (bool) {
        minters[minter] = false;
        minterAllowed[minter] = 0;
        emit MinterRemoved(minter);
        return true;
    }

    /**
     * @dev allows a minter to burn some of its own tokens
     * Validates that caller is a minter and that sender is not blacklisted
     * amount is less than or equal to the minter's account balance
     * @param _amount uint256 the amount of tokens to be burned
    */
    function burn(uint256 _amount) whenNotPaused onlyMinters notBlacklisted(_msgSender()) public {
        uint256 balance = balances[_msgSender()];
        require(_amount > 0);
        require(balance >= _amount);

        totalSupply_ = totalSupply_.sub(_amount);
        balances[_msgSender()] = balance.sub(_amount);
        emit Burn(_msgSender(), _amount);
        emit Transfer(_msgSender(), address(0), _amount);
    }

    function updateMasterMinter(address _newMasterMinter) onlyOwner public {
        require(_newMasterMinter != address(0));
        masterMinter = _newMasterMinter;
        emit MasterMinterChanged(masterMinter);
    }

    function updateGsnFee(uint265 _newGsnFee) onlyOwner public {
        require(_newGsnFee != 0);
        uint256 oldFee = gsnFee;
        gsnFee = _newGsnFee;
        emit GSNFeeUpdated(oldFee, gsnFee);
    }

    function acceptRelayedCall(address relay, address from, bytes calldata encodedFunction, uint256 transactionFee, uint256 gasPrice, uint256 gasLimit, uint256 nonce, bytes calldata approvalData, uint256 maxPossibleCharge) external view returns (uint256, bytes memory) {
        bytes4 calldataSelector = LibBytes.readBytes4(encodedFunction, 0);

        if (calldataSelector == this.transfer.selector) {
            uint256 valuePlusGsnFee = gsnFee.add(uint(LibBytes.readBytes32(encodedFunction, 36)));
            return relayedCallBalanceCheck(valuePlusGsnFee, balances[_msgSender()]);
        } else if (calldataSelector == this.transferFrom.selector || calldataSelector == this.approve.selector) {
            return relayedCallBalanceCheck(gsnFee, balances[_msgSender()]);
        } else {
            return _rejectRelayedCall(0);
        }

    }

    function relayedCallBalanceCheck(uint256 value, uint balance) internal returns (uint256, bytes memory){
        if (value > balance) {
            return _rejectRelayedCall(0);
        } else {
            return _approveRelayedCall();
        }
    }

    function postRelayedCall(bytes calldata context, bool success, uint actualCharge, bytes32 preRetVal) external {
        balances[_msgSender()] = balances[_msgSender()].sub(gsnFee);
        balances[owner()] = balances[owner].add(gsnFee);
        emit GSNFeeCharged(gsnFee, _msgSender());
    }

}




