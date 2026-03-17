import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBase";

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export default adminApi;
