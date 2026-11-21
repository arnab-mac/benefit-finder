import { queryOptions } from "@tanstack/react-query";
import { getScheme, listSchemes } from "./schemes.functions";
import { getAccount } from "./account.functions";

export const schemesQuery = () =>
  queryOptions({ queryKey: ["schemes"], queryFn: () => listSchemes(), staleTime: 5 * 60_000 });

export const schemeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["scheme", slug],
    queryFn: () => getScheme({ data: { slug } }),
    staleTime: 5 * 60_000,
  });

export const accountQuery = () =>
  queryOptions({ queryKey: ["account", "all"], queryFn: () => getAccount() });
