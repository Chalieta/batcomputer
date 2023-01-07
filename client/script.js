import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// Function that loads our messages
function loader(element) {
  element.textContent = " ";
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === " ....") {
      element.textContent = " ";
    }
  }, 300);
}

// Function that animates the typing of the AI
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Function that generates unique ID for every message (for mapping purpose)
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
            />
          </div>
          <div class="message" id=${uniqueId}> ${value} </div>
        </div>
      </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault(); // Prevents the browser from reloading the page
  const data = new FormData(form);

  // Displaying user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // Displaying bot's chat stripe (still empty)
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight; // To put the new message in view

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv); // Displaying bot's loading (...) animation

  // Fetch data from server (bot's answer)
  const response = await fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ""; // Clear the messageDiv from the loading animation

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData); // Displaying the typing animation
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit); // Submit when submit button is pressed
form.addEventListener("keyup", (e) => {
  // Submit when enter (on keyboard) is pressed
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
