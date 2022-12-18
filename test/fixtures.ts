export type Users = {
  userId: number;
  email: string;
  isVerified: boolean;
};

export type Orders = {
  orderId: number;
  userId: number;
  orderDate: Date;
};

export type OrderItems = {
  orderId: number;
  sku: number;
  quantity: number;
  price: number;
};

export type AllTables = {
  users: Users;
  orders: Orders;
  order_items: OrderItems;
};
