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

// Affiche les résultats dans le popup
function displayResults(text) {
    const resultsDiv = document.getElementById("results");
    const resultsContent = resultsDiv.querySelector(".results-content");
    const copyButton = document.getElementById("copyButton");
    const resumeButton = document.getElementById("resumeButton");

    resultsDiv.hidden = false;
    if (resumeButton) {
        resumeButton.disabled = false;
    }

    // Affiche un extrait du texte
    resultsContent.textContent = text.substring(0, 500) + (text.length > 500 ? "..." : "");
    copyButton.hidden = false; // Affiche le bouton "Copier"

    const newCopyButton = copyButton.cloneNode(true);
    copyButton.parentNode.replaceChild(newCopyButton, copyButton);

    // Gère le bouton "Copier"
    newCopyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(text.substring(0, 500))
        .then(() => {
            if (copyFeedback) {
                copyFeedback.hidden = false;
                
                // Masquer le message automatiquement après 2 secondes (2000 ms)
                setTimeout(() => {
                    copyFeedback.hidden = true;
                }, 2000);
            }
        })
        .catch(err => console.error("Erreur lors de la copie :", err));
    });
}

function finishScraping(isSuccess, message) {
    const resumeButton = document.getElementById("resumeButton");
    const statusElement = document.getElementById("status");
    const loadingSpan = document.querySelector(".button-loading");
    const buttonTextSpan = document.querySelector("#resumeButton .button-text");

    if (resumeButton) {
        resumeButton.disabled = false;
    }
    
    if (loadingSpan) {
        loadingSpan.hidden = true;
    }
    if (buttonTextSpan) {
        buttonTextSpan.hidden = false;
    }

    if (statusElement) {
        statusElement.textContent = isSuccess ? "Données récupérées." : message;
    }
}

document.getElementById('scrapeForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const resumeButton = document.getElementById("resumeButton");
    const statusElement = document.getElementById("status");
    const loadingSpan = document.querySelector(".button-loading");

    if (resumeButton) {
        resumeButton.disabled = true;
    }
    if (loadingSpan) {
        loadingSpan.hidden = false;
        const buttonTextSpan = resumeButton.querySelector(".button-text");
        if (buttonTextSpan) buttonTextSpan.hidden = true;
    }
    if (statusElement) {
        statusElement.textContent = "Récupération des données en cours...";
    }

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tab = tabs[0];
        
        // Vérifier si l'URL existe et si c'est une page valide
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
            console.error("[ERROR]: Unable to scrape this page (browser system page).");
            return;
        }
        
        chrome.tabs.sendMessage(tab.id, {action: "GET_PAGE_CONTENT"}, (response) => {
            
            // Si le content script n'est pas chargé
            if (chrome.runtime.lastError) {

                // Injecter le content script
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['./content/content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[INJECTION ERROR]: ", chrome.runtime.lastError);
                        return;
                    }
                    
                    // Attendre un peu puis réessayer
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {action: "GET_PAGE_CONTENT"}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("[CONNECTION ERROR]:", chrome.runtime.lastError.message);
                                finishScraping(false, "Erreur de connexion.");
                                return;
                            }
                            if (response && response.status === "success") {
                                finishScraping(true, "Données récupérées.");
                                displayResults(response.data.content.text);
                            } else {
                                finishScraping(false, "Erreur de scraping (code 2).");
                                console.error("[ERROR]:", response?.message);
                            }
                        });
                    }, 200);
                });
                
                return;
            }

            else {
                if (response && response.status === "success") {
                    finishScraping(true, "Données récupérées.");
                    displayResults(response.data.content.text);
                } else {
                    finishScraping(false, "Erreur de scraping (code 1).");
                    console.error("[ERROR]:", response?.message);
                }
            }
        });
    });
});
