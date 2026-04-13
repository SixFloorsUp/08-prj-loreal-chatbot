/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent =
  "👋 Welcome to L'Oréal's chatbot! How can I help you today?";

// System message to guide AI behavior - only answer beauty-related questions
const systemMessage = {
  role: "system",
  content:
    "You are a helpful beauty and skincare assistant for L'Oréal. You can only answer questions about haircare, skincare, facecare, makeup, beauty products, and beauty routines. If someone asks about topics outside of beauty and personal care, politely let them know that you can only help with beauty-related questions and encourage them to ask about haircare, skincare, or other beauty topics.",
};

// Store conversation history
const messages = [];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message from input
  const userMessage = userInput.value.trim();

  // Don't process if input is empty
  if (!userMessage) return;

  // Add user's message to conversation history
  messages.push({ role: "user", content: userMessage });

  // Display user's message in the chat window
  chatWindow.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;

  // Clear the input field
  userInput.value = "";

  // Show loading message
  chatWindow.innerHTML += `<div><strong>AI:</strong> Thinking...</div>`;

  // Send a POST request to the OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", // We are POST-ing data to the API
    headers: {
      "Content-Type": "application/json", // Set the content type to JSON
      Authorization: `Bearer ${apiKey}`, // Include the API key for authorization
    },
    // Send model details and conversation history with system message
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [systemMessage, ...messages], // Include system message first, then conversation history
    }),
  });

  // Parse and store the response data
  const result = await response.json();

  // Get AI's response from the result
  const aiResponse = result.choices[0].message.content;

  // Add AI's response to conversation history
  messages.push({ role: "assistant", content: aiResponse });

  // Remove the "Thinking..." message
  const allDivs = chatWindow.querySelectorAll("div");
  allDivs[allDivs.length - 1].remove();

  // Display AI's response with preserved line breaks
  const responseDiv = document.createElement("div");
  responseDiv.innerHTML = `<strong>AI:</strong> ${aiResponse.replace(/\n/g, "<br>")}`;
  responseDiv.style.whiteSpace = "pre-wrap"; // Preserve spacing
  chatWindow.appendChild(responseDiv);
});
