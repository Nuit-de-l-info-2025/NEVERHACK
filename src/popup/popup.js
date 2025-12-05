import search_resume from '../utils/api.js';

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

// Variable pour stocker le texte complet
let fullText = "";

// Affiche les résultats dans le popup
function displayResults(text) {
    const resultsDiv = document.getElementById("results");
    const resultsContent = resultsDiv.querySelector(".results-content");
    const copyButton = document.getElementById("copyButton");
    const showButton = document.getElementById("showButton");
    const resumeButton = document.getElementById("resumeButton");

    // Stocke le texte complet
    fullText = text;

    resultsDiv.hidden = false;
    if (resumeButton) {
        resumeButton.disabled = false;
    }

    // Affiche par défaut 400 caractères
    resultsContent.textContent = text.substring(0, 400) + (text.length > 400 ? "..." : "");
    
    // Affiche les boutons
    copyButton.hidden = false;
    
    // N'affiche le bouton "Voir plus/moins" que si le texte dépasse 400 caractères
    if (text.length > 400) {
        showButton.hidden = false;
        showButton.textContent = "Voir plus";
        showButton.dataset.expanded = "false";
    } else {
        showButton.hidden = true;
    }

    // Clone le bouton "Copier" pour éviter les multiples event listeners
    const newCopyButton = copyButton.cloneNode(true);
    copyButton.parentNode.replaceChild(newCopyButton, copyButton);

    // Gère le bouton "Copier"
    newCopyButton.addEventListener("click", () => {
        const textToCopy = fullText.substring(0, 3000);
        navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const copyFeedback = document.getElementById("copyFeedback");
            if (copyFeedback) {
                copyFeedback.hidden = false;
                
                // Masquer le message automatiquement après 2 secondes
                setTimeout(() => {
                    copyFeedback.hidden = true;
                }, 2000);
            }
        })
        .catch(err => console.error("Erreur lors de la copie :", err));
    });

    // Clone le bouton "Voir plus/moins" pour éviter les multiples event listeners
    const newShowButton = showButton.cloneNode(true);
    showButton.parentNode.replaceChild(newShowButton, showButton);

    // Gère le bouton "Voir plus/moins"
    newShowButton.addEventListener("click", () => {
        const isExpanded = newShowButton.dataset.expanded === "true";
        
        if (isExpanded) {
            // Affiche 400 caractères
            resultsContent.textContent = fullText.substring(0, 400) + (fullText.length > 400 ? "..." : "");
            newShowButton.textContent = "Voir plus";
            newShowButton.dataset.expanded = "false";
        } else {
            // Affiche 3000 caractères
            resultsContent.textContent = fullText.substring(0, 3000) + (fullText.length > 3000 ? "..." : "");
            newShowButton.textContent = "Voir moins";
            newShowButton.dataset.expanded = "true";
        }
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
        
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
            console.error("[ERROR]: Unable to scrape this page (browser system page).");
            finishScraping(false, "Page non supportée.");
            return;
        }
        
        chrome.tabs.sendMessage(tab.id, {action: "GET_PAGE_CONTENT"}, async (response) => {
            
            // Si le content script n'est pas chargé
            if (chrome.runtime.lastError) {

                // Injecter le content script
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['./content/content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[INJECTION ERROR]: ", chrome.runtime.lastError);
                        finishScraping(false, "Erreur d'injection.");
                        return;
                    }
                    
                    // Attendre un peu puis réessayer
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {action: "GET_PAGE_CONTENT"}, async (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("[CONNECTION ERROR]:", chrome.runtime.lastError.message);
                                finishScraping(false, "Erreur de connexion.");
                                return;
                            }
                            if (response && response.status === "success") {
                                
                                const scrapedText = response.data.content.text;
                                const summary = await search_resume(scrapedText);
                                
                                finishScraping(true, "Résumé généré.");

                                displayResults(summary);

                            } else {
                                finishScraping(false, "Erreur de scraping (code 2).");
                                console.error("[ERROR]:", response?.message);
                            }
                        });
                    }, 200);
                });
                
                return;
            }

            // Si le content script est déjà chargé
            else {
                if (response && response.status === "success") {
                    
                    const scrapedText = response.data.content.text;
                    const summary = await search_resume(scrapedText);

                    finishScraping(true, "Résumé généré.");

                    displayResults(summary);
                    
                } else {
                    finishScraping(false, "Erreur de scraping (code 1).");
                    console.error("[ERROR]:", response?.message);
                }
            }
        });
    });
});
