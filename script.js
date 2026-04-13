/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent =
  "👋 Welcome to L'Oréal's Beauty Bot! How can I help you today?";

// System message to guide AI behavior - only answer beauty-related questions
const systemMessage = {
  role: "system",
  content:
    "You are a helpful beauty and skincare assistant for L'Oréal. You can only answer questions about haircare, skincare, facecare, makeup, beauty products, and beauty routines. If someone asks about topics outside of beauty and personal care, politely let them know that you can only help with beauty-related questions and encourage them to ask about haircare, skincare, or other beauty topics. Be friendly, informative, short and concise in your responses. Always provide helpful advice and product recommendations when relevant to the user's beauty questions.",
};

// Store conversation history
const messages = [];

const workerUrl = "https://lorealchatbot.pdemerin.workers.dev"; // Replace with your Cloudflare Worker URL
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
  chatWindow.innerHTML += `<div><strong>Beauty Bot:</strong> Thinking...</div>`;

  try {
    // Send a POST request to the Cloudflare Worker (which calls OpenAI)
    const response = await fetch(workerUrl, {
      method: "POST", // We are POST-ing data to the worker
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
      },
      // Send conversation history with system message to the worker
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
        max_completion_tokens: 1000,
        max_tokens: 800,
        temperature: 0.2,
        frequency_penalty: 0.5, // Include system message first, then conversation history
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

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
    responseDiv.innerHTML = `<strong>Beauty Bot:</strong> ${aiResponse.replace(/\n/g, "<br>")}`;
    responseDiv.style.whiteSpace = "pre-wrap"; // Preserve spacing
    chatWindow.appendChild(responseDiv);
  } catch (error) {
    // Log the error to the console for debugging
    console.error("Error communicating with the chatbot:", error);

    // Remove the "Thinking..." message
    const allDivs = chatWindow.querySelectorAll("div");
    allDivs[allDivs.length - 1].remove();

    // Show error message to the user
    chatWindow.innerHTML += `<div><strong>Beauty Bot:</strong> Sorry, something went wrong. Please try again later.</div>`;

    // Remove the last user message from history since the request failed
    messages.pop();
  }
});

/* Theme Toggle Functionality */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector(".material-icons");

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light";

// Apply the saved theme on page load
if (currentTheme === "dark") {
  document.body.classList.add("dark-theme");
  themeIcon.textContent = "light_mode";
}

// Toggle theme when button is clicked
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  // Update icon and save preference
  if (document.body.classList.contains("dark-theme")) {
    themeIcon.textContent = "light_mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.textContent = "dark_mode";
    localStorage.setItem("theme", "light");
  }
});
