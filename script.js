
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
