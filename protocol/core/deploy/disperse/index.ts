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
    "0x4643CCf56721Ea65B03F2bd899231C828A21d314",
    hre.ethers.utils.parseEther("1000")
  );

  //   const gmxPutPriceOracle = await deployments.deploy("GmxPutPriceOracleV2", {
  //     from: deployer,
  //     log: true,
  //   });

  //   const gmxPutWeeklySsov = SsovV3__factory.connect(
  //     "0xf071F0c56543A2671a2Dfc5FF51d5d858Be91514",
  //     signers[0]
  //   );

  //   await gmxPutWeeklySsov.setAddresses({
  //     ...(await gmxPutWeeklySsov.addresses()),
  //     priceOracle: gmxPutPriceOracle.address,
  //   });
};

export default deploy;
