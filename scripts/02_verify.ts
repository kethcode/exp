import { ethers } from "hardhat";

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const tokenName = 'exp';
const tokenSymbol = 'EXP';
const tokenDecimals = 18;

async function main() {

  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const expFactory = await ethers.getContractFactory("exp");
  const exp = expFactory.attach(contractData["expAddress"]);

  await hre.run("verify:verify", {
    contract: "contracts/exp.sol:exp",
    address: exp.address,
    constructorArguments: [tokenName, tokenSymbol, tokenDecimals],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
