/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  solidity: "0.8.0",
  paths: {
    artifacts: './src/artifacts',
    cache: './src',
  },
};
