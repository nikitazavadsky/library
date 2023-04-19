export const PENDING = "PENDING";
export const APPROVED = "APPROVED";
export const REJECTED = "REJECTED";

export const ORDER_STATUS_MAP = {
  [PENDING]: "In processing",
  [APPROVED]: "Approved",
  [REJECTED]: "Rejected"
} as const;
