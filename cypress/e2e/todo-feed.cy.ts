const BASE_URL = "http://localhost:3000";

describe("/ - todos feed", () => {
  it("when load, renders the page", () => {
    cy.visit(BASE_URL);
  });
  it.only("when create a new TODO, it must appears in the screen", () => {
    // 0 - Interceptions
    cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "250aaa1b-5ad6-4a07-9601-156506bc59a3",
            date: "2023-12-09T20:27:53.710Z",
            content: "Test TODO",
            done: false,
          },
        },
      });
    }).as("createTodo");
    // 1 - Open the page
    cy.visit(BASE_URL);
    // 2 - Select the input to create a new TODO
    const $inputAddTodo = cy.get("header > form > input[name='add-todo']");
    // 3 - Type in the input to create a new TODO
    $inputAddTodo.type("Test TODO");
    // 4 - Click in the button
    const $btnAddTodo = cy.get("[aria-label='Adicionar novo item']");
    $btnAddTodo.click();
    // 5 - Check if the page has a new element
    cy.get("table > tbody").contains("Test TODO");
  });
});
