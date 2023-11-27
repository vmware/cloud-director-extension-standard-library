import { Given, Then } from "cypress-cucumber-preprocessor/steps";

export interface DataTable {
    rawTable: any[][];
}

Given("I logged into to VMware Cloud Director Portal", (dataTable: DataTable) => {
    cy.viewport(1920, 1080);

    const username: string = dataTable.rawTable[0][1];
    const password: string = dataTable.rawTable[1][1];

    cy.visit(`${Cypress.env("VCD_URL")}/provider`);

    fillLoginForm(username, password);
});

Given("I am logged in to VMware Cloud Director Portal", (dataTable: DataTable) => {
    // Check you are logged in to VMware Cloud Director Portal
});

Then("I navigate to XYZ", () => {
    // Navigate to page XYZ
});

function fillLoginForm(username: string, password: string) {
    cy.get("input[id='usernameInput']", {timeout: 60000}).should("be.visible");
    cy.get("input[id='usernameInput']").type(username);
    cy.get("input[id='passwordInput']").type(password);
    cy.get("button[id='loginButton']").click();
}