// Détecte le thème sombre
function updateTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

// Applique le thème au chargement
updateTheme();

// Écoute les changements de thème
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

// Gère le résumé
document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const resumeButton = document.getElementById("resumeButton");
  const buttonText = resumeButton.querySelector(".button-text");
  const buttonLoading = resumeButton.querySelector(".button-loading");
  const resultsDiv = document.getElementById("results");
  const resultsContent = resultsDiv.querySelector(".results-content");
  const copyButton = document.getElementById("copyButton");

  // Désactive le bouton et affiche le chargement
  resumeButton.disabled = true;
  buttonText.hidden = true;
  buttonLoading.hidden = false;

  // Affiche la zone des résultats avec le message d'attente
  resultsDiv.hidden = false;
  resultsContent.textContent = "En attente du résumé...";
  copyButton.hidden = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: resumePage,
    });

    // Affiche les résultats
    displayResults(results[0].result);
  } catch (err) {
    console.error("Erreur :", err);
    resultsContent.textContent = "Erreur lors du résumé. Voir la console.";
  } finally {
    // Réactive le bouton
    resumeButton.disabled = false;
    buttonText.hidden = false;
    buttonLoading.hidden = true;
  }
});

// Fonction pour résumer la page
function resumePage() {
  return document.body.innerText;
}

// Affiche les résultats dans le popup
function displayResults(text) {
  const resultsDiv = document.getElementById("results");
  const resultsContent = resultsDiv.querySelector(".results-content");
  const copyButton = document.getElementById("copyButton");

  // Affiche un extrait du texte
  resultsContent.textContent = text.substring(0, 500) + (text.length > 500 ? "..." : "");
  copyButton.hidden = false; // Affiche le bouton "Copier"

  // Gère le bouton "Copier"
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(text.substring(0, 500))
      .then(() => alert("Résumé copié dans le presse-papiers !"))
      .catch(err => console.error("Erreur lors de la copie :", err));
  });
}
