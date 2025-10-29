/**
 * dom elements
 */
const timerDisplay = document.getElementById("timer");
const playPauseButton = document.getElementById("play-pause-button");
const playPauseIcon = document.getElementById("play-pause-icon");
const appStateBadge = document.getElementById("badge");
const resetButton = document.getElementById("reset-button");

/**
 * state
 */
const minute = 60; // seconds
let workSessionLength = 25; // minutes
let totalSeconds = workSessionLength * minute;
let interval = null;
let isRunning = false;
const alarm = new Audio("./assets/alarms/funny-alarm.mp3");
let isWorkSession = true;
let breakSessionLength = 5; // minutes

/**
 * timer functions
 */
function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");

  return `${mm}:${ss}`;
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
      alarm.play();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(totalSeconds);
}

function switchSession(startNewWorkSession) {
  isWorkSession = startNewWorkSession;
  const sessionLength = isWorkSession ? workSessionLength : breakSessionLength;
  const badgeText = isWorkSession ? "Work" : "Break";
  const badgeState = isWorkSession ? "work" : "break";
  updateBadgeState(badgeText, badgeState);
  totalSeconds = sessionLength * minute;
  updateTimerDisplay();
  isRunning = true;
  setBtnIconToPlay(false);
  startTimer();
}

/**
 * utility functions
 */

function updateBadgeState(badgeText, newState) {
  appStateBadge.classList.remove(
    "badge--default",
    "badge--work",
    "badge--break"
  );
  appStateBadge.classList.add(`badge--${newState}`);
  appStateBadge.textContent = badgeText;
}

function setBtnIconToPlay(isPlay) {
  if (isPlay) {
    playPauseIcon.setAttribute("name", "play");
    playPauseIcon.classList.add("fix-off-center");
  } else {
    playPauseIcon.setAttribute("name", "pause");
    playPauseIcon.classList.remove("fix-off-center");
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
  setBtnIconToPlay(true);
  updateBadgeState("Let's Go!", "default");
  alarm.pause();
  alarm.currentTime = 0;
}

function isAlarmPlaying(audio) {
  return !audio.paused && !audio.ended && audio.currentTime > 0;
}

/**
 * event listeners
 */
playPauseButton.addEventListener("click", () => {
  // case 1: alarm is currently playing
  if (isAlarmPlaying(alarm)) {
    alarm.pause();
    setBtnIconToPlay(true);
    return;
  }

  // case 2: normal timer control
  if (!isRunning) {
    startTimer();
    setBtnIconToPlay(false);
    isRunning = true;

    if (isWorkSession) {
      updateBadgeState("Work", "work");
    } else {
      updateBadgeState("Break", "break");
    }
  } else {
    pauseTimer();
    setBtnIconToPlay(true);
    isRunning = false;
  }
});

alarm.addEventListener("ended", () => {
  switchSession(!isWorkSession);
});

resetButton.addEventListener("click", resetApp);

/**
 * app start
 */
updateTimerDisplay();
