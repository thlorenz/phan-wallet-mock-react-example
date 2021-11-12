// Adapted from: https://codesandbox.io/s/github/phantom-labs/sandbox?file=/src/App.tsx

import { render } from 'react-dom'
import {
  initWalletMockProvider,
  LOCALNET,
  PhantomWalletMock,
} from 'phan-wallet-mock'

import App from './App'

const rootElement = document.getElementById('root')

// @ts-ignore used sometimes
async function prepareWallet() {
  // Setup and disconnect wallet to make sure the app does all of it
  const { wallet } = initWalletMockProvider(window)
  await wallet.connect()
  await wallet.requestAirdrop(10)
  await wallet.disconnect()
}

async function main() {
  const anyWindow: any = window
  const provider = anyWindow.solana
  const wallet: PhantomWalletMock = provider ?? {
    connectionURL: LOCALNET,
    commitment: 'confirmed',
  }

  render(
    <App connectionURL={wallet.connectionURL} commitment={wallet.commitment} />,
    rootElement
  )
}

main().catch(console.error)
