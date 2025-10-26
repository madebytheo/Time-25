const timerDisplay = document.getElementById("timer");
const playPauseButton = document.getElementById("play-pause-button");
const playPauseIcon = document.getElementById("play-pause-icon");
const appStateBadge = document.getElementById("badge");
const refreshButton = document.getElementById("refresh-button");

const minute = 60; // seconds
let workSessionLength = 25; // minutes
let totalSeconds = workSessionLength * minute;
let interval = null;
let isRunning = false;
const alarm = new Audio("./assets/alarms/funny-alarm.mp3");
let isWorkSession = true;
let breakSessionLength = 5; // minutes

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");

  return `${mm}:${ss}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(totalSeconds);
}

function startTimer() {
  if (interval) return;

  interval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(interval);
      interval = null;
      isRunning = false;
      playPauseButton.setAttribute("disabled", "true");
      alarm.play();
      setPlayPauseIcon(true);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function setPlayPauseIcon(isPlay) {
  if (isPlay) {
    playPauseIcon.setAttribute("name", "play");
    playPauseIcon.style.marginLeft = "3px";
  } else {
    playPauseIcon.setAttribute("name", "pause");
    playPauseIcon.style.marginLeft = "0";
  }
}

function resetApp() {
  pauseTimer();
  isRunning = false;
  isWorkSession = true;
  workSessionLength = 25; // minutes
  breakSessionLength = 5; // minutes
  totalSeconds = workSessionLength * minute;
  updateTimerDisplay();
  setPlayPauseIcon(true);
  playPauseButton.removeAttribute("disabled");
  appStateBadge.textContent = "Let's Go!";
  appStateBadge.classList.remove("badge--work", "badge--break");
  appStateBadge.classList.add("badge--default");
  alarm.pause();
  alarm.currentTime = 0;
}

// toggle play/pause
playPauseButton.addEventListener("click", () => {
  if (!isRunning) {
    startTimer();
    setPlayPauseIcon(false);
    isRunning = true;

    if (isWorkSession) {
      appStateBadge.textContent = "Work";
      appStateBadge.classList.remove("badge--default");
      appStateBadge.classList.add("badge--work");
    } else {
      appStateBadge.textContent = "Break";
      appStateBadge.classList.remove("badge--work");
      appStateBadge.classList.add("badge--break");
    }
  } else {
    pauseTimer();
    setPlayPauseIcon(true);
    isRunning = false;
  }
});

// on alarm end switch to other application state + start timer
alarm.addEventListener("ended", () => {
  if (isWorkSession) {
    isWorkSession = false;
    appStateBadge.textContent = "Break";
    appStateBadge.classList.remove("badge--work");
    appStateBadge.classList.add("badge--break");
    totalSeconds = breakSessionLength * minute;
    updateTimerDisplay();
    isRunning = true;
    setPlayPauseIcon(false);
    playPauseButton.removeAttribute("disabled");
    startTimer();
  } else {
    isWorkSession = true;
    appStateBadge.textContent = "Work";
    appStateBadge.classList.remove("badge--break");
    appStateBadge.classList.add("badge--work");
    totalSeconds = workSessionLength * minute;
    updateTimerDisplay();
    isRunning = true;
    setPlayPauseIcon(false);
    playPauseButton.removeAttribute("disabled");
    startTimer();
  }
});

refreshButton.addEventListener("click", resetApp);

updateTimerDisplay();
