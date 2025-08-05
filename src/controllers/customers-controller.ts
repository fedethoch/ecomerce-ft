"use server";

import { actionHandler } from "@/lib/handlers/actionHandler";
import { CustomerService } from "@/services/customers-service";
import { CustomerType } from "@/types/customers/type";
import { AppActionError } from "@/types/types";

export const getCustomers = async (): Promise<CustomerType[] | AppActionError> => {
  return actionHandler(async () => {
    // Crear nueva instancia del servicio en cada ejecución
    const customerService = new CustomerService();
    return customerService.getCustomers();
  });
};