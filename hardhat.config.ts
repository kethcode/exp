import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
    ],
  },
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_KEY_RINKEBY,
      accounts:
        process.env.PRIVATE_KEY_RINKEBY !== undefined
          ? [process.env.PRIVATE_KEY_RINKEBY]
          : [],
    },
    // kovan: {
    //   url: process.env.ALCHEMY_KEY_KOVAN,
    //   accounts:
    //     process.env.PRIVATE_KEY_KOVAN !== undefined
    //       ? [process.env.PRIVATE_KEY_KOVAN]
    //       : [],
    // },
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY_RINKEBY,
  },
};

export default config;
