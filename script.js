
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
    "this week": "this-week",
    "next week": "next-week",
    "week after next": "week-after-next"
  };

  const lowerTranscript = transcript.toLowerCase();

  for (const phrase in categories) {
    if (lowerTranscript.includes(phrase)) {
      const trimmedTask = transcript
        .replace(/add/i, "")
        .replace(new RegExp("to " + phrase, "i"), "")
        .replace(/this week$/i, "")
        .replace(/next week$/i, "")
        .replace(/week after next$/i, "")
        .trim();
      addTask(categories[phrase], trimmedTask);
      return;
    }
  }

  alert("Couldn't understand. Try something like: Add 'Call AC guy' to this week.");
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
  editBtn.onclick = () => editTask(span, sectionId);

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = "🗑️";
  deleteBtn.onclick = () => completeTask(div);

  ["this-week", "next-week", "week-after-next"].forEach(cat => {
    if (cat !== sectionId) {
      const moveBtn = document.createElement('button');
      moveBtn.innerText = "🔁 to " + cat.replace("-", " ");
      moveBtn.onclick = () => moveToSection(div, sectionId, cat);
      dropdownMenu.appendChild(moveBtn);
    }
  });

  dropdownMenu.appendChild(editBtn);
  dropdownMenu.appendChild(deleteBtn);
  menuContainer.appendChild(menuBtn);
  menuContainer.appendChild(dropdownMenu);

  buttons.appendChild(upBtn);
  buttons.appendChild(downBtn);
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

function rollNextWeek() {
  const nextTasks = document.querySelectorAll("#next-week .task");
  const thisList = document.querySelector("#this-week .task-list");
  nextTasks.forEach(task => thisList.appendChild(task));
  saveTasks();
}

function rollWeekAfterNext() {
  const afterTasks = document.querySelectorAll("#week-after-next .task");
  const nextList = document.querySelector("#next-week .task-list");
  afterTasks.forEach(task => nextList.appendChild(task));
  saveTasks();
}

function saveTasks() {
  const data = {
    "this-week": [],
    "next-week": [],
    "week-after-next": [],
    "completed": []
  };

  for (const section in data) {
    document.querySelectorAll(`#${section} .task`).forEach(task => {
      const text = task.querySelector(".task-text")?.innerText;
      if (text) data[section].push(text);
    });
  }

  localStorage.setItem("jd_tasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("jd_tasks"));
  if (!data) return;
  for (const [sectionId, tasks] of Object.entries(data)) {
    tasks.forEach(task => addTask(sectionId, task, false));
  }
}

window.onload = loadTasks;
