# NEVERHACK
Extension Chrome en Manifest V3 conçue pour résoudre un problème réel de navigation. Ce repository contient le code source, démontrant bonnes pratiques et utilisation propre de Git. Extension réutilisable et potentiellement publiable sur les stores.

---

# inResume : Résumez n’importe quelle page web en un clic

Notre extension **inResume** permet à tout utilisateur de résumer facilement et rapidement le contenu de n’importe quelle page web.

---

## Installation

1. Ouvrez **Extensions** dans votre navigateur Chrome.
2. Activez le **Mode Développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez le dossier `src` de ce dépôt.
4. L’extension **inResume** apparaîtra alors dans votre liste d’extensions.

---

## Utilisation

1. Rendez-vous sur la page web que vous souhaitez résumer.
2. Ouvrez l’extension **inResume** depuis votre barre d’outils.
3. Cliquez sur **Résumer** : un aperçu du résumé s’affichera après un court instant.
4. Pour accéder à l’intégralité du résumé, cliquez sur **Voir plus**.
5. Enfin, utilisez le bouton **Copier** pour enregistrer le résumé complet dans votre presse-papier, que vous ayez consulté la version détaillée ou non.

---
### Gestion de la clé API

Pour des raisons **écologiques**, nous avons fait le choix de ne pas utiliser de serveur intermédiaire pour masquer la clé API. Cela signifie que la clé est directement intégrée dans l’extension, en clair.

**Pourquoi ce choix ?**
- Réduire l’empreinte carbone liée à l’hébergement et aux requêtes vers un serveur.
- Simplifier l’architecture pour une extension légère et accessible.

**Conséquence :**
La clé API est visible dans le code source de l’extension. Nous comptons sur la responsabilité des utilisateurs pour ne pas la partager ou l’exploiter de manière abusive.

---
