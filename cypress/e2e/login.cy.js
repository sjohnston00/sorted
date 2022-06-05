/// <reference types="cypress" />

describe("Sorted App", () => {
  // beforeEach(() => {
  //   // Cypress starts out with a blank slate for each test
  //   // so we must tell it to visit our website with the `cy.visit()` command.
  //   // Since we want to visit the same URL at the start of all our tests,
  //   // we include it in our beforeEach function so that it runs before each test
  //   cy.visit("https://example.cypress.io/todo")
  // })

  it("User can login", () => {
    // We use the `cy.get()` command to get all elements that match the selector.
    // Then, we use `should` to assert that there are two matched items,
    // which are the two default items.
    cy.visit("http://localhost:3000/login")
    cy.get(".auth-form #username").type("tester2")
    cy.get(".auth-form #password").type("Tester2!")

    cy.get(".auth-form #username").should("have.value", "tester2")
    cy.get(".auth-form #password").should("have.value", "Tester2!")

    cy.get('[data-testid="login-button"]').click()

    cy.wait(1500)

    cy.getCookie("sorted_session").should("exist")
  })

  it("User invalid login", () => {
    cy.visit("http://localhost:3000/login")

    cy.get(".auth-form #username").type("invalid")
    cy.get(".auth-form #password").type("invalid")

    cy.get('[data-testid="login-button"]').click()

    cy.wait(300)

    cy.get('[data-testid="error-message"]').should(
      "have.text",
      "Username or password is incorrect"
    )
  })
})
