"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTwitterAccounts } from "../api";

export function useTwitterAccounts() {
  return useQuery({
    queryKey: ["twitter-accounts"],
    queryFn: fetchTwitterAccounts,
  });
}
