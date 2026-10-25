# WasteTracker — Application Web

Application Next.js de la plateforme WasteTracker (YDOL Ingénierie) : **vue administrative** (tour de contrôle) et **vue client** (population et entreprises). Les chauffeurs utilisent l'application mobile dédiée.

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000
```

L'URL de l'API se règle dans `.env` : `NEXT_PUBLIC_API_URL=http://localhost:8080/api` (valeur intégrée au moment du build).

## Organisation

| Dossier | Contenu |
|---------|---------|
| `src/app/(auth)` | Connexion, inscription, mot de passe oublié / réinitialisation |
| `src/app/(view)/admin` | Tour de contrôle : tableau de bord, carte, missions, signalements, parc, clients, premium, sensibilisation, boutique |
| `src/app/(view)/client` | Espace client : accueil, sensibilisation, signaler, bacs proches, boutique, commandes, premium |
| `src/components/ui` | Kit d'interface (boutons, badges, tableaux, modales, champs, graphiques) |
| `src/components/map` | Cartes Leaflet (chargées côté client uniquement) |
| `src/components/shell` | Mises en page admin, client et authentification |
| `src/services` | Un module par ressource de l'API ; chaque appel renvoie `{ success, data }` ou `{ success: false, error }` |
| `src/lib` | Formatage (FCFA, dates), libellés des statuts, compression d'image |

L'accès aux espaces est filtré par rôle (`SessionProvider`) ; les droits réels sont contrôlés par le serveur.
