pragma solidity ^0.5.0;


contract Ownable {

    // Owner of the contract
    address private _owner;

    /**
    * @dev Event to show ownership has been transferred
    * @param previousOwner representing the address of the previous owner
    * @param newOwner representing the address of the new owner
    */
    event OwnershipTransferred(address previousOwner, address newOwner);

    /**
    * @dev The constructor sets the original owner of the contract to the sender account.
    */
    constructor() public {
        setOwner(_msgSender());
    }

    /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Sets a new owner address
     */
    function setOwner(address newOwner) internal {
        _owner = newOwner;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(_msgSender() == owner());
        _;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner(), newOwner);
        setOwner(newOwner);
    }
}
