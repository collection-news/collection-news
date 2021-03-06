/// <reference types="cypress" />

describe('Other pages', () => {
  specify('Should load /search', () => {
    cy.visit('/search')
    cy.get('.gsc-control-cse').should('exist')
  })

  specify('Should show search box when navigate from menu', () => {
    cy.visit('/')
    cy.get('[data-cy=header-search-btn]').click()
    cy.get('.gsc-control-cse').should('exist')
  })

  specify('Should load sitemap from API', () => {
    cy.request('/sitemap/appledaily/20210623.xml').then(resp => {
      expect(resp.status).to.eq(200)
    })
  })
})
