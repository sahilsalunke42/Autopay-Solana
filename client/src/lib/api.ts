import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL?? "https://autopay-solana.onrender.com";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});


export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}
