// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IAllowanceTransfer} from "./interfaces/IAllowanceTransfer.sol";
import {ISignatureTransfer} from "./interfaces/ISignatureTransfer.sol";

/// @title Disperse
/// @author witherblock
/// @notice Allows users to send ERC20 or native chain tokens to multiple addresses in one tx
contract Disperse {
    using SafeERC20 for IERC20;

    /// @dev PERMIT2 Contract
    address public immutable PERMIT2;

    /// @dev Constructor
    /// @param permit2 address of the permit2 contract
    constructor(address permit2) {
        PERMIT2 = permit2;
    }

    /// @notice Disperses native token of the chain to multiple users in one tx
    /// @param recipients array of recipients
    /// @param values array of values
    function disperseNative(
        address[] memory recipients,
        uint256[] memory values
    ) external payable {
        uint256 recipientsLength = recipients.length;
        for (uint256 i; i < recipientsLength; ) {
            payable(recipients[i]).transfer(values[i]);
            unchecked {
                ++i;
            }
        }
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(msg.sender).transfer(balance);
        }
    }

    /// @notice Disperses ERC20 token to multiple users in one tx
    /// requires allowance to this contract
    /// @param recipients array of recipients
    /// @param values array of values
    function disperseSingle(
        address token,
        address[] memory recipients,
        uint256[] memory values
    ) external {
        uint256 total = 0;
        uint256 recipientsLength = recipients.length;

        for (uint256 i; i < recipientsLength; ) {
            total += values[i];
            unchecked {
                ++i;
            }
        }
        IERC20(token).safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i; i < recipientsLength; ) {
            IERC20(token).safeTransfer(recipients[i], values[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Disperses ERC20 token to multiple users in one tx via permit2
    /// requires allowance to permit2
    /// @param recipients array of recipients
    /// @param values array of values
    /// @param _permit The PermitSingle struct
    /// @param _signature Signature of the sender
    function disperseSingleWithPermit2(
        address token,
        address[] memory recipients,
        uint256[] memory values,
        IAllowanceTransfer.PermitSingle calldata _permit,
        bytes calldata _signature
    ) external {
        uint160 total = 0;
        uint256 recipientsLength = recipients.length;

        for (uint256 i; i < recipientsLength; ) {
            total += uint160(values[i]);
            unchecked {
                ++i;
            }
        }

        IAllowanceTransfer(PERMIT2).permit(msg.sender, _permit, _signature);

        IAllowanceTransfer(PERMIT2).transferFrom(
            msg.sender,
            address(this),
            total,
            token
        );

        for (uint256 i; i < recipientsLength; ) {
            IERC20(token).safeTransfer(recipients[i], values[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Disperses ERC20 token to multiple users in one tx via permit2
    function disperseBatchWithPermit2(
        ISignatureTransfer.SignatureTransferDetails[] memory _transferDetails,
        ISignatureTransfer.PermitBatchTransferFrom calldata _permit,
        bytes calldata _signature
    ) external {
        ISignatureTransfer(PERMIT2).permitTransferFrom(
            _permit,
            _transferDetails,
            msg.sender,
            _signature
        );
    }

    /// @notice Disperses multiple ERC20 tokens to multiple users in one tx via permit2
    /// requires allowance to permit2
    /// @param recipients 2d array of recipients for each token
    /// @param values 2d array of values for each token
    /// @param _permit The PermitBatch struct
    /// @param _signature Signature of the sender
    function disperseBatchWithPermit2(
        address[] memory tokens,
        address[][] memory recipients,
        uint256[][] memory values,
        IAllowanceTransfer.PermitBatch calldata _permit,
        bytes calldata _signature
    ) external {
        uint256 tokensLength = tokens.length;

        uint160[] memory totals = new uint160[](tokensLength);

        for (uint256 i; i < tokensLength; ) {
            uint256 recipientsLength = recipients[i].length;

            for (uint256 j; j < recipientsLength; ) {
                totals[i] += uint160(values[i][j]);
                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }

        IAllowanceTransfer(PERMIT2).permit(msg.sender, _permit, _signature);

        for (uint256 i; i < tokensLength; ) {
            uint256 recipientsLength = recipients[i].length;

            IAllowanceTransfer(PERMIT2).transferFrom(
                msg.sender,
                address(this),
                totals[i],
                tokens[i]
            );

            for (uint256 j; j < recipientsLength; ) {
                IERC20(tokens[i]).safeTransfer(recipients[i][j], values[i][j]);
                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }
    }
}
