describe('Search', () => {
  it('should navigate to search page and back to home correctly', () => {
    // Visit home page
    cy.visit('http://localhost:3000')

    // Type in banner search
    // Assuming the banner input is the first/main input or identifiable by placeholder
    const searchText = 'Apple'
    cy.get('[data-cy="index-search-input"]').type(`${searchText}{enter}`)

    // Verify URL change
    // The expected URL format after the fix is /search?apple-articles[query]=Apple
    // We use a regex or partial match to be robust
    cy.url().should('eq', 'http://localhost:3000/search?apple-articles%5Bquery%5D=Apple')

    // Verify results exist (waiting for meilisearch)
    cy.get('[data-cy="search-article-card"]').should('have.length.at.least', 1)

    // Verify Back behavior
    cy.go('back')

    // Verify return to Home
    cy.url().should('eq', 'http://localhost:3000/')
  })

  it('should open modal from header on specific page', () => {
    cy.visit('http://localhost:3000/appledaily')

    // Click header search button
    cy.get('[data-cy="header-search-btn"]').click()

    // Assert Modal is open
    cy.get('[data-cy="modal-search-input"]').should('be.visible')

    // Perform search
    const term = 'Apple'
    cy.get('[data-cy="modal-search-input"]').type(term)

    // Wait for results
    cy.get('[data-cy="search-article-card"]').should('have.length.at.least', 5)

    // Measure initial count
    cy.get('[data-cy="search-article-card"]').then($cards => {
      const initialCount = $cards.length

      // Scroll to bottom of container
      cy.get('#search-results-container').scrollTo('bottom')

      // Wait for load (spinner or count increase)
      cy.wait(2000)

      // Verify count increased
      cy.get('[data-cy="search-article-card"]').should('have.length.gt', initialCount)
    })

    // Close Modal
    cy.get('body').type('{esc}')
    cy.get('[data-cy="modal-search-input"]').should('not.exist')
  })

  it('should clear search input when re-opening modal', () => {
    // 1. Visit Appledaily
    cy.visit('http://localhost:3000/appledaily')

    // 2. Open Modal
    cy.get('[data-cy="header-search-btn"]').click()
    cy.get('[data-cy="modal-search-input"]').should('be.visible')

    // 3. Type search term
    const term = 'Apple'
    cy.get('[data-cy="modal-search-input"]').type(term)
    cy.wait(500)
    cy.get('[data-cy="search-article-card"]').should('have.length.at.least', 1)

    // 4. Close Modal
    cy.get('body').type('{esc}')
    cy.get('[data-cy="modal-search-input"]').should('not.exist')

    // 5. Re-open Modal
    cy.get('[data-cy="header-search-btn"]').click()
    cy.get('[data-cy="modal-search-input"]').should('be.visible')

    // 6. Assert Input is Empty
    // If bug exists, this will fail because value will be 'PersistentTerm'
    cy.get('[data-cy="modal-search-input"]').should('have.value', '')
  })

  it('should close the modal when navigating to an article', () => {
    // 1. Visit the home page
    cy.visit('/appledaily')

    // 2. Open the search modal
    cy.get('[data-cy="header-search-btn"]').click()
    cy.get('[data-cy="modal-search-input"]').should('be.visible')

    // 3. Type a search term that yields results
    cy.get('[data-cy="modal-search-input"]').type('Apple')

    // Wait for results to appear
    cy.get('[data-cy="search-article-card"]', { timeout: 10000 }).should('have.length.gt', 0)

    // 4. Click the first article card
    // Note: We need to click the link inside the card or the card itself if it handles the click.
    // The previous implementation shows LinkOverlay is used.
    cy.get('[data-cy="search-article-card"]').first().click()

    // 5. Verify URL changes to an article page (optimistic check for /articles/ in URL)
    cy.url().should('include', '/articles/')

    // 6. Verify Search Modal is no longer visible
    // We check if the modal content is not visible or doesn't exist
    cy.get('[data-cy="modal-search-input"]').should('not.exist')
  })
})
