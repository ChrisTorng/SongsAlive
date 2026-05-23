import { Utils } from './utils.js';
import { YTPlayer } from './ytplayer.js';
export class YouTubePlayer {
    volumeValue = document.getElementById('volumeValue');
    volumeUpButton = document.getElementById('volumeUpButton');
    volumeDownButton = document.getElementById('volumeDownButton');
    muteButton = document.getElementById('muteButton');
    control = document.getElementById('control');
    allSections = document.getElementById('allSections');
    currentSectionTitle = document.getElementById('currentSectionTitle');
    currentSectionDuration = document.getElementById('currentSectionDuration');
    currentSectionDetail = document.getElementById('currentSectionDetail');
    nextSectionTitle = document.getElementById('nextSectionTitle');
    nextSectionDuration = document.getElementById('nextSectionDuration');
    nextSectionDetail = document.getElementById('nextSectionDetail');
    songProgressBar = document.getElementById('songProgressBar');
    songProgressFill = document.getElementById('songProgressFill');
    songProgressTime = document.getElementById('songProgressTime');
    segmentProgressBar = document.getElementById('segmentProgressBar');
    segmentProgressFill = document.getElementById('segmentProgressFill');
    segmentProgressTime = document.getElementById('segmentProgressTime');
    skipTime = 0.1;
    song;
    fullplayer;
    player;
    full;
    timerId;
    progressTimerId;
    currentSection = 0;
    nextSection = 0;
    isSongReady = false;
    onSongReady;
    constructor() {
        this.initializeEventHandlers();
    }
    initializeEventHandlers() {
        document.getElementById('fullScreenToggleButton')
            .addEventListener('click', this.onFullScreenToggle.bind(this));
        document.getElementById('playButton')
            .addEventListener('click', this.onPlayButton.bind(this));
        document.getElementById('pauseButton')
            .addEventListener('click', this.onPauseButton.bind(this));
        this.volumeUpButton.addEventListener('click', this.onVolumeUpButton.bind(this));
        this.volumeDownButton.addEventListener('click', this.onVolumeDownButton.bind(this));
        this.muteButton.addEventListener('click', this.onMuteButton.bind(this));
        this.songProgressBar.addEventListener('click', this.onSongProgressBar.bind(this));
        this.segmentProgressBar.addEventListener('click', this.onSegmentProgressBar.bind(this));
    }
    setSelectSections() {
        const selectSections = document.getElementsByClassName('selectSection');
        Array.from(selectSections).forEach((li) => {
            li.addEventListener('click', () => this.selectSection(parseInt(li.dataset.index)));
        });
        this.currentSection = selectSections.length - 1;
        this.nextSection = 0;
        this.selectSection(this.nextSection);
        this.updateProgressDisplay();
    }
    loadPlayer(newSong) {
        this.song = newSong;
        this.player = YTPlayer.loadPlayer(this.song.videoId);
        this.player.onReady = (event) => this.onReady(event);
        this.player.onStateChange = (event) => this.onStateChange(event);
    }
    onFullScreenToggle() {
        if (!this.full || this.full.closed) {
            this.fullplayer = undefined;
            const url = `full?videoId=${this.song?.videoId}&title=${encodeURIComponent(this.song?.title)}`;
            this.full = window.open(url, 'fullWindow', `top=0,left=0,width=${screen.width},height=${screen.height},fullscreen=yes,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`)
                || undefined;
        }
        else {
            this.fullplayer = undefined;
            this.full.close();
            this.full = undefined;
        }
    }
    setFullPlayer(newPlayer) {
        this.fullplayer = newPlayer;
        console.log('fullplayer setted');
    }
    onVolumeUpButton() {
        const volume = this.player?.volumeUp();
        this.displayVolumeValue(volume);
    }
    onVolumeDownButton() {
        const volume = this.player?.volumeDown();
        this.displayVolumeValue(volume);
    }
    displayVolumeValue(volume) {
        if (!volume) {
            volume = this.player?.Volume;
        }
        this.volumeValue.innerText = volume.toString();
        if (volume >= 100) {
            this.volumeUpButton?.classList.add('disabled');
            this.volumeDownButton?.classList.remove('disabled');
        }
        else if (volume <= 0) {
            this.volumeUpButton?.classList.remove('disabled');
            this.volumeDownButton?.classList.add('disabled');
        }
        else {
            this.volumeUpButton?.classList.remove('disabled');
            this.volumeDownButton?.classList.remove('disabled');
        }
    }
    onMuteButton() {
        const isUnmuted = this.player?.muteToggle();
        this.muteButton.innerText = isUnmuted ? 'Unmute' : 'Mute';
    }
    onReady(event) {
        this.displayVolumeValue();
    }
    onStateChange(event) {
        switch (event.data) {
            case YT.PlayerState.CUED:
                this.control.classList.remove('disabled');
                this.notifySongReady();
                break;
            case YT.PlayerState.PLAYING:
                this.setCheckTimer();
                this.startProgressTimer();
                break;
            case YT.PlayerState.PAUSED:
            case YT.PlayerState.ENDED:
                this.clearProgressTimer();
                break;
        }
    }
    notifySongReady() {
        if (this.isSongReady) {
            return;
        }
        this.isSongReady = true;
        this.onSongReady?.(this.player?.getDuration());
    }
    // private duration(duration: number): string {
    //     const seconds = Math.round(duration % 60 * 1000) / 1000;
    //     let minutes = Math.floor(duration / 60);
    //     const hours = Math.floor(minutes / 60);
    //     if (hours > 0) {
    //         minutes = Math.floor(minutes % 60);
    //         return `${hours}:${Utils.padTo2Digits(minutes)}:${Utils.padTo2Digits(seconds)}`;
    //     }
    //     return `${minutes}:${seconds}`;
    // }
    onPlayButton() {
        this.clearTimer();
        const section = this.song?.sections[this.nextSection];
        if (!section) {
            return;
        }
        if (section.start < 0) {
            this.onPauseButton();
            return;
        }
        this.currentSection = this.nextSection;
        this.nextSection = this.currentSection + 1;
        const startTime = section.start;
        this.player?.play(startTime);
        this.fullplayer?.play(startTime);
        this.displayCurrentSection(section);
        this.displayNextSection(this.song?.sections[this.nextSection]);
        this.addPlayedSection(section);
        this.updateProgressDisplay(startTime);
    }
    onPauseButton() {
        this.clearTimer();
        this.clearProgressTimer();
        this.player?.pause();
        this.fullplayer?.pause();
    }
    clearTimer() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    }
    startProgressTimer() {
        this.clearProgressTimer();
        this.updateProgressDisplay();
        this.progressTimerId = window.setInterval(() => this.updateProgressDisplay(), 200);
    }
    clearProgressTimer() {
        if (this.progressTimerId) {
            clearInterval(this.progressTimerId);
            this.progressTimerId = undefined;
        }
        this.updateProgressDisplay();
    }
    setCheckTimer(section = this.currentSection) {
        const endTime = this.song?.sections[section].end;
        const currentTime = this.player?.getCurrentTime();
        const timeout = endTime - currentTime - this.skipTime;
        console.log(`endTime:${endTime}, currentTime:${currentTime}, skipTime:${this.skipTime}`);
        if (timeout < 0) {
            console.warn(`endTime-currentTime-skipTime:${timeout}`);
            //seekToNext();
        }
        this.timerId = setTimeout(() => this.seekToNext(), timeout * 1000);
        console.log(this.player?.timestamp(), 'setCheckTimer', Utils.rightPadTo3Digits(timeout), endTime);
    }
    selectSection(section) {
        console.log('selectSection', section);
        this.nextSection = section;
        this.displayNextSection(this.song?.sections[this.nextSection]);
    }
    seekToNext() {
        if (this.song?.sections[this.nextSection].start >= 0) {
            this.seekToSection(this.nextSection);
            this.displayNextSection(this.song?.sections[this.nextSection]);
        }
        else {
            console.log(this.player?.timestamp(), 'seekToSection end');
            this.onPauseButton();
            this.currentSection = this.nextSection;
            this.nextSection = 0;
            this.displayNextSection(this.song?.sections[this.nextSection]);
        }
        this.displayCurrentSection(this.song?.sections[this.currentSection]);
        this.addPlayedSection(this.song?.sections[this.currentSection]);
    }
    addPlayedSection(section) {
        if (this.allSections.innerHTML.length !== 0) {
            this.allSections.innerHTML += ', ';
        }
        this.allSections.innerHTML += section.title;
    }
    // private clearNextSection(): void {
    //     this.displayNextSection({ title: '', detail: '', start: -1, end: -1});
    // }
    displayNextSection(section) {
        this.nextSectionTitle.innerText = section.title;
        const duration = section.end - section.start;
        if (duration != 0) {
            this.nextSectionDuration.innerText = Utils.formatDuration(duration);
        }
        else {
            this.nextSectionDuration.innerText = '';
        }
        this.nextSectionDetail.innerText = section.detail;
        this.nextSectionDetail.title = section.detail;
    }
    displayCurrentSection(section) {
        this.currentSectionTitle.innerText = section.title;
        const duration = section.end - section.start;
        if (duration != 0) {
            this.currentSectionDuration.innerText = Utils.formatDuration(duration);
        }
        else {
            this.currentSectionDuration.innerText = '';
        }
        this.currentSectionDetail.innerText = section.detail;
        this.currentSectionDetail.title = section.detail;
        this.updateProgressDisplay();
    }
    onSegmentProgressBar(event) {
        const section = this.song?.sections[this.currentSection];
        if (!section || section.start < 0 || section.end === undefined || section.end <= section.start) {
            return;
        }
        const rect = this.segmentProgressBar.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const gotoTime = section.start + (section.end - section.start) * ratio;
        this.clearTimer();
        this.player?.play(gotoTime);
        this.fullplayer?.play(gotoTime);
        this.updateProgressDisplay(gotoTime);
    }
    onSongProgressBar(event) {
        const songDuration = this.getSongDuration();
        if (songDuration <= 0) {
            return;
        }
        const rect = this.songProgressBar.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const gotoTime = songDuration * ratio;
        this.clearTimer();
        this.player?.play(gotoTime);
        this.fullplayer?.play(gotoTime);
        this.updateCurrentSectionForTime(gotoTime);
        this.updateProgressDisplay(gotoTime);
    }
    updateProgressDisplay(currentTime = this.player?.getCurrentTime() ?? 0) {
        const section = this.song?.sections[this.currentSection];
        const songDuration = this.getSongDuration();
        const songElapsed = songDuration > 0 ? Math.min(Math.max(currentTime, 0), songDuration) : Math.max(currentTime, 0);
        const songProgress = songDuration > 0 ? songElapsed / songDuration : 0;
        this.songProgressFill.style.width = `${songProgress * 100}%`;
        this.songProgressTime.innerText =
            `${Utils.formatDurationForPosition(songElapsed)} / ${Utils.formatDuration(songDuration)}`;
        if (!section || section.start < 0 || section.end === undefined || section.end <= section.start) {
            this.segmentProgressFill.style.width = '0%';
            this.segmentProgressTime.innerText = '0 / 0.0';
            return;
        }
        const sectionDuration = section.end - section.start;
        const sectionElapsed = Math.min(Math.max(currentTime - section.start, 0), sectionDuration);
        const progress = sectionDuration > 0 ? sectionElapsed / sectionDuration : 0;
        this.segmentProgressFill.style.width = `${progress * 100}%`;
        this.segmentProgressTime.innerText =
            `${Utils.formatDurationForPosition(sectionElapsed)} / ${Utils.formatDuration(sectionDuration)}`;
    }
    getSongDuration() {
        const sections = this.song?.sections ?? [];
        const songEnd = this.song?.end ?? this.song?.duration ?? 0;
        return Math.max(songEnd, ...sections
            .filter((section) => section.start >= 0)
            .map((section) => section.end ?? section.start), 0);
    }
    updateCurrentSectionForTime(currentTime) {
        const sections = this.song?.sections ?? [];
        const sectionIndex = sections.findIndex((section) => section.start >= 0 &&
            section.end !== undefined &&
            currentTime >= section.start &&
            currentTime < section.end);
        if (sectionIndex < 0) {
            return;
        }
        this.currentSection = sectionIndex;
        this.nextSection = sectionIndex + 1;
        this.displayCurrentSection(sections[this.currentSection]);
        this.displayNextSection(sections[this.nextSection]);
    }
    seekToSection(section) {
        this.timerId = undefined;
        if (this.song?.sections[this.currentSection].end !== this.song?.sections[section].start) {
            const gotoTime = this.song?.sections[section].start;
            this.fullplayer?.seekTo(gotoTime);
            this.player?.seekTo(gotoTime);
            const currentTime = this.player?.getCurrentTime();
            console.log(this.player?.timestamp(), 'seekToSection', section, Utils.rightPadTo3Digits(currentTime), gotoTime);
        }
        else {
            this.setCheckTimer(this.nextSection);
        }
        this.currentSection = this.nextSection;
        this.nextSection = this.currentSection + 1;
        console.log(this.player?.timestamp(), `seekToSection current=${this.currentSection}, next=${this.nextSection}`);
    }
}
