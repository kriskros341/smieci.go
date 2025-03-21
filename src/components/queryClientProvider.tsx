import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAxios } from "@hooks/use-axios";

const getDefaultFetcher =
  (axios: AxiosInstance) =>
  async ({ queryKey }: { queryKey: unknown[] } & any) => {
    return axios
      .get(queryKey[0])
      .then((response) => response.data)
      .catch((err) => {
        console.error(JSON.stringify(err, null, 2));
        throw err;
      });
};

const CustomQueryClientProvider = (props: any) => {
  // Komponent ten został wydzielony, ponieważ useAxios można wykorzystać jedynie wewnątrz ClerkProvidera
  const axios = useAxios();
  const queryClientRef = useRef<QueryClient>();

  useEffect(() => {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          queryFn: getDefaultFetcher(axios),
        },
      },
    });
  }, [axios]);

  if (!queryClientRef.current) {
    return (
      <View className="flex justify-center items-center">
        <ActivityIndicator color="#10a37f"/>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {props.children}
    </QueryClientProvider>
  );
};

export default CustomQueryClientProvider;
