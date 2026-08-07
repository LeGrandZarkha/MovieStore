# MovieStore

Application de découverte de films construite en React, consommant l'API publique de [TMDB](https://www.themoviedb.org/) et destinée à s'enrichir prochainement de données personnelles (favoris, notes) via Supabase.

Projet portfolio réalisé en solo, dans une logique d'apprentissage approfondi plutôt que de simple exécution : chaque décision technique (architecture de fetch, gestion d'état, choix d'endpoints API) a été réfléchie et documentée, y compris les pistes explorées puis écartées consciemment.

**Ce projet est un travail personnel, non-commercial, réalisé dans un cadre d'apprentissage.**
**This product uses the TMDb API but is not endorsed or certified by TMDb, and is not intended to generate any kind of revenue.**

## Fonctionnalités

- **Catalogue de films** via l'API TMDB, avec pagination progressive ("Afficher plus")
- **Filtrage combiné** :
  - par genre (logique OU, sélection multiple)
  - par note minimale
  - par recherche de titre
- **Deux stratégies de récupération de données selon le contexte** :
  - sans recherche de titre → requête serveur ciblée (`/discover/movie`) pour interroger tout le catalogue selon les genres/note actifs
  - avec recherche de titre → requête serveur dédiée (`/search/movie`), puis filtrage local (genre/note) sur les résultats obtenus
- **Gestion d'état** : détection de changement de filtres via comparaison de référence (`useRef`), réinitialisation de pagination, dédoublonnage des résultats par id
- **Feedback utilisateur explicite** sur les états de chargement/erreur, à chaque étape du fetch

## Stack technique

- React (hooks : `useState`, `useEffect`, `useRef`)
- Tailwind CSS
- API TMDB (`/discover/movie`, `/search/movie`, `/genre/movie/list`)
- Supabase *(authentification et données personnelles à venir)*

## Roadmap

Le détail des évolutions prévues, des décisions techniques et des pistes écartées se trouve dans [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Lancer le projet

```bash
npm install
npm run dev
```

Nécessite un fichier `.env` avec une clé API TMDB (voir `.env.example`) :

```
VITE_TMDB_TOKEN=votre_token_ici
```