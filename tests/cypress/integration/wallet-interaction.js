describe('Sample Tests', () => {
  it('loads the homepage', () => {
    cy.visit('/')
    cy.get('h1').contains('Phantom Sandbox')
  })
})
