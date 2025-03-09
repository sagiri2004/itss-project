import axios from "axios";

const apiClient = axios.create({
  // baseURL: "https://group-web-project-3.onrender.com/api",
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// lay ra token tu localStorage

// seting axios interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  if (token) {
    config.headers
      ? (config.headers.Authorization = `Bearer ${token}`)
      : (config.headers = { Authorization: `Bearer ${token}` });
  }
  return config;
});

// neu token het han, thi logout va chuyen huong ve trang login
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
