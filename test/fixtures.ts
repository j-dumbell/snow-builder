export type Users = {
  user_id: number;
  email: string;
  is_verified: boolean;
  first_name: string;
  last_name: string;
};

export type Orders = {
  order_id: number;
  user_id: number;
  order_date: Date;
  total: number;
};

export type OrderItems = {
  order_id: number;
  sku: string;
  quantity: number;
  line_total: number;
};

export type AllTables = {
  users: Users;
  orders: Orders;
  order_items: OrderItems;
};