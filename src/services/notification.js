import { del, get, post, put } from "./api";

export const notifications = {
  mine: () => get("/notification", { error: "Impossible de charger vos notifications." }),
  unreadCount: () => get("/notification/unread-count"),
  markRead: (id) => put(`/notification/${id}/read`, null),
  markAllRead: () => put("/notification/read-all", null, { error: "Impossible de marquer les notifications comme lues." }),
  remove: (id) => del(`/notification/${id}`, { error: "Impossible de supprimer cette notification." }),
  broadcast: (data) => post("/notification/broadcast", data, { error: "Impossible d'envoyer cette annonce." }),
};
