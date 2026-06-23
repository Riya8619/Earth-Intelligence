const API_URL = "http://127.0.0.1:8000";

export const api = {
  get: async (url) => {
    const res = await fetch(`${API_URL}${url}`);
    return res.json();
  },

  post: async (url, data) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    return res.json();
  }
};