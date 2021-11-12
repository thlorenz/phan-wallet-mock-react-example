// Adapted from: https://codesandbox.io/s/github/phantom-labs/sandbox?file=/src/App.tsx

import { render } from 'react-dom'
import { initWalletMockProvider } from 'phan-wallet-mock'

import App from './App'

const { wallet } = initWalletMockProvider(window)

const rootElement = document.getElementById('root')
async function main() {
  // Setup and disconnect wallet to make sure the app does all of it
  await wallet.connect()
  await wallet.requestAirdrop(10)
  await wallet.disconnect()

  render(
    <App
      connectionURL={wallet.connectionURL}
      wallet={wallet}
      commitment={wallet.commitment}
    />,
    rootElement
  )
}

main().catch(console.error)
