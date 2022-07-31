import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { arrayify, id, solidityKeccak256 } from "ethers/lib/utils";

describe("SecureMintingNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLockFixture() {
    const contract = await ethers.getContractFactory("SecureMintingNFT");
    const deployed = await contract.deploy();
    return { deployed };
  }

  describe("Deployment", function () {
    it("Should set contract name properly", async function () {
      const { deployed } = await loadFixture(deployOneYearLockFixture);
      const name = await deployed.name();
      expect(name).to.equal("Secure Minting NFT");
    });
  });

  describe("Mint", function () {
    it("Should success to mint", async function () {
      const { deployed } = await loadFixture(deployOneYearLockFixture);
      const tokenId = id("bff9ec22-5612-437d-8045-110fb8d423aa");
      const [, signer, minter] = await ethers.getSigners();

      await deployed.setMintSigner(await signer.getAddress())

      const minterAddr = await minter.getAddress();
      const minterContract = deployed.connect(minter);

      const signature = await signer.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, minterAddr])));
      await minterContract.mint(tokenId, signature);
      const owner = await minterContract.ownerOf(tokenId);
      expect(owner).to.equal(minterAddr);
    });

    it("Should fail to mint with invalid signature - invalid signer", async function () {
      const { deployed } = await loadFixture(deployOneYearLockFixture);
      const tokenId = id("bff9ec22-5612-437d-8045-110fb8d423aa");
      const [, signer, minter, invalidSinger] = await ethers.getSigners();

      await deployed.setMintSigner(await signer.getAddress())

      const minterAddr = await minter.getAddress();
      const minterContract = deployed.connect(minter);

      const signature = await invalidSinger.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, minterAddr])));
      await expect(
        minterContract.mint(tokenId, signature)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should fail to mint with invalid signature - invalid minter", async function () {
      const { deployed } = await loadFixture(deployOneYearLockFixture);
      const tokenId = id("bff9ec22-5612-437d-8045-110fb8d423aa");
      const [, signer, minter, invalidMinter] = await ethers.getSigners();

      await deployed.setMintSigner(await signer.getAddress())

      const minterAddr = await minter.getAddress();

      const signature = await signer.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, minterAddr])));

      const invalidMinterContract = deployed.connect(invalidMinter);
      await expect(
        invalidMinterContract.mint(tokenId, signature)
      ).to.be.revertedWith("Invalid signature");
    });
  });
});
