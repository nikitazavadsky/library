export interface PreparedCart {
  items: {
    item_id: number;
    quantity: number;
  }[];
  total: number;
}
