/// <reference types="cypress" />

describe('Index page check', () => {
  specify('Index page elements should exist', () => {
    cy.visit('/')
    cy.get('[data-cy="media-tab-appledaily-btn"]').should('exist')
    cy.get('[data-cy="media-tab-thestandnews-btn"]').should('exist')
    cy.get('[data-cy="show-articles-btn"]').should('exist')
    cy.get('[data-cy="header-nav-btn"]').should('exist')
  })

  specify('Switch media tab should work', () => {
    cy.visit('/')
    cy.get('[data-cy="media-tab-thestandnews-btn"]').should('exist').click()
  })

  specify.skip('Show articles btn should navigate', () => {
    cy.visit('/')
    cy.get('[data-cy="show-articles-btn"]').click({ multiple: true })
    cy.url().should('match', /.+\/appledaily/)
  })

  specify('Header nav should work', () => {
    cy.visit('/')
    cy.get('[data-cy="header-nav-btn"]').should('exist').click()
    cy.get('[data-cy="header-media-appledaily-btn"]').should('exist').click()
    cy.url().should('match', /.+\/appledaily/)
  })
})
