// types/customers/customers.ts
export type CustomerType = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  createdAt: string; // Fecha en formato ISO
};