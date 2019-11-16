pragma solidity ^0.5.0;

import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import "@0x/contracts-utils/contracts/src/LibBytes.sol";

library RelayedCallHelper {
    using SafeMath for uint256;

    uint256 constant private RELAYED_CALL_ACCEPTED = 0;
    uint256 constant private RELAYED_CALL_REJECTED = 11;


    /**
     * @dev Decides whether to accept or reject a relayed call depending on it's function seletor & the user's balance.
     * @param encodedRelayedFunction the calldata of the function that's being relayed.
     * @param permittedFunctionSelectors an array of the transfer, transferFrom & approve selectors (in that order).
     * @param msgSenderBalance the user/message sender's balance.
     * @param gsnFee how much the user will be charged in NGNT.
     */
    function acceptOrReject(
        bytes memory encodedRelayedFunction,
        bytes4[3] memory permittedFunctionSelectors,
        uint256 msgSenderBalance,
        uint256 gsnFee
    ) public pure returns (uint256, bytes memory) {
        bytes4 calldataSelector = LibBytes.readBytes4(encodedRelayedFunction, 0);

        if (calldataSelector == permittedFunctionSelectors[0]) {
            uint256 valuePlusGsnFee = gsnFee.add(uint(LibBytes.readBytes32(encodedRelayedFunction, 36)));
            if (valuePlusGsnFee > msgSenderBalance) {
                return _rejectRelayedCall();
            } else {
                return _approveRelayedCall();
            }
        } else if (calldataSelector == permittedFunctionSelectors[1] || calldataSelector == permittedFunctionSelectors[2]) {
            if (gsnFee > msgSenderBalance) {
                return _rejectRelayedCall();
            } else {
                return _approveRelayedCall();
            }
        } else {
            return _rejectRelayedCall();
        }
    }

    function _approveRelayedCall() internal pure returns (uint256, bytes memory) {
        return (RELAYED_CALL_ACCEPTED, "");
    }

    function _rejectRelayedCall() internal pure returns (uint256, bytes memory) {
        return (RELAYED_CALL_REJECTED + 0, "");
    }
}
