const SEND_TX = 'Send Transaction'
const SIGN_ALL_TXS_MULT = 'Sign All Transactions (multiple)'
const SIGN_ALL_TXS_SING = 'Sign All Transactions (single)'
const SIGN_MSG = 'Sign Message'
const DISCONNECT = 'Disconnect'
const IS_CONNECTED = 'isConnected: true'
const IS_NOT_CONNECTED = 'isConnected: false'
const CONNECTED_TO_WALLET = 'Connected to wallet'

let wallet
before(() => {
  cy.visit('/')
  // NOTE: the phan-wallet-mock is injected inside
  // tests/cypress/support/index.js and set to `window.solana`
  // Here we just wait until the app connected to the wallet
  cy.window()
    .then((win) => {
      wallet = win.solana
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
    cy.contains('button', SEND_TX).click()
  })
  it('Sends Transaction and logs confirmation', () => {
    cy.contains('.log', /Transaction \S+ confirmed/)
  })
})

describe('UI: Signing Message', () => {
  before(() => {
    cy.contains('button', SIGN_MSG).click()
  })
  it('Signs Message and logs confirmation', () => {
    cy.contains('.log', /Message signed .+len: 64/)
  })
})
