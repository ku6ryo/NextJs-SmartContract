// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * NFT contract example for secure minting.
 * This contract validates transaction with a signature of a pair of a token ID and minter address
 * signed by the regstered signer.
 */
contract SecureMintingNFT is ERC721, Ownable, Pausable {

  using ECDSA for bytes32;

  /**
   * Signer who can issue valid signatures.
   */
  address public mintSigner;
  /**
   * Base token URI
   */
  string public baseTokenURI;

  event SetBaseTokenURI(string baseTokenURI);

  constructor() ERC721("Secure Minting NFT", "SMNFT") {}

  function setMintSigner(address _signer) external onlyOwner {
    mintSigner = _signer;
  }

  /**
   * @notice Set baseTokenURI for this contract
   * @param _baseTokenURI URI to be set
   */
  function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
    baseTokenURI = _baseTokenURI;
    emit SetBaseTokenURI(_baseTokenURI);
  }

  /**
   * @notice See {ERC721-_baseURI}
   * @dev Override to return baseURI set by the owner
   * @return string memory
   */
  function _baseURI() internal view override returns (string memory) {
    return baseTokenURI;
  }

  /**
   * @notice Checkes if the NFT with the given tokenId exists.
   * @param _tokenId ID of the target token.
   */
  function exists(uint256 _tokenId) public view returns (bool) {
    return _exists(_tokenId);
  }

  /**
   * @notice Mints a NFT with the ID of the token.
   * @param _tokenId ID of the token.
   * @param _signature Signature of the token ID and the minter address signed by the valid signer.
   */
  function mint(uint256 _tokenId, bytes memory _signature) public payable whenNotPaused {
    require(!exists(_tokenId), "Token exists");
    require(_isValidMintSignature(_tokenId, _signature), "Invalid signature");
    _safeMint(_msgSender(), _tokenId);
  }


  /**
   * @notice Recovers and returns the address of the signer who signed the set of the token ID and the message sender.
   *  The following code is for the case that the signer signs the token ID only.
   *    keccak256(abi.encodePacked(_tokenId)).toEthSignedMessageHash().recover(_signature);
   *  Here the security is stronger because the minter address is included in the signed message.
   */
  function _recoverMintSinger(uint256 _tokenId, bytes memory _signature) internal view returns (address) {
    return keccak256(abi.encodePacked(
      abi.encodePacked(_tokenId),
      msg.sender
    )).toEthSignedMessageHash().recover(_signature);
  }

  /**
   * @notice Returns if the signature is signed with the valid address.
   */
  function _isValidMintSignature(uint256 _tokenId, bytes memory _signature) internal view returns (bool) {
    return _recoverMintSinger(_tokenId, _signature) == mintSigner;
  }
}