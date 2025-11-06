import axios from 'axios';

const api = axios.create({
  // Change this to send requests to our own domain, which will then be proxied.
  baseURL: '/',
});

export default api;