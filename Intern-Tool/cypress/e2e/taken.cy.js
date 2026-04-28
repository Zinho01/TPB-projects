// Cypress testen voor de Taken pagina
// Login als admin voor alle testen

const ADMIN_EMAIL = 'admin@taskmanager.nl'
const ADMIN_WACHTWOORD = 'admin123'
const PAUZE = 800

// Hulpfunctie: inloggen en naar de taken pagina gaan
function inloggenEnNaarTaken() {
  cy.visit('/login')
  cy.wait(PAUZE)
  cy.get('#email').type(ADMIN_EMAIL, { delay: 80 })
  cy.wait(PAUZE)
  cy.get('#wachtwoord').type(ADMIN_WACHTWOORD, { delay: 80 })
  cy.wait(PAUZE)
  cy.get('.btn-inloggen').click()
  cy.url().should('include', '/dashboard')
  cy.wait(PAUZE)
  cy.visit('/taken')
  cy.wait(PAUZE)
}

describe('Taken pagina', () => {

  // Test 1: Nieuwe taak aanmaken met een geldige titel
  it('1 - Een nieuwe taak aanmaken', () => {
    inloggenEnNaarTaken()

    cy.get('.btn-primair').contains('Nieuwe taak').click()
    cy.wait(PAUZE)
    cy.get('input[placeholder="Korte beschrijving van de taak"]').type('Test taak aangemaakt door Cypress', { delay: 60 })
    cy.wait(PAUZE)
    cy.get('.taak-formulier').submit()
    cy.wait(PAUZE)

    cy.contains('Test taak aangemaakt door Cypress').should('exist')
    cy.wait(PAUZE)
  })

  // Test 2: Een taak aanmaken zonder titel mag niet werken
  it('2 - Taak aanmaken zonder titel lukt niet', () => {
    inloggenEnNaarTaken()

    cy.get('.btn-primair').contains('Nieuwe taak').click()
    cy.wait(PAUZE)
    cy.get('.taak-formulier').submit()
    cy.wait(PAUZE)

    cy.get('.taak-formulier').should('exist')
    cy.wait(PAUZE)
  })

  // Test 3: Status van een taak veranderen naar "bezig"
  it('3 - Status van een taak aanpassen naar bezig', () => {
    inloggenEnNaarTaken()

    cy.get('.status-select').first().select('bezig')
    cy.wait(PAUZE)

    cy.get('.status-select').first().should('have.value', 'bezig')
    cy.wait(PAUZE)
  })

  // Test 4: Status van een taak veranderen naar "klaar"
  it('4 - Status van een taak aanpassen naar klaar', () => {
    inloggenEnNaarTaken()

    cy.get('.status-select').first().select('klaar')
    cy.wait(PAUZE)

    cy.get('.status-select').first().should('have.value', 'klaar')
    cy.wait(PAUZE)
  })

  // Test 5: Status terugzetten naar "open"
  it('5 - Status terugzetten naar open', () => {
    inloggenEnNaarTaken()

    cy.get('.status-select').first().select('klaar')
    cy.wait(PAUZE)
    cy.get('.status-select').first().select('open')
    cy.wait(PAUZE)

    cy.get('.status-select').first().should('have.value', 'open')
    cy.wait(PAUZE)
  })

  // Test 6: Filteren op open taken
  it('6 - Filter op open taken werkt', () => {
    inloggenEnNaarTaken()

    cy.get('.filter-knop').contains('Open').click()
    cy.wait(PAUZE)

    cy.get('.status-select').each(($select) => {
      cy.wrap($select).should('have.value', 'open')
    })
    cy.wait(PAUZE)
  })

  // Test 7: Filteren op taken die klaar zijn
  it('7 - Filter op voltooide taken werkt', () => {
    inloggenEnNaarTaken()

    // Zet de eerste taak op klaar zodat de filter iets te tonen heeft
    cy.get('.status-select').first().select('klaar')
    cy.wait(PAUZE)

    cy.get('.filter-knop').contains('Klaar').click()
    cy.wait(PAUZE)

    // Na het filteren mogen er alleen klaar-taken zichtbaar zijn
    cy.get('.status-select').each(($select) => {
      cy.wrap($select).should('have.value', 'klaar')
    })
    cy.wait(PAUZE)
  })

  // Test 8: Filteren op taken met status "bezig"
  it('8 - Filter op taken met status bezig werkt', () => {
    inloggenEnNaarTaken()

    cy.get('.filter-knop').contains('Bezig').click()
    cy.wait(PAUZE)

    cy.get('.status-select').each(($select) => {
      cy.wrap($select).should('have.value', 'bezig')
    })
    cy.wait(PAUZE)
  })

  // Test 9: Een taak verwijderen
  it('9 - Een taak verwijderen', () => {
    inloggenEnNaarTaken()

    cy.get('.btn-primair').contains('Nieuwe taak').click()
    cy.wait(PAUZE)
    cy.get('input[placeholder="Korte beschrijving van de taak"]').type('Taak om te verwijderen', { delay: 60 })
    cy.wait(PAUZE)
    cy.get('.taak-formulier').submit()
    cy.wait(PAUZE)
    cy.contains('Taak om te verwijderen').should('exist')
    cy.wait(PAUZE)

    cy.contains('Taak om te verwijderen')
      .closest('.taak-rij')
      .find('.btn-gevaarlijk')
      .click()

    cy.on('window:confirm', () => true)
    cy.wait(PAUZE)

    cy.contains('Taak om te verwijderen').should('not.exist')
    cy.wait(PAUZE)
  })

  // Test 10: Detail pagina van een taak openen
  it('10 - Naar de detailpagina van een taak gaan', () => {
    inloggenEnNaarTaken()

    cy.get('.btn-klein').contains('Detail').first().click()
    cy.wait(PAUZE)

    cy.url().should('match', /\/taken\/\d+/)
    cy.wait(PAUZE)
  })

})
