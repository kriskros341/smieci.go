import axios from "axios";

interface Album {
  id: string;
  title: string;
  artist: string;
  price: number;
}

export const getAlbums = async (): Promise<Album[]> => {
  const response = await axios.get("http://localhost:8080/albums");
  return response.data;
};
