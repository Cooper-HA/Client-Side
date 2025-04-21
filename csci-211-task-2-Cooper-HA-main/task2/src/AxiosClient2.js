//import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";  //errors out

//import { AxiosInstance } from "axios"; //errors out
import axios from "axios";

function AxiosClient2 (token= null) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    : {
        "Content-Type": "multipart/form-data",
      };

  const client = axios.create({
    baseURL: "https://quizdb-ad0a2-default-rtdb.firebaseio.com",
    headers,
    timeout: 60000,
    withCredentials: false,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      try {
        const { response } = error;
        if (response?.status === 401) {
          localStorage.removeItem("ACCESS_TOKEN");
        }
      } catch (e) {
        console.error(e);
      }
      throw error;
    }
  );

  return client;
};

export default AxiosClient2;