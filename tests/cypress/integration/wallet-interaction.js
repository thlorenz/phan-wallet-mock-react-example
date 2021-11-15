const SEND_TX = 'Send Transaction'
const SIGN_ALL_TXS_MULT = 'Sign All Transactions (multiple)'
const SIGN_ALL_TXS_SING = 'Sign All Transactions (single)'
const SIGN_MSG = 'Sign Message'
const DISCONNECT = 'Disconnect'
const IS_CONNECTED = 'isConnected: true'
const IS_NOT_CONNECTED = 'isConnected: false'
const CONNECTED_TO_WALLET = 'Connected to wallet'

// const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const publicKeyPat = '[1-9a-z]{44}'

import spok from 'spok'
const t = spok.adapters.chaiExpect(expect)

let wallet
let clearLog
before(() => {
  cy.visit('/')
  // NOTE: the phan-wallet-mock is injected inside
  // tests/cypress/support/index.js and set to `window.solana`
  // Here we just wait until the app connected to the wallet
  cy.window()
    .then((win) => {
      wallet = win.solana
      clearLog = () =>
        (win.document.getElementsByClassName('logs').item(0).innerHTML = '')
    })
    // Setup wallet owner with some cash
    .then(() => wallet.connect())
    .then(() => wallet.requestAirdrop(10))
    .then(() => cy.contains('div', IS_CONNECTED))
})

describe('Loads valid Page and Connects to Wallet', () => {
  it('Finds Phantom Sandbox Header', () => {
    cy.get('h1').contains('Phantom Sandbox')
    cy.contains('button', SEND_TX).should('exist')
    cy.contains('button', SIGN_ALL_TXS_MULT).should('exist')
    cy.contains('button', SIGN_ALL_TXS_SING).should('exist')
    cy.contains('button', SIGN_MSG).should('exist')
    cy.contains('button', DISCONNECT).should('exist')
    cy.contains('div', IS_CONNECTED).should('exist')
    cy.contains('.log', CONNECTED_TO_WALLET).should('exist')
    cy.contains('div', `Wallet address: ${wallet.publicKey}`)
  })
})

describe('Sending transaction', () => {
  before(() => {
    clearLog()
    cy.contains('button', SEND_TX).click()
  })
  it('Sends Transaction and logs confirmation', () => {
    cy.contains('.log', /Transaction \S+ confirmed/)
  })
  it('adds transaction to the ledger', async () => {
    const { meta } = await wallet.getLastConfirmedTransaction()
    spok(t, meta, {
      $topic: 'transaction.meta',
      err: null,
      fee: 5000,
      status: {
        Ok: null,
      },
    })
  })
})
describe('Sign all Transactions (single)', () => {
  before(() => {
    clearLog()
    cy.contains('button', SIGN_ALL_TXS_SING).click()
  })
  it('Signs single transaction and logs confirmation', () => {
    cy.contains(
      '.log',
      new RegExp(`^Signed Transactions Keys: \\[ ${publicKeyPat} ]`, 'i')
    )
  })
})

describe('Sign all Transactions (multiple)', () => {
  before(() => {
    clearLog()
    cy.contains('button', SIGN_ALL_TXS_MULT).click()
  })
  it('Signs single transaction and logs confirmation', () => {
    cy.contains(
      '.log',
      new RegExp(
        `^Signed Transactions Keys: \\[ ${publicKeyPat},${publicKeyPat} ]`,
        'i'
      )
    )
  })
})
describe('UI: Signing Message', () => {
  before(() => {
    clearLog()
    cy.contains('button', SIGN_MSG).click()
  })
  it('Signs Message and logs confirmation', () => {
    cy.contains('.log', /Message signed .+len: 64/)
  })
})
