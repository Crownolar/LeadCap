
// Product Categories - Map variants to categories
export const productCategories = {
  COSMETICS: {
    name: "Cosmetics",
    variants: {
      TIRO: "Tiró/Kohl",
      TIRO_RGSTD: "Tiró/Kohl (Registered)",
      CULTURAL_POWDER: "Cultural Powder",
      LIPSTICK: "Lipstick",
      HAIR_DYE: "Hair Dye",
      EYE_PENCIL: "Eye Pencil",
      NAIL_POLISH: "Nail Polish",
      SKIN_LOTION: "Skin Lotion",
    }
  },
  SOIL: {
    name: "Soil",
    variants: {}
  },
  WATER: {
    name: "Water",
    variants: {}
  },
  PAINT: {
    name: "Paint",
    variants: {}
  },
  FOOD: {
    name: "Food",
    variants: {}
  }
};

// Legacy support
export const productTypes = {
  TIRO: "Tiró/Kohl",
  TIRO_RGSTD: "Tiró/Kohl (Registered)",
  CULTURAL_POWDER: "Cultural Powder",
  LIPSTICK: "Lipstick",
  HAIR_DYE: "Hair Dye",
  EYE_PENCIL: "Eye Pencil",
  NAIL_POLISH: "Nail Polish",
  SKIN_LOTION: "Skin Lotion",
};

export const vendorTypes = [
  "DISTRIBUTOR",
  "MANUFACTURER",
  "STREET_VENDOR",
  "MARKET_STALL",
  "RETAIL_SHOP",
  "PHARMACY",
  "SUPERMARKET",
  "BEAUTY_STORE",
  "OTHER",
];

export const sampleTypes = [
  { value: "SOLID", label: "Solid (mg/kg)" },
  { value: "LIQUID", label: "Liquid (mg/L)" }
];

export const marketSources = [
  { value: "PREDEFINED", label: "Predefined Market" },
  { value: "MANUAL", label: "Manual Entry" }
];

// Chart colors
export const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]