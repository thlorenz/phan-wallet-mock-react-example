// Adapted from: https://codesandbox.io/s/github/phantom-labs/sandbox?file=/src/App.tsx

import { Keypair } from '@solana/web3.js'
import { PhantomWalletMock } from 'phan-wallet-mock'
import { render } from 'react-dom'

import App from './App'

// TODO(thlorenz): Part of Cypress setup
const initFakeProvider = async () => {
  const payer = Keypair.generate()
  const LOCALNET = 'http://127.0.0.1:8899'
  const wallet = PhantomWalletMock.create(LOCALNET, payer, 'confirmed')
  const anyWindow: any = window
  anyWindow.solana = wallet
}

async function main() {
  await initFakeProvider()
  const rootElement = document.getElementById('root')
  render(<App />, rootElement)
}

main().catch((err) => console.error(err))
