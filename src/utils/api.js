let search_resume = async (text) => {
    console.log(text);

    const GEMINI_API_KEY = "AIzaSyBj7u-uY1kJYpJO7-sqnWUD_Vxy_hOwow8"

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "u es un expert en résumé concis. Réalise un résumé professionnel, clair et factuel du JSON suivant. Règles de longueur strictes : 1. Le résumé complet ne doit jamais dépasser 2000 caractères en comptant les espaces. 2. Réponds uniquement avec le texte du résumé, sans préambule, titre, ou conclusion additionnelle. 3. Ne fais pas en markdown. " + text }] }],
                }),
            }
        );

        const data = await response.json();

        console.log(data);

        const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
        if (candidates.length === 0) {
            console.log("first one");
            return "Erreur : pas de résumé";
        }

        const candidate = candidates[0];

        const parts = candidate.content?.parts;
        if (!parts || parts.length === 0) {
            console.log("second one: no parts found");
            return "Erreur : pas de résumé (contenu vide ou bloqué)";
        }

        let summary = parts.map(p => p?.text || "").join("\n");

        if (!summary.trim()) summary = "Erreur : pas de résumé";

        return summary;

    } catch (error) {
        if (error.name === "AbortError") console.error("Request timed out");
        else console.error(error);
    } finally {
        clearTimeout(timeout);
    }
};

export default search_resume;
