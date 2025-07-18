
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  const micBtn = document.getElementById("mic-btn");
  const transcriptDisplay = document.getElementById("live-transcript");

  micBtn.classList.add("listening");
  transcriptDisplay.innerText = "Listening...";

  recognition.onresult = function(event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    transcriptDisplay.innerText = transcript;
    if (event.results[0].isFinal) {
      handleVoiceCommand(transcript);
      micBtn.classList.remove("listening");
      transcriptDisplay.innerText = "";
    }
  };

  recognition.onend = function() {
    micBtn.classList.remove("listening");
    if (transcriptDisplay.innerText === "Listening...") {
      transcriptDisplay.innerText = "";
    }
  };

  recognition.start();
}

function handleVoiceCommand(transcript) {
  const categories = {
    "product": "product",
    "process": "process",
    "analytics": "analytics",
    "people": "people",
    "urgent": "urgent",
    "manager": "manager"
  };

  const lowerTranscript = transcript.toLowerCase();
  let matchedCategory = null;
  let phraseToRemove = "";

  // Match category
  for (const phrase in categories) {
    if (
      lowerTranscript.includes("to " + phrase) ||
      lowerTranscript.includes("to the " + phrase) ||
      lowerTranscript.endsWith(" " + phrase)
    ) {
      matchedCategory = categories[phrase];
      phraseToRemove = phrase;
      break;
    }
  }

  // Remove the command phrases from original transcript to preserve casing
  let cleanTask = transcript
    .replace(new RegExp("to " + phraseToRemove, "i"), "")
    .replace(new RegExp("to the " + phraseToRemove, "i"), "")
    .replace(new RegExp(phraseToRemove, "i"), "")
    .replace(/^add\s+/i, "")
    .trim();

  if (!cleanTask) {
    alert("Please say a valid task.");
    return;
  }

  addTask(matchedCategory || "product", cleanTask);
}

function addTask(sectionId, text, save = true) {
  const taskList = document.querySelector(`#${sectionId} .task-list`);
  const div = document.createElement('div');
  div.className = "task";

  const span = document.createElement('span');
  span.className = "task-text";
  span.innerText = text;

  const buttons = document.createElement('div');
  buttons.className = "task-buttons";

  const upBtn = document.createElement('button');
  upBtn.innerText = "⬆️";
  upBtn.onclick = () => moveTask(div, -1);

  const downBtn = document.createElement('button');
  downBtn.innerText = "⬇️";
  downBtn.onclick = () => moveTask(div, 1);

  const toTopBtn = document.createElement('button');
  toTopBtn.innerText = "🔝";
  toTopBtn.onclick = () => moveToTop(div);

  const menuContainer = document.createElement('div');
  menuContainer.className = "menu-container";

  const menuBtn = document.createElement('button');
  menuBtn.innerText = "•••";
  menuBtn.onclick = () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  };

  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = "dropdown-menu";

  const editBtn = document.createElement('button');
  editBtn.innerText = "✏️";
  editBtn.onclick = () => {
  editTask(span, sectionId);
  closeMenu();
};

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = "🗑️";
  deleteBtn.onclick = () => {
  completeTask(div);
  closeMenu();
};

  ["product", "process", "analytics", "people", "urgent", "manager"].forEach(cat => {
    if (cat !== sectionId) {
      const properLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
    const moveBtn = document.createElement('button');
    moveBtn.innerText = `🔁 to ${properLabel}`;
     moveBtn.onclick = () => {
  moveToSection(div, sectionId, cat);
  closeMenu();
};

      dropdownMenu.appendChild(moveBtn);
    }
  });

  dropdownMenu.appendChild(editBtn);
  dropdownMenu.appendChild(deleteBtn);
  menuContainer.appendChild(menuBtn);
  menuContainer.appendChild(dropdownMenu);

  buttons.appendChild(upBtn);
  buttons.appendChild(downBtn);
  buttons.appendChild(toTopBtn);
  buttons.appendChild(menuContainer);

  div.appendChild(span);
  div.appendChild(buttons);
  taskList.appendChild(div);

  if (save) saveTasks();
}

function moveTask(taskElement, direction) {
  const parent = taskElement.parentElement;
  const sibling = direction === -1 ? taskElement.previousElementSibling : taskElement.nextElementSibling;
  if (sibling) {
    parent.insertBefore(taskElement, direction === -1 ? sibling : sibling.nextElementSibling);
    saveTasks();
  }
}

function moveToTop(taskElement) {
  const parent = taskElement.parentElement;
  parent.insertBefore(taskElement, parent.firstChild);
  saveTasks();
}

function moveToSection(taskElement, fromSection, toSection) {
  document.querySelector(`#${toSection} .task-list`).appendChild(taskElement);
  saveTasks();
}

function completeTask(taskElement) {
  taskElement.classList.add("completed");
  document.getElementById("completed").appendChild(taskElement);
  saveTasks();
}

function editTask(span, sectionId) {
  const originalText = span.innerText;
  const input = document.createElement('input');
  input.value = originalText;

  input.onblur = () => {
    const newText = input.value.trim();
    if (newText) {
      const newSpan = document.createElement('span');
      newSpan.className = "task-text";
      newSpan.innerText = newText;

      const parent = input.parentElement;
      parent.replaceChild(newSpan, input);
      const buttons = parent.querySelectorAll("button");
      buttons[0].onclick = () => editTask(newSpan, sectionId);
      saveTasks();
    } else {
      span.innerText = originalText;
      input.parentElement.replaceChild(span, input);
    }
  };

  span.parentElement.replaceChild(input, span);
  input.focus();
}

function saveTasks() {
  const data = {
    "product": [],
    "process": [],
    "analytics": [],
    "people": [],
    "urgent": [],
    "manager": [],
    "completed": []
  };

  for (const section in data) {
    document.querySelectorAll(`#${section} .task`).forEach(task => {
      const text = task.querySelector(".task-text")?.innerText;
      if (text) data[section].push(text);
    });
  }

  localStorage.setItem("jd_work_tasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("jd_work_tasks"));
  if (!data) return;
  for (const [sectionId, tasks] of Object.entries(data)) {
    tasks.forEach(task => addTask(sectionId, task, false));
  }
}

window.onload = loadTasks;

function addManualTask() {
  const input = document.getElementById("manual-task-input");
  const category = document.getElementById("manual-category").value;
  const task = input.value.trim();

  if (!task) {
    alert("Please enter a task.");
    return;
  }

  addTask(category, task);
  input.value = "";
}
