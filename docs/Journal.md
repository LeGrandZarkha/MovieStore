# Movie Store — Journal de bord

Carnet de travail personnel : notions comprises, bugs rencontrés et raisonnement suivi pour les résoudre, décisions prises en cours de route. Contrairement à `ROADMAP.md`, ce fichier n'est pas destiné à donner une vue d'ensemble propre du projet — c'est une mémoire de travail, à consulter ou compléter au fil des sessions.

## Repères techniques consolidés

- `fetch()` ne rejette jamais sur un code HTTP d'erreur, seulement sur une vraie erreur réseau → toujours vérifier `response.ok`.
- Une donnée calculée à chaque appel (ex: `isNewSearch`, `pageToFetch`) doit être un paramètre de fonction ; un state stable du composant (ex: `setMovies`) peut rester accessible par closure, pas besoin de le passer en paramètre.
- Le débounce ne protège les appels réseau que si l'effet qui déclenche le fetch dépend de la valeur *debouncée* — pas de la valeur brute du state, même si celle-ci est utilisée ailleurs (affichage, filtrage local).
- YAGNI : ne pas complexifier pour un besoin futur hypothétique — question à se poser : "si je me trompe, combien ça coûte de corriger ?" plutôt que "est-ce que ça va changer un jour ?"