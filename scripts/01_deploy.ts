import { ethers } from "hardhat";

const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const tokenName = 'EthernautDAO Experience';
const tokenSymbol = 'EXP';
const tokenDecimals = 18;

async function main() {

  let signers = await ethers.getSigners();

  const expFactory = await ethers.getContractFactory("exp");
  
  const exp = await expFactory.deploy(tokenName, tokenSymbol, tokenDecimals, signers[0].address);
  await exp.deployed();
  console.log("exp deployed to:       ", exp.address);

  let contractData = {
    expAddress: exp.address
  };

  fs.writeFileSync(path_contract_addresses, JSON.stringify(contractData), {
    flag: "w+",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
