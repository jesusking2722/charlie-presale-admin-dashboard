const API_ORIGINAL_ENDPOINT =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api-admin";

// Function to get headers including Authorization token
const getHeaders = () => {
  const token = localStorage.getItem("Authorization");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: token } : {}),
  };
};

// Function to make a fetch request
const fetchInstance = async (apiEndpoint: string, options: any) => {
  const api = API_ORIGINAL_ENDPOINT + apiEndpoint;
  try {
    const response = await fetch(api, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Function to set or remove auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("Authorization", token);
  } else {
    localStorage.removeItem("Authorization");
  }
};

export default fetchInstance;
