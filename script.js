let specialties = {};

// Charger les spécialités depuis le fichier JSON
fetch("s1.json")
  .then((response) => response.json())
  .then((data) => {
    specialties = data;
    renderSpecialty("SE"); // Charger par défaut la spécialité SE
  })
  .catch((error) => console.error("Erreur lors du chargement des spécialités:", error));

function renderSpecialty(specialty) {
  const ueContainer = document.getElementById("ue-container");
  ueContainer.innerHTML = "";

  if (!specialties[specialty]) {
    ueContainer.innerHTML = "<p>Aucune spécialité trouvée.</p>";
    return;
  }

  specialties[specialty].forEach((ue, index) => {
    const ueBlock = document.createElement("div");
    ueBlock.classList.add("ue-block");

    // Ajouter le titre de l'UE
    const ueTitle = document.createElement("h2");
    ueTitle.textContent = ue.ue; // Titre de l'UE
    ueBlock.appendChild(ueTitle);

    // Section des entrées
    const ueInputs = document.createElement("div");
    ueInputs.classList.add("ue-inputs");

    // Formulaire des notes
    const form = document.createElement("form");
    ue.courses.forEach((course) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${course.name} (coef ${course.coef}) :</label>
        <input type="text" name="notes[]" placeholder="Note" class="styled-input"/>
        <input type="hidden" name="coeffs[]" value="${course.coef}" />
      `;
      form.appendChild(div);
    });
    ueInputs.appendChild(form);

    // Moyenne cible et bouton calcul
    const ueActions = document.createElement("div");
    ueActions.classList.add("ue-actions");
    ueActions.innerHTML = `
      <input type="number" id="moyenneCible-${index}" value="10" min="0" max="20" step="0.1" class="styled-input">
      <button>Calculer</button>
    `;
    ueActions.querySelector("button").addEventListener("click", (event) => {
      event.preventDefault();
      calculateSingleUE(ueBlock, index);
    });
    ueInputs.appendChild(ueActions);

    // Ajouter les entrées et les résultats dans le bloc UE
    ueBlock.appendChild(ueInputs);

    // Section des résultats
    const ueResults = document.createElement("div");
    ueResults.classList.add("ue-results");
    ueBlock.appendChild(ueResults);

    // Ajouter le bloc UE au conteneur principal
    ueContainer.appendChild(ueBlock);
  });
}

document.getElementById("specialty").addEventListener("change", (event) => {
  renderSpecialty(event.target.value);
});

function calculMoyenneEtNotes(notes, coefficients, moyenneCible) {
  const sommeCoefficients = coefficients.reduce((a, b) => a + b, 0);
  let totalActuel = 0;
  let coeffsRestants = 0;

  notes.forEach((note, i) => {
    if (note !== null && !isNaN(note)) {
      totalActuel += note * coefficients[i];
    } else {
      coeffsRestants += coefficients[i];
    }
  });

  const moyenneActuelle = sommeCoefficients > 0 ? totalActuel / sommeCoefficients : 0;
  const pointsNecessaires = moyenneCible * sommeCoefficients - totalActuel;

  const noteNecessaire = coeffsRestants > 0 ? pointsNecessaires / coeffsRestants : null;

  return { moyenneActuelle, noteNecessaire };
}

document.getElementById("calculateAllBtn").addEventListener("click", () => {
  const ueBlocks = document.querySelectorAll(".ue-block");

  ueBlocks.forEach((ueBlock, index) => {
    calculateSingleUE(ueBlock, index);
  });
});

function calculateSingleUE(ueBlock, index) {
  const moyenneCible = parseFloat(document.getElementById(`moyenneCible-${index}`).value);
  const form = ueBlock.querySelector("form");

  const formData = new FormData(form);
  const notes = formData.getAll("notes[]").map((n) => (n.trim() === "" ? null : parseFloat(n)));
  const coeffs = formData.getAll("coeffs[]").map(parseFloat);

  // Validation des notes
  if (!validateNotes(notes)) {
    alert("Veuillez entrer des notes valides entre 0 et 20.");
    return;
  }

  const { moyenneActuelle, noteNecessaire } = calculMoyenneEtNotes(notes, coeffs, moyenneCible);

  const ueResults = ueBlock.querySelector(".ue-results");
  ueResults.innerHTML = `<h3>Résultats</h3>`;
  ueResults.innerHTML += `<p>Moyenne actuelle : ${
    isNaN(moyenneActuelle) ? "Aucune note saisie" : moyenneActuelle.toFixed(2)
  }</p>`;

  if (noteNecessaire !== null) {
    ueResults.innerHTML += `<p>Note nécessaire pour valider : ${noteNecessaire.toFixed(2)}</p>`;
  } else {
    ueResults.innerHTML += `<p>Toutes les notes sont déjà renseignées.</p>`;
  }
}

function validateNotes(notes) {
  return notes.every((note) => note === null || (note >= 0 && note <= 20));
}
