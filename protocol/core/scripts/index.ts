import { ethers } from "hardhat";
import { Token__factory } from "../typechain-types";

async function main() {
  const signers = await ethers.getSigners();

  const token = Token__factory.connect(
    "0xda5bb55c0eA3f77321A888CA202cb84aE30C6AF5",
    signers[0]
  );

  const balance = await token.balanceOf(
    "0xde485812e28824e542b9c2270b6b8ed9232b7d0b"
  );

  console.log(balance.toString);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
