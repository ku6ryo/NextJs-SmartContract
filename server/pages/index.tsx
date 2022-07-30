import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { arrayify, computeAddress, hashMessage, recoverAddress, recoverPublicKey } from 'ethers/lib/utils'

declare global {
  interface Window {
    ethereum?: any
  }
}

const Home: NextPage = () => {

  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null)
  const [balance, setBalance] = useState("0")

  useEffect(() => {
    ;(async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner()
        setSigner(signer)
      }
    })()
  }, [])

  const updateBalance = async () => {
    if (signer) {
      const b = await signer.getBalance()
      setBalance(b.toString())
    }
  }

  const signMessage = async () => {
    if (signer) {
      const ethAddress = await signer.getAddress()
      const hash = await ethers.utils.keccak256(ethAddress)
      const sig = await signer.signMessage(ethers.utils.arrayify(hash))
      let pubKey = recoverPublicKey(arrayify(hashMessage(arrayify(hash))), sig);
      let address = computeAddress(pubKey)
      console.log(pubKey, address, ethAddress)
      console.log(await signer.getTransactionCount())
    }
  }
  return (
    <div className={styles.container}>
      <div>{balance}</div>
      <button onClick={updateBalance}>update balance</button>
      <button onClick={signMessage}>sign message</button>
    </div>
  )
}

export default Home
