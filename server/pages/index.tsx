import type { NextPage } from 'next'
import axios from 'axios'
import Definition from "../contract/SecureMintingNFT.json"
import Web3 from "web3"
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    ethereum?: any
  }
}

const Home: NextPage = () => {

  const [initializing, setInitializing] = useState(true)
  const [nftName, setNftName] = useState("")
  const [mintMessage, setMintMessage] = useState("")
  const [ownerAddress, setOwnerAddress] = useState("")
  const [addressToCheck, setAddressToCheck] = useState("")

  useEffect(() => {
    ;(async () => {
      const { NEXT_PUBLIC_CONTRACT_ADDRESS } = process.env
      if (window.ethereum && NEXT_PUBLIC_CONTRACT_ADDRESS) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        })
        const account = accounts[0]
        const web3 = new Web3(window.ethereum)
        const contract = new web3.eth.Contract(Definition.abi as any, NEXT_PUBLIC_CONTRACT_ADDRESS)
        const name = await contract.methods.name().call({ from: account })
        setNftName(name)
        setInitializing(false)
      }
    })()
  }, [])

  const mint = async () => {
    const { NEXT_PUBLIC_CONTRACT_ADDRESS } = process.env
    if (window.ethereum && NEXT_PUBLIC_CONTRACT_ADDRESS) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        })
        const account = accounts[0]
        const res = await axios.get("/api/getTokenIdAndSign?address=" + account)
        const {
          tokenId,
          decimalTokenId,
          signature,
        } = res.data
        const web3 = new Web3(window.ethereum)
        const contract = new web3.eth.Contract(Definition.abi as any, NEXT_PUBLIC_CONTRACT_ADDRESS)
        console.log(contract)
        await contract.methods.mint(tokenId, signature).send({ from: account })
        const tokenUri = await contract.methods.tokenURI(tokenId).call({ from: account })
        setMintMessage("Minted - token ID: " + tokenId + " / " + decimalTokenId + " / " + tokenUri)
      } catch (e) {
        console.error(e)
        setMintMessage("Mint failed")
      }
    }
  }

  const checkOwner = async () => {
    const { NEXT_PUBLIC_CONTRACT_ADDRESS } = process.env
    if (window.ethereum && NEXT_PUBLIC_CONTRACT_ADDRESS) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        })
        const account = accounts[0]
        const web3 = new Web3(window.ethereum)
        const contract = new web3.eth.Contract(Definition.abi as any, NEXT_PUBLIC_CONTRACT_ADDRESS)
        const address = await contract.methods.ownerOf(addressToCheck).call({ from: account })
        setOwnerAddress(address)
      } catch (e) {
        console.error(e)
        setMintMessage("Mint failed")
      }
    }
  }

  if (initializing) {
    return <div>initializing</div>
  }

  return (
    <>
      <div>
        NFT: {nftName}
      </div>
      <div>
        <button onClick={mint}>mint</button>
      </div>
      <div>{mintMessage}</div>
      <div><input value={addressToCheck} onChange={(e) => setAddressToCheck(e.target.value)}/></div>
      <div><button onClick={checkOwner}>owner check</button></div>
      <div>{ownerAddress}</div>
    </>
  )
}

export default Home
