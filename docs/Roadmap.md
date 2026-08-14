# Movie Store — Roadmap

## État actuel

Catalogue fonctionnel avec deux stratégies de fetch selon le contexte : `/discover/movie` pour un filtrage par genre/note, `/search/movie` + filtrage local pour une recherche par titre. Débounce branché sur les requêtes réseau et l'affichage, notamment pour le curseur de note. Gestion loading/error sur les deux fetchs (films et genres). Les genres sont mis en cache dans localStorage (expiration à une semaine) pour éviter un refetch à chaque montage.

Routing en place (`react-router`, mode declarative) : `BrowserRouter` au niveau racine (`main.jsx`), `StrictMode` en enveloppe la plus externe. Structure en nested routes avec `Layout.jsx` comme route parente (nav commune + `<Outlet />`), englobant deux routes sœurs : `/` (page découverte, `Discovery.jsx`) et `/favorites` (`Favorites.jsx`, placeholder). Route technique `/AuthCallback` ajoutée en fondation (`AuthCallback.jsx`, placeholder) — volontairement **non liée** depuis la nav, puisqu'elle n'est destinée qu'au retour de redirection GitHub, jamais à un clic utilisateur interne.

Repo versionné sur GitHub à partir du catalogue fonctionnel de base.

## Étapes complétées

- [x] Catalogue de base (fetch, filtres, pagination, debounce)
- [x] Cache localStorage des genres
- [x] Repo Git initialisé, versionné sur GitHub
- [x] Routing (`react-router`, mode declarative) : `BrowserRouter`, nested routes, `Layout.jsx` avec `<Outlet />`, routes `/`, `/favorites`, `/AuthCallback`
- [x] Renommage `App.jsx` → `Discovery.jsx` (composant + fichier + tous imports/usages)

## Prochaines étapes

1. Favoris anonymes en localStorage — `FavoritesContext` dédié (Provider englobant `Layout`), state `{ [tmdb_id]: movieObject }` indexé par id, objets complets stockés (voir décision dénormalisation ci-dessous), sans expiration contrairement au cache genres
2. Bouton connexion (placeholder modale) + authentification Supabase — OAuth GitHub
3. Restructurer la table Supabase (`tmdb_id` + colonnes perso uniquement : favoris, vu, note, `user_id`)
4. Page favoris + bouton favoris au hover — migration des favoris localStorage → Supabase à ce stade (favoris anonymes existants perdus, pas de migration automatique : ajout aux favoris possible uniquement une fois connecté après cette étape)
5. Migrations Supabase versionnées en Git

*(Note : l'étape "cache localStorage config images TMDB" a été retirée — la config `base_url`/tailles est hardcodée dans `constants.js`, aucun appel à `/configuration` n'est fait, donc rien à cacher.)*

## Points ouverts

- [ ] `MovieCard.jsx` : `hasRating` basé sur `isNaN(rating)` — un film avec `vote_average: 0` passe `hasRating: true`, affiche 5 étoiles vides. Décider si comportement voulu, sinon checker `movie.vote_count > 0`. Ou définir un seuil minimal de `vote_count`.
- [ ] Skeleton loading pour `MovieCard` (poster/titre affichés, genres en attente) — utile surtout en connexion lente (throttling 3G/4G).
- [ ] Configuration de la redirect URL OAuth GitHub — à valider avant implémentation, doit être identique côté GitHub App et côté dashboard Supabase.
- [ ] Casse de route à trancher : `/AuthCallback` (actuel) vs `/auth/callback` (minuscules, convention plus courante pour les URL) — non tranché, actuellement en `PascalCase` par défaut de rédaction, pas par choix délibéré.
- [ ] Bouton "Connexion" dans `Layout.jsx` : ouverture de modale, pas de route dédiée — placeholder à définir (actuellement absent de la nav depuis retrait du lien erroné vers `/AuthCallback`).

## Limitation connue, non corrigée

- Pagination par numéro de page sur un classement qui varie en temps réel (popularité TMDB) : un film peut occasionnellement ne jamais apparaître si son rang change entre deux fetchs successifs (ni sur la page déjà affichée, ni sur la suivante). Limite inhérente à ce type de pagination côté TMDB, pas un bug corrigible côté front.

## Pistes explorées, écartées ou reportées consciemment

- **Filtre par durée** : coût réseau disproportionné (fetch détail par film), apparemment pas exposé par les grandes plateformes non plus.
- **Overlay "18+" cliquable** : `include_adult=true` chez TMDB désigne du contenu sexuel explicite, pas un équivalent PEGI → hors-sujet.
- **`include_adult=` figé à `false`, non modifiable via l'UI** : décision volontaire pour éviter tout risque. (Pas pertinent actuellement pour le projet)
- **Recherche par titre + filtre genre combinés côté serveur** : TMDB ne permet pas de combiner `/discover` et `/search` en une seule requête. Compromis retenu : `/search/movie` puis filtrage local des genres sur le résultat — peut renvoyer peu de résultats pour une combinaison très spécifique (ex: titre rare + genre rare). *Idée notée pour plus tard* : boucler automatiquement sur plusieurs pages jusqu'à un seuil de résultats filtrés, avec une limite pour éviter de scanner tout le catalogue — pas encore implémenté.

## Décisions techniques actées

### Authentification

- **Flow d'auth : OAuth GitHub uniquement.** Choix contextuel (portfolio, audience recruteurs déjà équipés d'un compte GitHub), pas une bonne pratique générique. Sur un produit grand public, Google OAuth ou email/password seraient plus adaptés.
- **`AuthContext` séparé** (`user`, `session`, `login`/`logout`) du mécanisme favoris, découplés par fréquence de changement (auth change rarement, favoris changent à chaque interaction).

### Favoris — architecture générale

- **Source de vérité : Supabase** (une fois l'auth branchée). Le state React (Context ou autre) n'en est qu'un reflet, nécessaire pour la persistance (survie au refresh, synchronisation multi-appareil).
- **Mise à jour : optimistic update.** State indexé par `movie_id`/`tmdb_id`. Gestion d'échec à deux niveaux : le cœur repasse à l'état vide sur la carte concernée + toast (`"[titre du film] — Échec de l'ajout aux favoris"`) pour couvrir le cas où l'utilisateur a déjà navigué ailleurs.
- **Page favoris : vue à onglets** — liste de cards (même format que la découverte) + vue graphique (pie chart de répartition des genres favoris).

### Favoris — stockage des données

- **Phase anonyme (localStorage, temporaire)** : objets films complets stockés, indexés par `tmdb_id` (`{ [tmdb_id]: movieObject }`), pas d'expiration. Justifié par la durée de vie courte de ce stockage (voué à disparaître dès l'auth branchée) et par l'absence d'endpoint batch chez TMDB (un fetch par film serait disproportionné pour un stockage de quelques jours). Favoris anonymes perdus à la première connexion — pas de migration automatique.
- **Phase authentifiée (Supabase, durable)** : dénormalisation partielle — seuls les champs stables sont stockés (`tmdb_id`, `title`, `poster_path`, `genre_ids`, etc.), pas les champs volatils (`vote_average`, `popularity`), ni l'ID seul. Les champs volatils sont refetchés à la demande (ouverture d'une modale de détail), pas systématiquement pour toute la liste.

### `MovieCard` et affichage cross-pages

- **Découplage via props, pas de logique de contexte interne.**
  - `variant` (ex: `"decouverte"` / `"favoris"`) : configure l'affichage selon la page d'usage, décidée par le composant **parent** (jamais de `useLocation()` interne — un composant réutilisable ne doit pas connaître son contexte d'usage).
  - `isFavorite` (booléen) : statut du film, indépendant de la page — affiche le cœur rempli partout où le film apparaît. Prop distincte de `variant` : deux axes de variation indépendants, responsabilités séparées.
- **`favoriteIds` : `Set` de `tmdb_id`**, dans un `useState` au niveau du provider commun aux pages découverte et favoris (pas `useRef` — une donnée qui doit provoquer un re-render doit vivre dans un state).
  - Peuplement/vidage via `useEffect` avec `[user]` en dépendance : couvre connexion explicite et restauration automatique de session.
  - `if (user) { fetch + peupler } else { vider }` — vidage explicite à la déconnexion pour éviter la fuite de favoris entre utilisateurs.
  - Vérification par carte : `favoriteIds.has(movie.id)` — accès en temps quasi-constant.
  - Toute mise à jour recrée une nouvelle référence (`new Set(prev).add(id)`), jamais de mutation en place.