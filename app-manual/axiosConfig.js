import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://safealert-01s0.onrender.com',
  withCredentials: true
});

export default axiosInstance;

