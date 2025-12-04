let search_resume = async (text) => {
    const GEMINI_API_KEY = "AIzaSyCEj9Y-mYWJL2GahscyEIWsf8gMoFZkuZY"

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Fais moi un résumé de ce texte : " + text }] }],
                }),
            }
        );

        const data = await response.json();

        const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
        if (candidates.length === 0) return "Erreur : pas de résumé";

        const candidate = candidates[0];

        const contents = Array.isArray(candidate?.content) ? candidate.content : [];
        if (contents.length === 0) return "Erreur : pas de résumé";

        let summary = contents.map(c => {
            const parts = Array.isArray(c?.parts) ? c.parts : [];
            return parts.map(p => p?.text || "").join("");
        }).join("\n");

        if (!summary.trim()) summary = "Erreur : pas de résumé";

        return summary;

    } catch (error) {
        if (error.name === "AbortError") console.warn("Request timed out");
        else console.error(error);
    } finally {
        clearTimeout(timeout);
    }
};

export default search_resume;