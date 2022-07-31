NFT with secure minting feature. This repository includes example code of a smart contract and client (FE / BE) code. This is usefull for case that NFTs are related to an existing service and token ID must be issued by the service.

# Spec
To mint a NFT, the minter should get signature generated with a token ID and minter address.

E2E behavior
1. FE sends a token issue request to BE
2. BE issues a token ID and sign with minter address. Sends it with a signature.
3. FE make a transaction for smart contract with the token ID and the signature.
4. Smart contract checks the token ID and the signature. If they passed the check, Smart contract mints a NFT.

# Development
Directory `hardhat` is for smart contract. `server` is for Next.js server.

## Prerequisite
Install metamask and setup local network.
```
RPC: http:127.0.0.1:8545
chainId: 1337
```

## Smart Contract
In `hardhat` directory,

Install dependency
```
yarn
````

Start Ethereum node
```
npx hardhat node
```

Run tests by
```
npx hardhat test
```

Compile the smart contract by
```
npx hardhat test
```

Deploy by
```
npx hardhat run scripts/deploy.ts --network localhost
```

When compiled, the interface definiton including abi are made in `artifacts/contracts` directory. e.g. `artifacts/contracts/SecureMintingNFT.sol/SecureMintingNFT.json`

## Next.js server
To start the server, set up environment variables in .env.local file. After that, execute the following command to run the server.
```
yarn
yarn dev
```

# Signing a pair of a token ID and a minter address

Following is how to sign.
```javascript
const signature = await signer.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, address])))
```

Following is how to recover the singer address.
```solidity
function _recoverMintSinger(uint256 _tokenId, bytes memory _signature) internal view returns (address) {
  return keccak256(abi.encodePacked(
    abi.encodePacked(_tokenId),
    msg.sender
  )).toEthSignedMessageHash().recover(_signature);
}
```

## Tips

JavaScript code with ethers
```javascript
solidityKeccak256([...], [...])
```
and Solidity code
```
keccak256(abi.encodePacked(...)).toEthSignedMessageHash();
```
are equivalent.