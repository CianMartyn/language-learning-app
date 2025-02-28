import axios from "axios";

const API_KEY = "google-api-key";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

export async function generateLesson(prompt) {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating lesson:", error);
    return "Error generating the lesson.";
  }
}
