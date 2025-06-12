
const micBtn = document.getElementById("mic-btn");
const transcriptDisplay = document.getElementById("live-transcript");

micBtn.addEventListener("click", startListening);

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    let finalTranscript = "";

    transcriptDisplay.innerText = "Listening...";

    recognition.onresult = function(event) {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        transcriptDisplay.innerText = finalTranscript || interimTranscript;
    };

    recognition.onend = function() {
        handleVoiceCommand(transcriptDisplay.innerText.trim().toLowerCase());
    };

    recognition.start();
}

function handleVoiceCommand(command) {
    if (command.includes("show me tasks for today")) {
        filterTasks("today");
    } else if (command.includes("show me tasks for tomorrow")) {
        filterTasks("tomorrow");
    } else if (command.includes("show me tasks for this week")) {
        filterTasks("thisWeek");
    } else if (command.includes("show me tasks for next two weeks")) {
        filterTasks("nextTwoWeeks");
    } else if (command.includes("show me tasks for this month")) {
        filterTasks("thisMonth");
    } else if (command.includes("clear filters")) {
        clearFilters();
    } else {
        console.log("Adding new task:", command);
        addTask(command, "Product"); // default category
    }
}

function addTask(text, category) {
    const date = extractDate(text);
    const container = document.getElementById("category-" + category);
    const task = document.createElement("div");
    task.className = "task-item";
    if (date) task.dataset.date = date;
    task.innerText = text;
    container.appendChild(task);
}

function extractDate(text) {
    const today = new Date();
    if (text.includes("today")) return today.toISOString().split("T")[0];
    if (text.includes("tomorrow")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    }
    const match = text.match(/june\s(\d{1,2})/i);
    if (match) {
        const day = match[1].padStart(2, '0');
        return `2025-06-${day}`;
    }
    return null;
}

function filterTasks(type) {
    const tasks = document.querySelectorAll(".task-item");
    const today = new Date();
    const dateFormat = (d) => d.toISOString().split("T")[0];

    let fromDate, toDate;
    if (type === "today") {
        fromDate = toDate = dateFormat(today);
    } else if (type === "tomorrow") {
        const t = new Date(); t.setDate(t.getDate() + 1);
        fromDate = toDate = dateFormat(t);
    } else if (type === "thisWeek") {
        const start = new Date(today); start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        fromDate = dateFormat(start); toDate = dateFormat(end);
    } else if (type === "nextTwoWeeks") {
        const start = new Date(today);
        const end = new Date(start); end.setDate(start.getDate() + 13);
        fromDate = dateFormat(start); toDate = dateFormat(end);
    } else if (type === "thisMonth") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fromDate = dateFormat(start); toDate = dateFormat(end);
    } else {
        return;
    }

    for (const task of tasks) {
        const taskDate = task.dataset.date;
        if (!taskDate || taskDate < fromDate || taskDate > toDate) {
            task.style.display = "none";
        } else {
            task.style.display = "block";
        }
    }
}

function clearFilters() {
    document.querySelectorAll(".task-item").forEach(task => {
        task.style.display = "block";
    });
}
