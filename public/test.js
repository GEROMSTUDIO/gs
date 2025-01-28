document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filmForm");
  const output = document.getElementById("generatedCode");

  let scriptContent = "";
  let templateHTML = "";

  // Fonction pour charger un fichier externe
  const loadFile = async (filePath) => {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement du fichier: ${filePath}`);
    }
    return await response.text();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const filmName = document.getElementById("filmName").value;
    const actors = document.getElementById("actors").value;
    const director = document.getElementById("director").value;
    const summary = document.getElementById("summary").value;
    const posterLink = document.getElementById("posterLink").value;
    const filmLink = document.getElementById("filmLink").value;

    try {
      // Charger les fichiers externes
      templateHTML = await loadFile("template.html");
      scriptContent = await loadFile("template.js");

      // Remplacer les placeholders dans le modèle HTML par les valeurs
      const finalHTML = templateHTML
        .replace("{{filmName}}", filmName)
        .replace("{{filmName2}}", filmName)
        .replace("{{actors}}", actors)
        .replace("{{director}}", director)
        .replace("{{summary}}", summary)
        .replace("{{posterLink}}", posterLink)
        .replace("{{filmLink}}", filmLink);

      // Générer le code final avec le template HTML et le script JavaScript
      const finalCode = finalHTML + "<script>" + scriptContent + "</script>";

      // Afficher le code généré dans la zone de sortie
      output.textContent = finalCode.trim();
    } catch (error) {
      console.error("Erreur lors du chargement des fichiers externes:", error);
      output.textContent =
        "Une erreur est survenue lors du chargement des fichiers.";
    }
  });
});
