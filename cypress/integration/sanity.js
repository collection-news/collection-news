/// <reference types="cypress" />

describe('Sanity check', () => {
  beforeEach(() => {})

  specify('Home page to article details', () => {
    cy.visit('/')
    checkArticle()
  })

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
    cy.visit('/appledaily/history/2019/breaking')
    checkArticle()
  })

  specify('Check the TODO pages', () => {
    cy.visit('/search')
    cy.visit('/about-us')
  })

  specify('Navigation check', () => {
    // Home > 當年今日
    cy.visit('/')
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
    // Home > Archive w category
    cy.visit('/')
    cy.get('[data-cy=category-breaking-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210624\/breaking/)
    // Archive w category > Archive w category
    cy.get('[data-cy=category-international-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210623\/international/)
    // Archive w category > Archive w/o category
    cy.get('[data-cy=show-all-category-btn]').click()
    cy.url().should('match', /.+\/appledaily\/20210623/)
    cy.get('[data-cy=header-home-btn]').click()
    cy.url().should('eq', 'http://localhost:3000/')
    // Home should also have have show all btn
    cy.get('[data-cy=show-all-category-btn]').should('exist')
    // TODO: search impl
    // Search btn should work
    // cy.get('[data-cy=header-search-btn]').click()
    // cy.url().should('contain', '/search')
  })

  specify.skip('Loading and paging on home', () => {
    cy.visit('/')
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

  specify('Should show load more button when list is smaller then container height', () => {
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

function checkArticle() {
  cy.get('[data-cy=article-card]').should('exist').eq(0).click()
  cy.url().should('contain', '/appledaily/articles/')
  cy.get('[data-cy=article-title]').should('exist')
}
