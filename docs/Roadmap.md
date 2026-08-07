# Movie Store — Roadmap

## État actuel

Catalogue fonctionnel avec deux stratégies de fetch selon le contexte : `/discover/movie` pour un filtrage par genre/note, `/search/movie` + filtrage local pour une recherche par titre. Débounce branché sur les requêtes réseau et l'affichage, notamment pour le curseur de note. Gestion loading/error sur les deux fetchs (films et genres). Repo versionné sur GitHub à partir de ce point.

## Points ouverts

- [ ] `MovieCard.jsx` : `hasRating` basé sur `isNaN(rating)` — un film avec `vote_average: 0` passe `hasRating: true`, affiche 5 étoiles vides. Décider si comportement voulu, sinon checker `movie.vote_count > 0`. Ou définir un seuil minimal de `vote_count`.
- [ ] Skeleton loading pour `MovieCard` (poster/titre affichés, genres en attente) — utile surtout en connexion lente (throttling 3G/4G).

## Limitation connue, non corrigée

- Pagination par numéro de page sur un classement qui varie en temps réel (popularité TMDB) : un film peut occasionnellement ne jamais apparaître si son rang change entre deux fetchs successifs (ni sur la page déjà affichée, ni sur la suivante). Limite inhérente à ce type de pagination côté TMDB, pas un bug corrigible côté front.

## Prochaines étapes

1. Cache localStorage pour données quasi-statiques (`moviesGenre`, config images TMDB) — vérifier cache + timestamp d'expiration avant fetch
2. Authentification Supabase
3. Restructurer la table Supabase (`tmdb_id` + colonnes perso uniquement : favoris, vu, note, `user_id`)
4. Page favoris + bouton favoris au hover (V2)
5. Migrations Supabase versionnées en Git

## Pistes explorées, écartées ou reportées consciemment

- **Filtre par durée** : coût réseau disproportionné (fetch détail par film), apparemment pas exposé par les grandes plateformes non plus.
- **Overlay "18+" cliquable** : `include_adult=true` chez TMDB désigne du contenu sexuel explicite, pas un équivalent PEGI → hors-sujet.
- **`include_adult=` figé à `false`, non modifiable via l'UI** : décision volontaire pour éviter tout risque. (Pas pertinent actuellement pour le projet)
- **Recherche par titre + filtre genre combinés côté serveur** : TMDB ne permet pas de combiner `/discover` et `/search` en une seule requête. Compromis retenu : `/search/movie` puis filtrage local des genres sur le résultat — peut renvoyer peu de résultats pour une combinaison très spécifique (ex: titre rare + genre rare). *Idée notée pour plus tard* : boucler automatiquement sur plusieurs pages jusqu'à un seuil de résultats filtrés, avec une limite pour éviter de scanner tout le catalogue — pas encore implémenté.