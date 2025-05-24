
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
      handleVoiceCommand(transcript.toLowerCase());
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

  let categoryFound = null;
  for (const phrase in categories) {
    if (transcript.includes(phrase)) {
      categoryFound = categories[phrase];
      const task = transcript.replace("add", "").replace("to " + phrase, "").trim();
      if (task) {
        addTask(categoryFound, task);
        return;
      }
    }
  }
  alert("Couldn't understand. Try something like: Add 'Call AC guy' to this week.");
}

function addManualTask() {
  const input = document.getElementById("manual-task-input");
  const category = document.getElementById("manual-category").value;
  const task = input.value.trim();
  if (task) {
    addTask(category, task);
    input.value = "";
  }
}

function addTask(sectionId, text, save = true) {
  const taskList = document.querySelector(`#${sectionId} .task-list`);
  const div = document.createElement('div');
  div.className = "task";

  const span = document.createElement('span');
  span.className = "task-text";
  span.innerText = text;

  const editBtn = document.createElement('button');
  editBtn.innerText = "✏️";
  editBtn.onclick = () => editTask(span);

  const delBtn = document.createElement('button');
  delBtn.innerText = "🗑️";
  delBtn.onclick = () => completeTask(div);

  div.appendChild(span);
  div.appendChild(editBtn);
  div.appendChild(delBtn);
  taskList.appendChild(div);

  if (save) saveTasks();
}

function completeTask(taskElement) {
  taskElement.classList.add("completed");
  document.getElementById("completed").appendChild(taskElement);
  saveTasks();
}

function editTask(span) {
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
      buttons[0].onclick = () => editTask(newSpan);

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
    "this-week": [],
    "next-week": [],
    "week-after-next": [],
    "completed": []
  };

  for (const section of Object.keys(data)) {
    const tasks = document.querySelectorAll(`#${section} .task`);
    tasks.forEach(task => {
      const text = task.querySelector('.task-text')?.innerText || task.innerText;
      data[section].push(text);
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
