/**
 * Libellés et couleurs des statuts métier, alignés sur les énumérations du serveur.
 * tone : green | amber | red | blue | slate | violet | sky
 */

export const BIN_STATUS = {
  EMPTY: { label: "Vide", tone: "green" },
  FULL: { label: "Plein", tone: "red" },
  OUT_OF_SERVICE: { label: "Hors service", tone: "slate" },
  ARCHIVED: { label: "Archivé", tone: "slate" },
};

export const VEHICLE_STATUS = {
  AVAILABLE: { label: "Disponible", tone: "green" },
  UNAVAILABLE: { label: "En mission", tone: "blue" },
  SLEEPING: { label: "Au repos", tone: "violet" },
  BROKEN_DOWN: { label: "En panne", tone: "red" },
  OUT_OF_SERVICE: { label: "Hors service", tone: "slate" },
  ARCHIVED: { label: "Archivé", tone: "slate" },
};

export const USER_STATUS = {
  ONLINE: { label: "En ligne", tone: "green" },
  OFFLINE: { label: "Hors ligne", tone: "slate" },
  SUSPENDED: { label: "Archivé", tone: "red" },
};

export const MISSION_STATUS = {
  PLANNED: { label: "Planifiée", tone: "slate" },
  ASSIGNED: { label: "Affectée", tone: "sky" },
  ACCEPTED: { label: "Acceptée", tone: "violet" },
  REFUSED: { label: "Refusée", tone: "red" },
  IN_PROGRESS: { label: "En cours", tone: "amber" },
  COMPLETED: { label: "Terminée", tone: "green" },
  FAILED: { label: "Échouée", tone: "red" },
  CANCELLED: { label: "Annulée", tone: "slate" },
};

export const MISSION_PURPOSE = {
  COLLECTION: { label: "Collecte de bac", short: "Bac", tone: "green" },
  TOUR: { label: "Tournée de quartier", short: "Tournée", tone: "blue" },
  PREMIUMCOLLECTION: { label: "Collecte premium", short: "Premium", tone: "amber" },
};

export const PRIORITY = {
  LOW: { label: "Basse", tone: "slate" },
  NORMAL: { label: "Normale", tone: "sky" },
  HIGH: { label: "Haute", tone: "amber" },
  URGENT: { label: "Urgente", tone: "red" },
};

export const REPORT_TYPE = {
  FULL_BIN: { label: "Bac plein", emoji: "🗑️" },
  OVERFLOW: { label: "Débordement", emoji: "⚠️" },
  DAMAGED_BIN: { label: "Bac endommagé", emoji: "🔧" },
  ILLEGAL_DUMP: { label: "Dépôt sauvage", emoji: "🚯" },
  VEHICLE_INCIDENT: { label: "Incident véhicule", emoji: "🚛" },
  ACCESS_ISSUE: { label: "Accès impossible", emoji: "🚧" },
  OTHER: { label: "Autre", emoji: "💬" },
};

export const REPORT_STATUS = {
  NEW: { label: "Nouveau", tone: "sky" },
  IN_PROGRESS: { label: "Pris en charge", tone: "amber" },
  RESOLVED: { label: "Résolu", tone: "green" },
  REJECTED: { label: "Non retenu", tone: "slate" },
};

export const CAPSULE_FORMAT = {
  VIDEO: { label: "Mini-vidéo" },
  SLIDESHOW: { label: "Diaporama" },
  INFOGRAPHIC: { label: "Infographie" },
};

export const CAPSULE_STATUS = {
  DRAFT: { label: "Brouillon", tone: "slate" },
  SCHEDULED: { label: "Programmée", tone: "sky" },
  PUBLISHED: { label: "Publiée", tone: "green" },
  ARCHIVED: { label: "Archivée", tone: "slate" },
};

export const CAPSULE_AUDIENCE = {
  ALL: { label: "Tout le monde" },
  INDIVIDUAL: { label: "Particuliers" },
  ENTERPRISE: { label: "Entreprises" },
  PREMIUM: { label: "Clients premium" },
};

export const CAPSULE_THEMES = [
  "Tri des déchets", "Utilisation des bacs", "Horaires de dépôt", "Dépôts sauvages", "Compostage",
  "Réduction des plastiques", "Hygiène et santé", "Recyclage",
];

export const SUBSCRIPTION_STATUS = {
  PENDING_PAYMENT: { label: "En attente de paiement", tone: "amber" },
  ACTIVE: { label: "Actif", tone: "green" },
  SUSPENDED: { label: "Suspendu", tone: "red" },
  EXPIRED: { label: "Expiré", tone: "slate" },
  CANCELLED: { label: "Résilié", tone: "slate" },
};

export const REQUEST_STATUS = {
  PENDING: { label: "En attente", tone: "amber" },
  PLANNED: { label: "Planifiée", tone: "sky" },
  DONE: { label: "Réalisée", tone: "green" },
  CANCELLED: { label: "Annulée", tone: "slate" },
  REJECTED: { label: "Refusée", tone: "red" },
};

export const SLOTS = {
  MORNING: { label: "Matin (7h – 12h)" },
  AFTERNOON: { label: "Après-midi (12h – 17h)" },
  EVENING: { label: "Soir (17h – 20h)" },
};

export const PRODUCT_STATUS = {
  DRAFT: { label: "Brouillon", tone: "slate" },
  PUBLISHED: { label: "En vente", tone: "green" },
  ARCHIVED: { label: "Archivé", tone: "slate" },
};

export const PRODUCT_CATEGORIES = ["Compost et engrais", "Charbon écologique", "Plastique recyclé", "Matériaux de construction", "Matières triées", "Objets recyclés"];
export const PRODUCT_UNITS = ["sac", "kg", "pièce", "lot", "tonne", "litre"];

export const ORDER_STATUS = {
  PENDING: { label: "En attente", tone: "amber" },
  CONFIRMED: { label: "Confirmée", tone: "sky" },
  PREPARING: { label: "En préparation", tone: "violet" },
  READY: { label: "Prête", tone: "blue" },
  DELIVERED: { label: "Livrée", tone: "green" },
  CANCELLED: { label: "Annulée", tone: "slate" },
};

export const ORDER_NEXT = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PREPARING", "READY"],
  PREPARING: ["READY"],
  READY: ["DELIVERED"],
};

export const DELIVERY_MODE = {
  PICKUP: { label: "Retrait en point de vente" },
  DELIVERY: { label: "Livraison" },
};

export const ROLE = {
  SUPER_ADMIN: { label: "Super administrateur", tone: "violet" },
  ADMIN: { label: "Administrateur", tone: "sky" },
  DRIVER: { label: "Chauffeur", tone: "amber" },
  CLIENT: { label: "Client", tone: "green" },
};

export const CLIENT_TYPE = {
  CLASSIC: { label: "Classique", tone: "slate" },
  PREMIUM: { label: "Premium", tone: "amber" },
};

/** Villes et quartiers proposés dans les formulaires (saisie libre possible). */
export const TOWNS = {
  "Yaoundé": ["Bastos", "Biyem-Assi", "Mvan", "Mvog-Mbi", "Nlongkak", "Essos", "Mendong", "Ekounou", "Emana", "Melen", "Ngoa-Ekellé", "Omnisport", "Odza", "Nkolbisson", "Etoudi"],
  "Douala": ["Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali", "Makepe", "Bonamoussadi", "Logpom", "Ndokotti", "Kotto", "PK8", "Bépanda"],
};

export function meta(map, key) {
  return map[key] || { label: key || "—", tone: "slate" };
}
