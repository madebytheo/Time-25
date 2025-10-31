class Timer {
  // private state
  #second = 1000;
  #minute = 60;
  #workLength;
  #breakLength;
  #remainingSeconds;
  #sessionInterval;
  #running;
  #isWorkSession;
  // private dom elements
  #timerEl;
  #playPauseBtnEl;
  #playPauseIconEl;
  #badgeEl;
  #resetBtnEl;
  #alarmAudio;

  /**
   * @param {Object} of options (optional) - config for selectors and session lengths
   */
  constructor({
    timerSelector = "#timer",
    playPauseBtnSelector = "#play-pause-button",
    playPauseIconSelector = "#play-pause-button-icon",
    badgeSelector = "#session-badge",
    resetBtnSelector = "#reset-button",
    workSessionLength = 0.25,
    breakSessionLength = 0.25,
    alarmSrc = "./assets/alarms/funny-alarm.mp3",
  } = {}) {
    // state
    this.#workLength = workSessionLength;
    this.#breakLength = breakSessionLength;
    this.#remainingSeconds = this.#workLength * this.#minute;
    this.#sessionInterval = null;
    this.#running = false;
    this.#isWorkSession = true;
    // dom elements
    this.#timerEl = document.querySelector(timerSelector);
    this.#playPauseBtnEl = document.querySelector(playPauseBtnSelector);
    this.#playPauseIconEl = document.querySelector(playPauseIconSelector);
    this.#badgeEl = document.querySelector(badgeSelector);
    this.#resetBtnEl = document.querySelector(resetBtnSelector);
    this.#alarmAudio = new Audio(alarmSrc);
    // ui initialization
    this.#updateDisplayTime();
    this.#setPlayPauseIconElVariant("play");
    this.#updateBadgeElState("Let's Go!", "default");
    // hook up event listeners
    this.#bindEvents();
  }

  start() {
    if (this.#running) return;
    this.#running = true;
    this.#setPlayPauseIconElVariant("pause");
    this.#badgeEl.classList.add("running");
    this.#sessionInterval = setInterval(() => this.#tick(), this.#second);
  }
  pause() {
    if (!this.#running) return;
    clearInterval(this.#sessionInterval);
    this.#sessionInterval = null;
    this.#running = false;
    this.#setPlayPauseIconElVariant("play");
    this.#timerEl.classList.remove("running");
  }
  reset() {
    this.pause();
    this.#isWorkSession = true;
    this.#remainingSeconds = this.#workLength * this.#minute;
    this.#updateDisplayTime();
    this.#updateBadgeElState("Let's Go!", "default");
    this.#alarmAudio.pause();
    this.#alarmAudio.currentTime = 0;
  }
  isRunning() {
    return this.#running;
  }

  // private methods
  #tick() {
    if (this.#remainingSeconds > 0) {
      this.#remainingSeconds--;
      this.#updateDisplayTime();
    } else {
      this.#alarmAudio.play();
    }
  }
  #switchSession() {
    this.#isWorkSession = !this.#isWorkSession;
    const length = this.#isWorkSession ? this.#workLength : this.#breakLength;
    const badgeText = this.#isWorkSession ? "Work" : "Break";
    const badgeState = this.#isWorkSession ? "work" : "break";
    this.#remainingSeconds = length * this.#minute;
    this.#updateBadgeElState(badgeText, badgeState);
    this.#updateDisplayTime();
    this.start();
  }
  #updateDisplayTime() {
    const mm = String(Math.floor(this.#remainingSeconds / 60)).padStart(2, "0");
    const ss = String(this.#remainingSeconds % 60).padStart(2, "0");
    this.#timerEl.textContent = `${mm}:${ss}`;
  }
  #updateBadgeElState(text, state) {
    this.#badgeEl.classList.remove(
      "badge--default",
      "badge--work",
      "badge--break"
    );
    this.#badgeEl.textContent = text;
    this.#badgeEl.classList.add(`badge--${state}`);
  }
  #setPlayPauseIconElVariant(variant) {
    this.#playPauseIconEl.setAttribute("name", variant);
    this.#playPauseIconEl.classList.toggle(
      "fix-off-center",
      variant === "play"
    );
  }
  #bindEvents() {
    this.#playPauseBtnEl.addEventListener("click", () => {
      // play pause functionality for the alarmAudio
      if (
        !this.#alarmAudio.paused &&
        !this.#alarmAudio.ended &&
        this.#alarmAudio.currentTime > 0
      ) {
        this.#alarmAudio.pause();
      }
      // play pause functionality for timerEl
      this.#running ? this.pause() : this.start();
      if (this.#running) {
        const badgeText = this.#isWorkSession ? "Work" : "Break";
        const badgeState = this.#isWorkSession ? "work" : "break";
        this.#updateBadgeElState(badgeText, badgeState);
      }
    });
    this.#alarmAudio.addEventListener("ended", () => {
      this.#switchSession();
    });
    this.#resetBtnEl.addEventListener("click", () => this.reset());
  }
}

// instantiate for plug and play
document.addEventListener("DOMContentLoaded", () => {
  new Timer();
});
