// Function to extract clean text from a DOM element
function getCleanText(element) {
    // Clone the element to avoid modifying the original DOM
    const clonePage = element.cloneNode(true);

    // List of HTML tags to remove before extracting text
    const tagBlacklist = ['script', 'style', 'noscript', 'iframe', 'svg', 'header', 'footer', 'nav'];

    // Remove all blacklisted tags from the cloned element
    tagBlacklist.forEach(tagName => {
        const elements = clonePage.querySelectorAll(tagName);
        elements.forEach(element => element.remove());
    });

    // Get the visible text from the cleaned clone
    let text = clonePage.innerText || clonePage.textContent;

    // Normalize whitespace (replace multiple spaces/newlines with a single space) and trim edges
    text = text.replace(/\s+/g, ' ').trim();

    // Return the cleaned text
    return text;
}

// Function to scrape the main content and metadata of the current webpage
function scrapeEverything() {
    // Extract the page title
    const title = document.title;
    
    // Extract the current page URL
    const url = window.location.href;

    // Extract the content of the meta description tag (if it exists)
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.getAttribute("content") : "";

    // Extract the content of the Open Graph image meta tag (if it exists)
    const openGraphImageMeta = document.querySelector('meta[property="og:image"]');
    const openGraphImage = openGraphImageMeta ? openGraphImageMeta.getAttribute("content") : "";

    // Extract the cleaned text from the body of the page
    const cleanText = getCleanText(document.body);

    // Return the scraped data organized into metadata and content
    return {
        metadata: {
            title,
            url,
            description,
            openGraphImage
        },
        content: {
            text: cleanText
        }
    };
}

// Chrome extension listener for incoming messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message requests page content
    if (request.action === "GET_PAGE_CONTENT") {
        try {
            // Scrape the page and send a success response
            const data = scrapeEverything();

            sendResponse({
                status: "success",
                data: data
            });
        }
        catch (error) {
            // If an error occurs, send an error response with the message
            sendResponse({
                status: "error",
                message: error.message
            });
        }
    }
    else {
        // If the action is not recognized, send an error response
        sendResponse({
            status: "error",
            message: "[ERROR]: Action request is not available."
        })
    }
});
