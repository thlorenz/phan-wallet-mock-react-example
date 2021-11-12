import { useState, useEffect } from 'react'
import {
  Transaction,
  SystemProgram,
  Connection,
  Commitment,
} from '@solana/web3.js'
import './styles.css'

const getProvider = (): any | undefined => {
  if ('solana' in window) {
    const anyWindow: any = window
    const provider = anyWindow.solana
    if (provider.isPhantom) {
      return provider
    }
  }
  window.open('https://phantom.app/', '_blank')
}

type Props = {
  connectionURL: string
} & {
  commitment: Commitment | undefined
}

export default function App({ connectionURL, commitment }: Props) {
  const provider = getProvider()
  const [logs, setLogs] = useState<string[]>([])
  const addLog = (log: string) => setLogs([...logs, log])
  const connection: Connection = new Connection(connectionURL, commitment)
  const [, setConnected] = useState<boolean>(false)
  useEffect(() => {
    if (provider) {
      provider.on('connect', async () => {
        setConnected(true)
        addLog('Connected to wallet ' + provider.publicKey?.toBase58())
      })
      provider.on('disconnect', () => {
        setConnected(false)
        addLog('Disconnected from wallet')
      })
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true }).catch(() => {
        // fail silently
      })
      return () => {
        provider.disconnect()
      }
    }
  }, [provider])
  if (!provider) {
    return <h2>Could not find a provider</h2>
  }

  const createTransferTransaction = async () => {
    if (!provider.publicKey) {
      return
    }
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: provider.publicKey,
        lamports: 100,
      })
    )
    transaction.feePayer = provider.publicKey
    addLog('Getting recent blockhash')
    const anyTransaction: any = transaction
    anyTransaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash
    return transaction
  }

  const sendTransaction = async () => {
    const transaction = await createTransferTransaction()
    if (transaction) {
      try {
        let signed = await provider.signTransaction(transaction)
        addLog('Got signature, submitting transaction')
        let signature = await connection.sendRawTransaction(signed.serialize())
        addLog('Submitted transaction ' + signature + ', awaiting confirmation')
        await connection.confirmTransaction(signature)
        addLog('Transaction ' + signature + ' confirmed')
      } catch (err) {
        const anyerr: any = err
        addLog(`Error: ${anyerr.message}`)
        console.warn(err)
      }
    }
  }
  const signMultipleTransactions = async (onlyFirst: boolean = false) => {
    const [transaction1, transaction2] = await Promise.all([
      createTransferTransaction(),
      createTransferTransaction(),
    ])
    if (transaction1 && transaction2) {
      let signature
      try {
        if (onlyFirst) {
          signature = await provider.signAllTransactions([transaction1])
        } else {
          signature = await provider.signAllTransactions([
            transaction1,
            transaction2,
          ])
        }
      } catch (err) {
        addLog('Error: ' + JSON.stringify(err))
      }
      addLog('Signature ' + signature)
    }
  }
  const signMessage = async (message: string) => {
    const data = new TextEncoder().encode(message)
    try {
      const sig = await provider.signMessage(data)
      console.log(sig)
      addLog(
        `Message signed (signature len: ${
          sig.signature.length
        }), publicKey ${sig.publicKey.toBase58()}`
      )
    } catch (err) {
      console.error(err)
      const anyerr: any = err
      addLog(`Error: ${anyerr.message}`)
    }
  }
  return (
    <div className="App">
      <h1>Phantom Sandbox</h1>
      <main>
        {provider && provider.publicKey ? (
          <>
            <div>Wallet address: {provider.publicKey?.toBase58()}.</div>
            <div>isConnected: {provider.isConnected ? 'true' : 'false'}.</div>
            <button onClick={sendTransaction}>Send Transaction</button>
            <button onClick={() => signMultipleTransactions(false)}>
              Sign All Transactions (multiple){' '}
            </button>
            <button onClick={() => signMultipleTransactions(true)}>
              Sign All Transactions (single){' '}
            </button>
            <button
              onClick={() =>
                signMessage(
                  'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.'
                )
              }
            >
              Sign Message
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await provider.disconnect()
                  addLog(JSON.stringify(res))
                } catch (err) {
                  console.warn(err)
                  addLog('Error: ' + JSON.stringify(err))
                }
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <button
              onClick={async () => {
                try {
                  const res = await provider.connect()
                  addLog(JSON.stringify(res))
                } catch (err) {
                  console.warn(err)
                  addLog('Error: ' + JSON.stringify(err))
                }
              }}
            >
              Connect to Phantom
            </button>
          </>
        )}
        <hr />
        <div className="logs">
          {logs.map((log, i) => (
            <div className="log" key={i}>
              {log}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
