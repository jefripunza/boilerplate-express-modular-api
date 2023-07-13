import https from 'https';
import axios from 'axios';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
axiosInstance.defaults.headers['Content-type'] = 'application/json';
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong!'
    )
);

export default axiosInstance;
