/// <reference types="cypress" />

describe('Other pages', () => {
  specify('Should load /google', () => {
    cy.visit('/google')
    cy.get('.gsc-control-cse').should('exist')
  })

  specify('Should load sitemap from API', () => {
    cy.request('/sitemap/appledaily/20210623.xml').then(resp => {
      expect(resp.status).to.eq(200)
    })
  })
})
