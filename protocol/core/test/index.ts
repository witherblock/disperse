import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  MaxUint256,
  PermitBatchTransferFrom,
  SignatureTransfer,
} from "@uniswap/permit2-sdk";

const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";

describe("Disperse", function () {
  async function deployOneYearLockFixture() {
    const [owner, cathy, john, joe] = await ethers.getSigners();

    const Disperse = await ethers.getContractFactory("Disperse");
    const disperse = await Disperse.deploy(PERMIT2_ADDRESS);

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    const token2 = await Token.deploy();
    const token3 = await Token.deploy();

    return {
      owner,
      cathy,
      john,
      joe,
      disperse,
      token,
      token2,
      token3,
    };
  }

  describe("disperseBatch (with signature transfer)", function () {
    it("Single Token", async function () {
      const { disperse, owner, token, cathy, john, joe } = await loadFixture(
        deployOneYearLockFixture
      );

      await token.mint(owner.address, ethers.utils.parseEther("100"));

      await token.approve(PERMIT2_ADDRESS, MaxUint256);

      const permit: PermitBatchTransferFrom = {
        permitted: [
          { token: token.address, amount: ethers.utils.parseEther("10") },
          { token: token.address, amount: ethers.utils.parseEther("11") },
          { token: token.address, amount: ethers.utils.parseEther("12") },
        ],
        spender: disperse.address,
        nonce: 1,
        deadline: MaxUint256,
      };

      const { domain, types, values } = SignatureTransfer.getPermitData(
        permit,
        PERMIT2_ADDRESS,
        42161
      );
      let signature = await owner._signTypedData(domain, types, values);

      const transferDetails = [
        {
          to: cathy.address,
          requestedAmount: ethers.utils.parseEther("10"),
        },
        {
          to: john.address,
          requestedAmount: ethers.utils.parseEther("11"),
        },
        {
          to: joe.address,
          requestedAmount: ethers.utils.parseEther("12"),
        },
      ];

      await disperse
        .connect(owner)
        [
          "disperseBatchWithPermit2((address,uint256)[],((address,uint256)[],uint256,uint256),bytes)"
        ](transferDetails, permit, signature);

      const cathyBalance = await token.balanceOf(cathy.address);
      const johnBalance = await token.balanceOf(john.address);
      const joeBalance = await token.balanceOf(joe.address);

      expect(cathyBalance).to.be.equal(ethers.utils.parseEther("10"));
      expect(johnBalance).to.be.equal(ethers.utils.parseEther("11"));
      expect(joeBalance).to.be.equal(ethers.utils.parseEther("12"));
    });

    it("Multiple Tokens", async function () {
      const { disperse, owner, token, token2, token3, cathy, john, joe } =
        await loadFixture(deployOneYearLockFixture);

      await token.mint(owner.address, ethers.utils.parseEther("100"));
      await token.approve(PERMIT2_ADDRESS, MaxUint256);

      await token2.mint(owner.address, ethers.utils.parseEther("100"));
      await token2.approve(PERMIT2_ADDRESS, MaxUint256);

      await token3.mint(owner.address, ethers.utils.parseEther("100"));
      await token3.approve(PERMIT2_ADDRESS, MaxUint256);

      const permit: PermitBatchTransferFrom = {
        permitted: [
          { token: token.address, amount: ethers.utils.parseEther("10") },
          { token: token2.address, amount: ethers.utils.parseEther("10") },
          { token: token3.address, amount: ethers.utils.parseEther("10") },
        ],
        spender: disperse.address,
        nonce: 1,
        deadline: MaxUint256,
      };

      const { domain, types, values } = SignatureTransfer.getPermitData(
        permit,
        PERMIT2_ADDRESS,
        42161
      );
      let signature = await owner._signTypedData(domain, types, values);

      const transferDetails = [
        {
          to: cathy.address,
          requestedAmount: ethers.utils.parseEther("10"),
        },
        {
          to: john.address,
          requestedAmount: ethers.utils.parseEther("10"),
        },
        {
          to: joe.address,
          requestedAmount: ethers.utils.parseEther("10"),
        },
      ];

      await disperse
        .connect(owner)
        [
          "disperseBatchWithPermit2((address,uint256)[],((address,uint256)[],uint256,uint256),bytes)"
        ](transferDetails, permit, signature);

      const cathyBalance = await token.balanceOf(cathy.address);
      const johnBalance = await token2.balanceOf(john.address);
      const joeBalance = await token3.balanceOf(joe.address);

      expect(cathyBalance).to.be.equal(ethers.utils.parseEther("10"));
      expect(johnBalance).to.be.equal(ethers.utils.parseEther("10"));
      expect(joeBalance).to.be.equal(ethers.utils.parseEther("10"));
    });
  });
});
