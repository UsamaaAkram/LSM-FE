import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = API_URL + "/api";

const chatUserApi = {
  fetchAllChatUsers: async () => {
    const res = await axios.get(`${BASE_URL}/chat/users`);
    return res.data;
  }
};

export default chatUserApi;