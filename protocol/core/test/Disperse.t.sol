// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {DeployPermit2} from "permit2/test/utils/DeployPermit2.sol";
import {Disperse} from "../contracts/Disperse.sol";
import {Token} from "../contracts/mock/Token.sol";
import {IAllowanceTransfer} from "../contracts/interfaces/IAllowanceTransfer.sol";
import {ISignatureTransfer} from "../contracts/interfaces/ISignatureTransfer.sol";
import {PermitSignature} from "./utils/PermitSignature.sol";
import "forge-std/Test.sol";

interface IEIP712 {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

contract DisperseTest is DeployPermit2, Test, PermitSignature {
    address permit2;
    Disperse disperse;
    Token token;
    Token token2;

    function setUp() public {
        permit2 = deployPermit2();

        disperse = new Disperse(permit2);

        token = new Token();

        token2 = new Token();
    }

    function test_basic_disperseNative() public {
        address alice = makeAddr("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        payable(alice).transfer(100 ether);

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseNative{value: 18 ether}(recipients, amounts);

        assertEq(cathy.balance, 10 ether);
        assertEq(joe.balance, 5 ether);
        assertEq(john.balance, 3 ether);
    }

    function testFail_insufficientBalance_disperseNative() public {
        address alice = makeAddr("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseNative{value: 18 ether}(recipients, amounts);
    }

    function testFail_invalidValue_disperseNative() public {
        address alice = makeAddr("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        payable(alice).transfer(100 ether);

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseNative{value: 15 ether}(recipients, amounts);
    }

    function test_returnExtra_disperseNative() public {
        address alice = makeAddr("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        payable(alice).transfer(100 ether);

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseNative{value: 22 ether}(recipients, amounts);

        assertEq(alice.balance, 82 ether);
    }

    function test_basic_disperseToken() public {
        address alice = makeAddr("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        token.mint(alice, 100 ether);

        vm.prank(alice);

        token.approve(address(disperse), 18 ether);

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseSingle(address(token), recipients, amounts);

        assertEq(token.balanceOf(cathy), 10 ether);
        assertEq(token.balanceOf(joe), 5 ether);
        assertEq(token.balanceOf(john), 3 ether);
    }

    function test_basic_disperseTokenWithPermit2() public {
        (address alice, uint256 aliceKey) = makeAddrAndKey("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        token.mint(alice, 100 ether);

        vm.prank(alice);

        token.approve(permit2, type(uint256).max);

        IAllowanceTransfer.PermitDetails
            memory _permitDetails = IAllowanceTransfer.PermitDetails({
                token: address(token),
                amount: 18 ether,
                expiration: type(uint48).max,
                nonce: 0
            });

        IAllowanceTransfer.PermitSingle memory _permit = IAllowanceTransfer
            .PermitSingle({
                details: _permitDetails,
                spender: address(disperse),
                sigDeadline: type(uint256).max
            });

        bytes memory signature = getPermitSignature(
            _permit,
            aliceKey,
            IEIP712(permit2).DOMAIN_SEPARATOR()
        );

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseSingleWithPermit2(
            address(token),
            recipients,
            amounts,
            _permit,
            signature
        );

        assertEq(token.balanceOf(cathy), 10 ether);
        assertEq(token.balanceOf(joe), 5 ether);
        assertEq(token.balanceOf(john), 3 ether);
    }

    function testFail_insuffcientAllowance_disperseTokenWithPermit2() public {
        (address alice, uint256 aliceKey) = makeAddrAndKey("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        token.mint(alice, 100 ether);

        vm.prank(alice);

        token.approve(permit2, type(uint256).max);

        IAllowanceTransfer.PermitDetails
            memory _permitDetails = IAllowanceTransfer.PermitDetails({
                token: address(token),
                amount: 13 ether,
                expiration: type(uint48).max,
                nonce: 0
            });

        IAllowanceTransfer.PermitSingle memory _permit = IAllowanceTransfer
            .PermitSingle({
                details: _permitDetails,
                spender: address(disperse),
                sigDeadline: type(uint256).max
            });

        bytes memory signature = getPermitSignature(
            _permit,
            aliceKey,
            IEIP712(permit2).DOMAIN_SEPARATOR()
        );

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.prank(alice);

        disperse.disperseSingleWithPermit2(
            address(token),
            recipients,
            amounts,
            _permit,
            signature
        );
    }

    function testFail_pastExpiration_disperseTokenWithPermit2() public {
        (address alice, uint256 aliceKey) = makeAddrAndKey("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");

        token.mint(alice, 100 ether);

        vm.prank(alice);

        token.approve(permit2, type(uint256).max);

        IAllowanceTransfer.PermitDetails
            memory _permitDetails = IAllowanceTransfer.PermitDetails({
                token: address(token),
                amount: 18 ether,
                expiration: uint48(block.timestamp + 100),
                nonce: 0
            });

        IAllowanceTransfer.PermitSingle memory _permit = IAllowanceTransfer
            .PermitSingle({
                details: _permitDetails,
                spender: address(disperse),
                sigDeadline: type(uint256).max
            });

        bytes memory signature = getPermitSignature(
            _permit,
            aliceKey,
            IEIP712(permit2).DOMAIN_SEPARATOR()
        );

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        recipients[0] = cathy;
        amounts[0] = 10 ether;

        recipients[1] = joe;
        amounts[1] = 5 ether;

        recipients[2] = john;
        amounts[2] = 3 ether;

        vm.warp(block.timestamp + 101);

        vm.prank(alice);

        disperse.disperseSingleWithPermit2(
            address(token),
            recipients,
            amounts,
            _permit,
            signature
        );
    }

    function test_disperseMultipleWithPermit2() public {
        (address alice, uint256 aliceKey) = makeAddrAndKey("alice");
        address cathy = makeAddr("cathy");
        address joe = makeAddr("joe");
        address john = makeAddr("john");
        address doe = makeAddr("doe");

        token.mint(alice, 100 ether);
        token2.mint(alice, 100 ether);

        vm.prank(alice);
        token.approve(permit2, type(uint256).max);

        vm.prank(alice);
        token2.approve(permit2, type(uint256).max);

        IAllowanceTransfer.PermitDetails[]
            memory _permitDetails = new IAllowanceTransfer.PermitDetails[](2);

        _permitDetails[0] = IAllowanceTransfer.PermitDetails({
            token: address(token),
            amount: 10 ether,
            expiration: type(uint48).max,
            nonce: 0
        });

        _permitDetails[1] = IAllowanceTransfer.PermitDetails({
            token: address(token2),
            amount: 10 ether,
            expiration: type(uint48).max,
            nonce: 0
        });

        IAllowanceTransfer.PermitBatch memory _permit = IAllowanceTransfer
            .PermitBatch({
                details: _permitDetails,
                spender: address(disperse),
                sigDeadline: type(uint256).max
            });

        bytes memory signature = getPermitBatchSignature(
            _permit,
            aliceKey,
            IEIP712(permit2).DOMAIN_SEPARATOR()
        );

        address[] memory tokens = new address[](2);

        tokens[0] = address(token);
        tokens[1] = address(token2);

        address[][] memory recipients = new address[][](2);
        recipients[0] = new address[](2);
        recipients[1] = new address[](2);
        uint256[][] memory amounts = new uint256[][](2);
        amounts[0] = new uint256[](2);
        amounts[1] = new uint256[](2);

        recipients[0][0] = cathy;
        amounts[0][0] = 5 ether;

        recipients[0][1] = joe;
        amounts[0][1] = 5 ether;

        recipients[1][0] = john;
        amounts[1][0] = 5 ether;

        recipients[1][1] = doe;
        amounts[1][1] = 5 ether;

        vm.prank(alice);
        disperse.disperseBatchWithPermit2(
            tokens,
            recipients,
            amounts,
            _permit,
            signature
        );

        assertEq(token.balanceOf(cathy), 5 ether);
        assertEq(token.balanceOf(joe), 5 ether);
        assertEq(token2.balanceOf(john), 5 ether);
        assertEq(token2.balanceOf(john), 5 ether);
    }
}
