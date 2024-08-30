import dotenv from "dotenv";

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import "hardhat-deploy";

dotenv.config();

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ARBITRUM_RPC_URL,
        blockNumber: 87830000,
      },
      chainId: Number(process.env.CHAIN_ID),
    },
  },
  namedAccounts: {
    deployer: 0,
  },
};

export default config;
