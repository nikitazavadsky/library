export const IN_PROCESSING = "IN_PROCESSING";
export const IN_DELIVERY = "IN_DELIVERY";
export const DELIVERED = "DELIVERED";
export const CANCELED = "CANCELED";

export const ORDER_STATUS_MAP = {
  [IN_PROCESSING]: "In processing",
  [IN_DELIVERY]: "In delivery",
  [DELIVERED]: "Delivered",
  [CANCELED]: "Canceled",
} as const;
