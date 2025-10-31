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
  #localStorageKey = "t25-duration-settings";
  // private dom elements
  #timerEl;
  #playPauseBtnEl;
  #playPauseIconEl;
  #badgeEl;
  #resetBtnEl;
  #alarmAudio;
  #editBtnEl;
  #modalEl;
  #modalOverlayEl;
  #modalCancelBtnEl;
  #modalSaveBtnEl;
  #modalWorkInputEl;
  #modalBreakInputEl;

  /**
   * @param {Object} of options (optional) - config for selectors and session lengths
   */
  constructor({
    timerSelector = "#timer",
    playPauseBtnSelector = "#play-pause-button",
    playPauseIconSelector = "#play-pause-button-icon",
    badgeSelector = "#session-badge",
    resetBtnSelector = "#reset-button",
    workSessionLength = 25,
    breakSessionLength = 5,
    alarmSrc = "./assets/alarms/funny-alarm.mp3",
    editBtnSelector = "#edit-button",
    modalSelector = "#settings-modal",
    modalOverlaySelector = "#settings-overlay",
    modalCancelBtnSelector = "#cancel-settings",
    modalSaveBtnSelector = "#save-settings",
    modalWorkInputSelector = "#work-length",
    modalBreakInputSelector = "#break-length",
  } = {}) {
    const storedData = this.#loadSessionSettings();
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
    this.#editBtnEl = document.querySelector(editBtnSelector);
    this.#modalEl = document.querySelector(modalSelector);
    this.#modalOverlayEl = document.querySelector(modalOverlaySelector);
    this.#modalCancelBtnEl = document.querySelector(modalCancelBtnSelector);
    this.#modalSaveBtnEl = document.querySelector(modalSaveBtnSelector);
    this.#modalWorkInputEl = document.querySelector(modalWorkInputSelector);
    this.#modalBreakInputEl = document.querySelector(modalBreakInputSelector);
    // ui initialization
    this.#updateDisplayTime();
    this.#setPlayPauseIconElVariant("play");
    this.#updateBadgeElState("Let's Go!", "default");
    // hook up event listeners
    this.#bindEvents();
  }

  #start() {
    if (this.#running) return;
    this.#running = true;
    this.#setPlayPauseIconElVariant("pause");
    this.#timerEl.classList.add("running");
    this.#sessionInterval = setInterval(() => this.#tick(), this.#second);
  }
  #pause() {
    if (!this.#running) return;
    clearInterval(this.#sessionInterval);
    this.#sessionInterval = null;
    this.#running = false;
    this.#setPlayPauseIconElVariant("play");
    this.#timerEl.classList.remove("running");
  }
  #reset() {
    this.#pause();
    this.#isWorkSession = true;
    this.#remainingSeconds = this.#workLength * this.#minute;
    this.#updateDisplayTime();
    this.#updateBadgeElState("Let's Go!", "default");
    this.#alarmAudio.pause();
    this.#alarmAudio.currentTime = 0;
  }
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
    this.#start();
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
      this.#running ? this.#pause() : this.#start();
      if (this.#running) {
        const badgeText = this.#isWorkSession ? "Work" : "Break";
        const badgeState = this.#isWorkSession ? "work" : "break";
        this.#updateBadgeElState(badgeText, badgeState);
      }
    });
    this.#alarmAudio.addEventListener("ended", () => {
      this.#switchSession();
    });
    this.#resetBtnEl.addEventListener("click", () => this.#reset());
    this.#editBtnEl.addEventListener("click", () => {
      this.#modalEl.classList.add("active");
    });
    // TODO: figure out reusable method for below
    this.#modalOverlayEl.addEventListener("click", () => {
      this.#modalEl.classList.remove("active");
    });
    this.#modalCancelBtnEl.addEventListener("click", () => {
      this.#modalEl.classList.remove("active");
    });
    //! not part of comment mentioned above
    this.#modalSaveBtnEl.addEventListener("click", () => {
      const workMinutes = Number(this.#modalWorkInputEl.value);
      const breakMinutes = Number(this.#modalBreakInputEl.value);

      if (typeof workMinutes === "number" && typeof breakMinutes === "number") {
        this.#setSessionLength(workMinutes, breakMinutes);
      } else {
        console.error("Error settings session lengths!");
      }
    });
  }
  #setSessionLength(workLength, breakLength) {
    this.#workLength = workLength;
    this.#breakLength = breakLength;
    this.#saveSessionSettings();
    this.#modalEl.classList.remove("active");
    this.#reset();
  }
  #loadSessionSettings() {
    try {
      const json = localStorage.getItem(this.#localStorageKey);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error("Failed to load session settings:", err);
      return null;
    }
  }
  #saveSessionSettings() {
    try {
      const data = {
        work: this.#workLength,
        break: this.#breakLength,
      };
      localStorage.setItem(this.#localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save session settings:", err);
    }
  }
}

// instantiate for plug and play
document.addEventListener("DOMContentLoaded", () => {
  new Timer();
});
