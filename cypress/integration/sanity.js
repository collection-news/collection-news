/// <reference types="cypress" />

describe('Sanity check', () => {
  beforeEach(() => {})

  specify('Archive page w/o category', () => {
    cy.visit('/appledaily/20190612')
    checkArticle()
  })

  specify('Archive page with category', () => {
    cy.visit('/appledaily/20190612/breaking')
    checkArticle()
  })

  specify('History page w/o category', () => {
    cy.visit('/appledaily/history/2019')
    checkArticle()
  })

  specify('History page with category', () => {
    cy.visit('/appledaily/history/2019/local')
    checkArticle()
  })

  specify('Navigation check (1)', () => {
    // Home > 當年今日
    cy.visit('/appledaily')
    cy.get('[data-cy=history-btn]').click()
    cy.url().should('match', /.+\/appledaily\/history\/202(0|1)/)
    cy.get('[data-cy=history-btn]').should('exist')
    // 當年今日 > 當年今日 w category
    cy.get('[data-cy=category-breaking-btn]').click()
    cy.url().should('match', /.+\/appledaily\/history\/202(0|1)\/breaking/)
    // 當年今日 w category > 當年今日 w category
    cy.get('[data-cy=category-international-btn]').click()
    cy.url().should('match', /.+\/appledaily\/history\/202(0|1)\/international/)
    // 當年今日 w category > 當年今日
    cy.get('[data-cy=show-all-category-btn]').click()
    cy.url().should('match', /.+\/appledaily\/history\/202(0|1)/)
  })

  specify('Navigation check (2)', () => {
    // Home > Archive w category
    cy.visit('/appledaily')
    cy.get('[data-cy=category-breaking-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210624\/breaking/)
    // Archive w category > Archive w category
    cy.get('[data-cy=category-international-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210623\/international/)
    // Archive w category > Archive w/o category
    cy.get('[data-cy=show-all-category-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210623/)
    cy.get('[data-cy=header-media-home-btn]').click()
    cy.url().should('match', /.+\/appledaily/)
    // Home should also have show all btn
    cy.get('[data-cy=show-all-category-btn]').should('exist')
    // Search btn should work
    cy.get('[data-cy=header-search-btn]').click()
    cy.url().should('contain', '/search')
  })
})

function checkArticle() {
  cy.get('[data-cy=article-card]').should('exist').eq(0).click()
  cy.url().should('contain', '/appledaily/articles/')
  cy.get('[data-cy=article-title]').should('exist')
}
