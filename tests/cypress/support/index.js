// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './routes'

import { Keypair } from '@solana/web3.js'
import { PhantomWalletMock } from 'phan-wallet-mock'

const initFakeProvider = (win) => {
  const payer = Keypair.generate()
  const LOCALNET = 'http://127.0.0.1:8899'
  const wallet = PhantomWalletMock.create(LOCALNET, payer, 'confirmed')
  win.solana = wallet
}
Cypress.on('window:before:load', initFakeProvider)

before(() => {})

beforeEach(() => {
  // Cypress commands you would like to run before every single Cypress test.
})

