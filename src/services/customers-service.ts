// services/customer-service.ts
import { CustomersRepository } from "@/repository/customer-repository";
import { CustomerType } from "@/types/customers/type";

export class CustomerService {
  async getCustomers(): Promise<CustomerType[]> {
    // Crear instancia del repositorio solo cuando se necesite
    const repository = new CustomersRepository();
    return repository.getCustomers();
  }
}