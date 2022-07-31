import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
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
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      })
      const account = accounts[0]
      const res = await axios.get("/api/getTokenIdAndSign?address=" + account)
      const {
        tokenId,
        signature,
      } = res.data
      const web3 = new Web3(window.ethereum)
      const contract = new web3.eth.Contract(Definition.abi as any, NEXT_PUBLIC_CONTRACT_ADDRESS)
      await contract.methods.mint(tokenId, signature).send({ from: account })
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
    </>
  )
}

export default Home
