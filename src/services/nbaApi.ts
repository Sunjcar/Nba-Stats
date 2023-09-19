// src/services/nbaApi.ts
import axios from 'axios';

const BASE_URL = 'https://www.balldontlie.io/api/v1/season_averages';

// Fetch current Portland Trail Blazers players
export const fetchBlazersPlayers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    console.log(response.data); // Log the response data to the console
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
