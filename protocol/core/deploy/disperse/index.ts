import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { Token__factory } from "../../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await hre.ethers.getSigners();
  const { deployments, getNamedAccounts } = hre;

  const { deployer } = await getNamedAccounts();

  const testToken = await deployments.deploy("Token", {
    from: deployer,
    log: true,
  });

  const disperse = await deployments.deploy("Disperse", {
    from: deployer,
    log: true,
    args: ["0x000000000022D473030F116dDEE9F6B43aC78BA3"],
  });

  const token = Token__factory.connect(testToken.address, signers[0]);

  await token.mint(
    "0xDe485812E28824e542B9c2270B6b8eD9232B7D0b",
    hre.ethers.utils.parseEther("1000")
  );
};

export default deploy;
