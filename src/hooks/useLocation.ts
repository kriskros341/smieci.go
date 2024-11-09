import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";

const useLocation = () => {
  const [enabled, setEnabled] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["location"],
    queryFn: () => Location.getCurrentPositionAsync(),
    staleTime: Infinity,
    enabled,
  });

  useEffect(() => {
    if (!enabled) {
      (async () => {
        const location = await Location.requestForegroundPermissionsAsync();
        if (location.granted) {
          setEnabled(true);
        }
      })();
    }
  }, []);

  return { location: data, isPending, error };
};

export default useLocation;
