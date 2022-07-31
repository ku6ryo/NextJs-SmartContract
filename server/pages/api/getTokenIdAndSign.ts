import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from "uuid"
import { Wallet } from "ethers"
import { arrayify, id, isAddress, solidityKeccak256 } from 'ethers/lib/utils'

type ResponseData = {
  tokenId: string,
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
  const validator = new Wallet(SIGNER_PRIVATE_KEY)
  const signature = await validator.signMessage(arrayify(solidityKeccak256(["uint256", "address"], [tokenId, address])))
  res.status(200).json({ tokenId, signature })
}
