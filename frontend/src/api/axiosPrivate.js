import axios from "axios";

const STORAGE_KEY = "token";
axios.defaults.baseURL = 'https://honk.guru/api';
// axios.defaults.baseURL = 'https://bvb-webapp.com/api2';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log("error >>> ", error);
    if (
      error.response.status == 401 &&
      error.response.data.status == "fail" &&
      error.response.data.message.name == "TokenExpiredError"
    ) {
      window.location.href = "/auth";
    } else {
      return Promise.reject(error);
    }
  }
);

export const axiosPrivate = axios;
