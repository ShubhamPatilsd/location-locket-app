import { useAuth } from "@clerk/clerk-expo";
import { transformer, type AppRouter } from "@memoir/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React from "react";

export const trpc = createTRPCReact<AppRouter>();

export const TRPCProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getToken } = useAuth();
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          async headers() {
            const authToken = await getToken();
            return {
              Authorization: authToken ?? undefined,
            };
          },
          url: `http://localhost:5000/api/trpc`,
          transformer,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
