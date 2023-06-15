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
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/HEFzTlxm4zKrEgDAhTte61ZpqhcRGPEO",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    hardhat: {
      forking: {
        url: "https://arb-mainnet.g.alchemy.com/v2/MAMAPFQJjmCYzKSeCsBBSc4Ptblu9GYL",
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
