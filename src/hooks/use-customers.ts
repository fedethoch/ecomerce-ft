import { useState, useEffect } from "react";
import { getCustomers } from "@/controllers/customers-controller";
import type { CustomerType } from "@/types/customers/type";
import { AppActionError } from "@/types/types";

const isAppActionError = (value: unknown): value is AppActionError => {
  return (value as AppActionError)?.statusCode !== undefined;
};

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();

      if (isAppActionError(data)) {
        setError(data.userMessage || data.message);
        setCustomers([]);
        return;
      }

      setCustomers(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar clientes");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers
  };
}