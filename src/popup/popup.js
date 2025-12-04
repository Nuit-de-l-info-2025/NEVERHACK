document.getElementById("scrapeButton").addEventListener("click", async () => {
  // Récupère l'onglet actif
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Injecte le script de scraping
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/content.js"]
  });
});
