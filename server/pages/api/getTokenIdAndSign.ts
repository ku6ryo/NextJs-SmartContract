import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from "uuid"
import { Wallet } from "ethers"
import { arrayify, id, isAddress, solidityKeccak256, } from 'ethers/lib/utils'
import BN from "bn.js"

type ResponseData = {
  tokenId: string,
  decimalTokenId: string,
  signature: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const {
    SIGNER_PRIVATE_KEY
  } = process.env
  const {
    address
  } = req.query
  if (!SIGNER_PRIVATE_KEY) {
    res.status(400)
    res.write("validator private key is not set.")
    return
  }
  if (!address || Array.isArray(address) || !isAddress(address)) {
    res.status(400)
    res.write("Address is not set or invalid address")
  }

  const tokenId = id(uuid())
  const decimalTokenId = new BN(tokenId.replace(/^0x/, ""), 16).toString()
  const signer = new Wallet(SIGNER_PRIVATE_KEY)
  const signature = await signer.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, address])))
  res.status(200).json({ tokenId, signature, decimalTokenId })
}
