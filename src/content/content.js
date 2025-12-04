function scrapeEverything() {
    const title = document.title;
    const url = window.location.href;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.getAttribute("content") : "";

    const openGraphImageMeta = document.querySelector('meta[property="og:image"]');
    const openGraphImage = openGraphImageMeta ? openGraphImageMeta.getAttribute("content") : "";

    return {
        metadata: {
            title,
            url,
            description,
            openGraphImage
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_PAGE_CONTENT") {
        try {
            const data = scrapeEverything();

            sendResponse({
                status: "success",
                data: data
            });
        }
        catch (error) {
            sendResponse({
                status: "error",
                message: error.message
            });
        }
    }
    else {
        sendResponse({
            status: "error",
            message: "[ERROR]: Action request is not available."
        })
    }
});
