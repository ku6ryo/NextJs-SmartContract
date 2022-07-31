import { ethers } from "hardhat";

async function main() {
  // Using Hardhat network Account #0 to deploy
  const contract = await ethers.getContractFactory("SecureMintingNFT");
  const deployed = await contract.deploy();
  await deployed.deployed();
  await deployed.setMintSigner("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
  console.log("DEPLOYED CONTRACT ADDRESS: ", deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
