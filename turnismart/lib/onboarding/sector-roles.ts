export const SECTOR_ROLES: Record<string, { name: string; color: string }[]> = {
  ristorante: [
    { name: "Cameriere", color: "#3B82F6" },
    { name: "Cuoco", color: "#EF4444" },
    { name: "Lavapiatti", color: "#10B981" },
    { name: "Barista", color: "#F59E0B" },
    { name: "Maitre", color: "#8B5CF6" },
  ],
  bar: [
    { name: "Barista", color: "#F59E0B" },
    { name: "Cameriere", color: "#3B82F6" },
  ],
  hotel: [
    { name: "Receptionist", color: "#3B82F6" },
    { name: "Housekeeping", color: "#10B981" },
    { name: "Portiere", color: "#6B7280" },
    { name: "Cameriere", color: "#F59E0B" },
  ],
  rsa: [
    { name: "Operatore OSS", color: "#10B981" },
    { name: "Infermiere", color: "#EF4444" },
    { name: "Medico", color: "#8B5CF6" },
    { name: "Ausiliario", color: "#3B82F6" },
  ],
  retail: [
    { name: "Cassiere", color: "#3B82F6" },
    { name: "Commesso", color: "#10B981" },
    { name: "Magazziniere", color: "#6B7280" },
  ],
  other: [{ name: "Dipendente", color: "#3B82F6" }],
};

export type SectorKey = keyof typeof SECTOR_ROLES;
