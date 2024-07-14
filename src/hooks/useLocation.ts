import * as Location from 'expo-location';
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const useLocation = () => {
  const [enabled, setEnabled] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ['location'],
    queryFn: () => Location.getCurrentPositionAsync(),
    enabled,
  });
  
  useEffect(() => {
    if (!enabled) {
      (async () => {
        const location = await Location.requestForegroundPermissionsAsync()
        if (location.granted) {
          setEnabled(true);
        }
      })()
    }
  }, []);
  
  return { location: data, isPending, error };
};

export default useLocation;