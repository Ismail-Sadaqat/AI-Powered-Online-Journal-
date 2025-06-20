const menu = document.querySelector(".entry-menu");
const menuBtn = document.querySelector(".entry-bottom .btn");
const addBtn = document.querySelector(".add");
const entryForm = document.querySelector(".entry-form");
const formBtn = document.querySelector(".entry-box .btn");
const entryFormBtn = document.querySelector(".entry-form-content button");
const entryFormHeader = document.querySelector(".entry-box header p");

const notes = JSON.parse(localStorage.getItem("notes") || "[]");

let isUpdate = false,
  updateId;

localStorage.clear();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// menuBtn.addEventListener("click", (e) => {
//   e.stopPropagation(); // or e.stopDefault
//   menu.classList.toggle("menu-show");
// });

function showMenu(element) {
  element.nextElementSibling.classList.toggle("menu-show");
}

// document.addEventListener("click", (e) => {
//   console.log(e);
//   console.log(e.target);
// });

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove("menu-show");
  }
  if (!addBtn.contains(e.target) && !entryForm.contains(e.target)) {
    entryForm.classList.remove("entry-form-show");
  }
});

//open popup
addBtn.addEventListener("click", () => {
  entryForm.classList.add("entry-form-show");
});

const formTilte = document.querySelector(".entry-form-content .title input");
const formDesription = document.querySelector(
  ".entry-form-content .description textarea"
);

//close popup
formBtn.addEventListener("click", () => {
  entryForm.classList.remove("entry-form-show");
  formTilte.value = "";
  formDesription.value = "";
});

function showNotes() {
  if (!notes) return;
  document.querySelectorAll(".entry").forEach((div) => div.remove());
  notes.forEach((note, id) => {
    let filterDesc = note.description.replaceAll("\n", "<br/>");
    let liTag = `<div class="entry">
            <p class="entry-title">${note.title}</p>
            <p class="entry-description">${filterDesc}</p>
            <div class="entry-bottom">
              <p class="entry-date">${note.date}</p>
              <span class="material-symbols-outlined btn" onclick="showMenu(this)"> more_horiz </span>

              <ul class="entry-menu">
                <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')">
                  <span class="material-symbols-outlined"> edit </span>
                  <span>Edit</span>
                </li>
                <li onclick="deleteNote(${id})">
                  <span class="material-symbols-outlined">
                    delete_forever
                  </span>
                  <span>Delete</span>
                </li>
              </ul>
            </div>
          </div>`;
    addBtn.insertAdjacentHTML("afterend", liTag);
  });
}
showNotes();

// Add or update a note
entryFormBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let title = formTilte.value.trim(),
    description = formDesription.value.trim();
  if (title || description) {
    let currentDate = new Date(),
      month = months[currentDate.getMonth()],
      day = currentDate.getDate(),
      year = currentDate.getFullYear();
    let noteInfo = { title, description, date: `${month} ${day}, ${year}` };
    if (!isUpdate) {
      notes.push(noteInfo);
    } else {
      isUpdate = false;
      notes[updateId] = noteInfo;
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    formBtn.click();
  }
});

function addNote(title, description) {
  (title = title), (description = description);
  if (title || description) {
    let currentDate = new Date(),
      month = months[currentDate.getMonth()],
      day = currentDate.getDate(),
      year = currentDate.getFullYear();
    let noteInfo = { title, description, date: `${month} ${day}, ${year}` };
    if (!isUpdate) {
      notes.push(noteInfo);
    } else {
      isUpdate = false;
      notes[updateId] = noteInfo;
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    formBtn.click();
  }
}

function deleteNote(noteId) {
  let confirmDel = confirm("Are you sure you want to delete this note?");
  if (!confirmDel) return;
  notes.splice(noteId, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
}

function updateNote(noteId, title, filterDesc) {
  let description = filterDesc.replaceAll("<br/>", "\r\n");
  updateId = noteId;
  isUpdate = true;
  addBtn.click();
  formTilte.value = title;
  formDesription.value = description;
  entryFormBtn.innerText = "Update a Note";
  entryFormHeader.innerText = "Update Note";
}

/*############################*/
/*********** Chatbot **********/
/*############################*/
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input .send-btn");
const chatbox = document.querySelector(".chatbox");
const chatToggler = document.querySelector(".chatbot-toggler");
const chatbotClosebtn = document.querySelector(".close-btn");

let userMessage;
let prompt = `
AI:
  Role:
    You are an intelligent AI assistant designed to extract structured journal entries from transcribed speech and populate a digital journal system accurately.

  Task:
    1. Input Handling:
        You receive a raw text transcript of a spoken journal entry.
        The transcript may describe one or multiple journal entries.

    2. Information Extraction & Formatting:
        For each journal entry mentioned, extract and correct key details:
          - title (a concise, auto-generated summary if not explicitly mentioned)
          - description (cleaned version of the journal content with corrected spelling and grammar)
        Automatically fix any spelling and grammar mistakes in the description.

    3. Handling Multiple Entries:
        If the transcript includes multiple entries, generate a separate object for each one.
        Ensure that each entry is well-formatted and readable.

    4. Output Format:
        Return a pure JSON **array** where each entry is a separate object:
          - Each object must contain "Title" and "Description"
        At the end of the array, always include one final object:
          {
            "Title": "Confirm",
            "Description": "No"
          }
        This final object indicates whether the user has approved the entry. Initially, "Description" must be "No". Once the user confirms, change it to "Yes".

    5. Constraints:
        - Output must be a valid JSON array only, with no extra text or explanations.
        - If a title is missing, generate a suitable one based on the content.
        - Fix all spelling and grammar issues in the description.

  Examples:

  Single entry example:
  Input:
  > "Worked on the homepage layout, fixed mobile view issues, and adjusted padding for buttons."

  Output:
  [
    {
      "Title": "Homepage Layout Update",
      "Description": "Worked on the homepage layout, fixed mobile view issues, and adjusted the padding for buttons."
    },
    {
      "Title": "Confirm",
      "Description": "No"
    }
  ]

  Multiple entries example:
  Input:
  > "This morning I resolved the login error on the admin panel. Then I reviewed the new UI components for the dashboard redesign."

  Output:
  [
    {
      "Title": "Login Error Fix",
      "Description": "Resolved the login error on the admin panel."
    },
    {
      "Title": "Dashboard UI Review",
      "Description": "Reviewed the new UI components for the dashboard redesign."
    },
    {
      "Title": "Confirm",
      "Description": "No"
    }
  ]

`;

let chatHistory = "";

const API_KEY = "AIzaSyCFUFdqwXahS6amIz4MHIRSllrz5AqivZQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and ClassName
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};

//Generate Bot response using API
const generateResponse = async (incomingChatLi) => {
  const messageElement = incomingChatLi.querySelector("p");

  chatHistory += `\nUser: ${userMessage}`;
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: `${prompt}`,
          },
        ],
      },
      contents: [
        {
          parts: [
            {
              text: `${chatHistory}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              Title: { type: "STRING" },
              Description: { type: "STRING" },
            },
            propertyOrdering: ["Title", "Description"],
          },
        },
      },
    }),
  };

  try {
    //Fetch bot response from API
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    console.log(data.candidates[0].content.parts[0].text.trim());
    //const apiResponseText = data.candidates[0].content.parts[0].text.trim();

    const output = data.candidates[0].content.parts[0].text.trim();
    const jsonData = JSON.parse(output);
    console.log(jsonData);

    chatHistory += `\nAI: ${data.candidates[0].content.parts[0].text.trim()}`;

    let aiOutput = "";

    jsonData.forEach((item, index) => {
      if (index === jsonData.length - 1) return;
      aiOutput += `Project ${index + 1}:<br>`;
      aiOutput += `Title: ${item.Title}<br>`;
      aiOutput += `Description: ${item.Description}<br><br>`;
    });

    aiOutput += `Let me know if you'd like me to make any changes. If everything looks good, please confirm and I'll go ahead and create the new journal entry.`;

    const lastItem = jsonData[jsonData.length - 1];
    console.log(lastItem.Description);
    let test = lastItem.Description.toLowerCase().trim();
    if (test == "yes") {
      jsonData.forEach((item, index) => {
        if (index === jsonData.length - 1) return; // Skip the last item

        const title = item.Title;
        const description = item.Description;
        addNote(title, description);
      });
    }

    // jsonData.forEach((item, index) => {
    //   console.log(`Project ${index + 1}:`);
    //   console.log("Title:", item.Title);
    //   console.log("Description:", item.Description);
    //   console.log("--------------------------");
    // });

    console.log(aiOutput);

    messageElement.innerHTML = aiOutput.trim();

    /*
    const jsonString = output.match(/\{[\s\S]*\}/)[0];
    const jsonData = JSON.parse(jsonString);

    jsonData.tasks.forEach((task) => {
      const title = task.title;
      const description = task.description;
      console.log(`Title: ${title}\nDescription: ${description}\n`);
      addNote(title, description);
    });
    */
  } catch (error) {
    //console.log(error);
    messageElement.classList.add("error");
    messageElement.textContent = "Opps! Somthing went wrong";
  } finally {
    () => chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  //Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    //Display "Thinking..." message while waiting for thr response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  //Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
chatbotClosebtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);

/*############################*/
/************* mic ************/
/*############################*/
/* const micBtn = document.getElementById("mic-btn");

// Check for browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.textContent = "mic_off"; // Visual feedback
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    chatInput.value = transcript;
    micBtn.textContent = "mic";
    chatInput.focus();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    micBtn.textContent = "mic";
  };

  recognition.onend = () => {
    micBtn.textContent = "mic";
  };
} else {
  micBtn.style.display = "none"; // Hide button if not supported
  console.warn("Speech Recognition not supported in this browser.");
}*/

const micBtn = document.getElementById("mic-btn");

// Check for browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let isListening = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true; // Try to keep it going
  recognition.interimResults = false;
  recognition.lang = "en-US";

  const micBtn = document.getElementById("mic-btn");

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      recognition.start();
      isListening = true;
      micBtn.textContent = "mic_off";
    } else {
      recognition.stop();
      isListening = false;
      micBtn.textContent = "mic";
    }
  });

  recognition.onresult = (event) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript.trim();
    chatInput.value += (chatInput.value ? " " : "") + transcript;
    chatInput.focus();
  };

  recognition.onend = () => {
    if (isListening) {
      // Auto-restart after silence or timeout
      recognition.start();
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (
      event.error === "not-allowed" ||
      event.error === "service-not-allowed"
    ) {
      alert("Microphone access is blocked.");
      isListening = false;
      micBtn.textContent = "mic";
    }
  };
} else {
  alert("Speech recognition not supported in this browser.");
}
