/// <reference types="cypress" />

describe('Articles list view loading', () => {
  beforeEach(() => {})

  specify.skip('Loading and paging on home', () => {
    cy.visit('/appledaily')
    cy.get('[data-cy=article-card]').eq(-1).scrollIntoView()
    checkScrollingOnHome(1)
    checkScrollingOnHome(2)
    checkScrollingOnHome(3)
  })

  specify.skip('Loading and paging category page', () => {
    cy.visit('/appledaily/20210624/local')
    checkScrollingOnCategory(1)
    checkScrollingOnCategory(2)
    checkScrollingOnCategory(3)
  })

  specify.skip('Should show load more button when list is smaller then container height', () => {
    cy.viewport(1366, 1366)
    cy.visit('/appledaily/20210623/unknown')
    cy.get('[data-cy=article-list-view-loading-block]').should('exist')
    cy.get('[data-cy=article-list-view-loading-block] > .chakra-button').click()
    cy.get('[data-cy=article-list-view-loading-block]').should('not.exist')
  })
})

function checkScrollingOnHome(count) {
  const day = 23 + 1 - count
  cy.get(`:nth-child(${count}) > [data-cy=list-view-date] > div`)
    .should('contain', `2021年6月${day}日`)
    .scrollIntoView()
  cy.url().should('eq', `http://localhost:3000/appledaily/202106${day}`)
}

function checkScrollingOnCategory(count) {
  const day = 24 + 1 - count
  cy.get(`:nth-child(${count}) > [data-cy=list-view-date] > div`)
    .should('contain', `2021年6月${day}日`)
    .scrollIntoView()
  cy.url().should('eq', `http://localhost:3000/appledaily/202106${day}/local`)
}
