import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: 'https://honk.guru/api',
  headers: {
    "Content-Type": "application/json",
  },
});