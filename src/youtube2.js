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
    skipTime = 0.1;
    song;
    fullplayer;
    player;
    full;
    timerId;
    currentSection = 0;
    nextSection = 0;
    lastTimestamp = new Date();
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
    }
    setSelectSections() {
        const selectSections = document.getElementsByClassName('selectSection');
        Array.from(selectSections).forEach((li) => {
            li.addEventListener('click', () => this.selectSection(parseInt(li.dataset.index)));
        });
    }
    loadPlayer(newSong) {
        this.song = newSong;
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    onYouTubeIframeAPIReady() {
        this.player = new YT.Player('player', {
            playerVars: {
                origin: window.location.origin,
                playsinline: 1,
                controls: 0,
                rel: 0
            },
            events: {
                onReady: this.onReady.bind(this),
                onStateChange: this.onStateChange.bind(this),
                onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
                onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
                onError: this.onError.bind(this)
            }
        });
    }
    setCurrentSection(currentSection) {
        this.currentSection = currentSection;
    }
    onFullScreenToggle() {
        if (!this.full || this.full.closed) {
            this.fullplayer = undefined;
            const url = 'full?videoId=' + this.song?.videoId + '&title=' + encodeURIComponent(this.song?.title);
            this.full = window.open(url, 'fullWindow', 'top=0,left=0,width=' + screen.width + ',height=' + screen.height +
                'fullscreen=yes,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no')
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
    }
    onVolumeUpButton() {
        const volume = this.player?.getVolume();
        if (volume >= 100) {
            return;
        }
        let newVolume = volume + 10;
        if (newVolume > 100) {
            newVolume = 100;
        }
        this.player?.setVolume(newVolume);
        this.displayVolumeValue(newVolume);
    }
    onVolumeDownButton() {
        const volume = this.player?.getVolume();
        if (volume <= 0) {
            return;
        }
        let newVolume = volume - 10;
        if (newVolume < 0) {
            newVolume = 0;
        }
        this.player?.setVolume(newVolume);
        this.displayVolumeValue(newVolume);
    }
    displayVolumeValue(volume) {
        if (!volume) {
            volume = this.player?.getVolume();
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
        const isMuted = this.player?.isMuted();
        if (isMuted) {
            this.player?.unMute();
            if (this.muteButton) {
                this.muteButton.innerText = 'Mute';
            }
        }
        else {
            this.player?.mute();
            if (this.muteButton) {
                this.muteButton.innerText = 'Unmute';
            }
        }
    }
    onReady(event) {
        console.log('onReady', event);
        this.displayVolumeValue();
        this.player?.cueVideoById(this.song?.videoId);
    }
    onStateChange(event) {
        console.log(this.timestamp(), 'onStateChange', this.playerState(event.data));
        switch (event.data) {
            case YT.PlayerState.CUED:
                this.control.classList.remove('disabled');
                break;
            case YT.PlayerState.PLAYING:
                this.setCheckTimer();
                break;
        }
    }
    playerState(state) {
        switch (state) {
            case YT.PlayerState.UNSTARTED:
                return "unstarted";
            case YT.PlayerState.ENDED:
                return "ended";
            case YT.PlayerState.PLAYING:
                return "playing";
            case YT.PlayerState.PAUSED:
                return "paused";
            case YT.PlayerState.BUFFERING:
                return "buffering";
            case YT.PlayerState.CUED:
                return "cued";
            default:
                return state.toString();
        }
    }
    duration(duration) {
        const seconds = Math.round(duration % 60 * 1000) / 1000;
        let minutes = Math.floor(duration / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            minutes = Math.floor(minutes % 60);
            return hours + ':' + this.padTo2Digits(minutes) + ':' + this.padTo2Digits(seconds);
        }
        return minutes + ':' + seconds;
    }
    padTo2Digits(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number.toString();
    }
    padTo3Digits(number) {
        if (number < 10) {
            return '00' + number;
        }
        if (number < 100) {
            return '0' + number;
        }
        return number.toString();
    }
    onPlaybackQualityChange(event) {
        console.log("onPlaybackQualityChange", event.data);
    }
    onPlaybackRateChange(event) {
        console.log("onPlaybackRateChange", event.data);
    }
    onError(event) {
        console.log("onError", event.data);
    }
    // private onApiChange(event: any): void {
    //     console.log('onApiChange');
    //     console.log(player.getOptions());
    //     var options = player.getOptions('captions');
    //     console.log(options);
    //     for (var index in options) {
    //         console.log(options[index], player.getOption('captions', options[index]));
    //     }
    // }
    onPlayButton() {
        this.clearTimer();
        //seekToSection(nextSection);
        //player.playVideo();
        const startTime = this.song?.sections[this.nextSection].start;
        this.player?.loadVideoById(this.song?.videoId, startTime);
        if (this.fullplayer) {
            this.fullplayer.loadVideoById(this.song?.videoId, startTime);
        }
    }
    onPauseButton() {
        this.clearTimer();
        this.player?.pauseVideo();
        // if(this.fullplayer) {
        //     this.fullplayer.pauseVideo();
        // }
        if (this.full) {
            this.full.pauseVideo();
        }
        this.displayStatus();
    }
    clearTimer() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    }
    displayStatus() {
        console.log('getVideoLoadedFraction', this.player?.getVideoLoadedFraction());
        console.log('getPlayerState', this.playerState(this.player?.getPlayerState()));
        console.log('getCurrentTime', this.player?.getCurrentTime());
    }
    setCheckTimer(section = this.currentSection) {
        const endTime = this.song?.sections[section].end;
        const currentTime = this.player?.getCurrentTime();
        const timeout = endTime - currentTime - this.skipTime;
        console.log('endTime:' + endTime + ', currentTime:' + currentTime + 'skipTime:' + this.skipTime);
        if (timeout < 0) {
            console.warn('endTime-currentTime-skipTime:' + timeout);
            //seekToNext();
        }
        this.timerId = setTimeout(() => this.seekToNext(), timeout * 1000);
        console.log(this.timestamp(), 'setCheckTimer', this.rightPadTo3Digits(currentTime), endTime);
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
            console.log(this.timestamp(), 'seekToSection end');
            this.onPauseButton();
            this.currentSection = this.nextSection;
            this.nextSection = 0;
            this.displayNextSection(this.song?.sections[this.nextSection]);
        }
        this.displayCurrentSection(this.song?.sections[this.currentSection]);
        if (this.allSections.innerHTML.length !== 0) {
            this.allSections.innerHTML += ', ';
        }
        this.allSections.innerHTML += this.song?.sections[this.currentSection].title;
    }
    clearNextSection() {
        this.displayNextSection({ title: '', detail: '', start: -1, end: -1 });
    }
    displayNextSection(section) {
        this.nextSectionTitle.innerText = section.title;
        const duration = section.end - section.start;
        if (duration != 0) {
            this.nextSectionDuration.innerText = this.rightPadTo2Digits(duration);
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
            this.currentSectionDuration.innerText = this.rightPadTo2Digits(duration);
        }
        else {
            this.currentSectionDuration.innerText = '';
        }
        this.currentSectionDetail.innerText = section.detail;
        this.currentSectionDetail.title = section.detail;
    }
    seekToSection(section) {
        this.timerId = undefined;
        if (this.song?.sections[this.currentSection].end !== this.song?.sections[section].start) {
            const gotoTime = this.song?.sections[section].start;
            this.fullplayer?.seekTo(gotoTime, true);
            this.player?.seekTo(gotoTime, true);
            const currentTime = this.player?.getCurrentTime();
            console.log(this.timestamp(), 'seekToSection', section, this.rightPadTo3Digits(currentTime), gotoTime);
        }
        else {
            this.setCheckTimer(this.nextSection);
        }
        this.currentSection = this.nextSection;
        this.nextSection = this.currentSection + 1;
        console.log(this.timestamp(), 'seekToSection current=' + this.currentSection + ', next=' + this.nextSection);
    }
    timestamp() {
        var newTimestamp = new Date();
        const timestampText = newTimestamp.getMinutes() + ':' +
            newTimestamp.getSeconds() + '.' +
            this.padTo3Digits(newTimestamp.getMilliseconds());
        var timeSpent = (newTimestamp.getTime() - this.lastTimestamp.getTime()) / 1000;
        this.lastTimestamp = newTimestamp;
        return timestampText + ' ' + this.rightPadTo3Digits(timeSpent);
    }
    rightPadTo3Digits(number) {
        if (number % 1 === 0) {
            return number + '.000';
        }
        if ((number * 10) % 1 === 0) {
            return number + '00';
        }
        if ((number * 100) % 1 === 0) {
            return number + '0';
        }
        return (Math.round(number * 1000) / 1000).toFixed(3);
    }
    rightPadTo2Digits(number) {
        if (number % 1 === 0) {
            return number + '.00';
        }
        if ((number * 10) % 1 === 0) {
            return number + '0';
        }
        return (Math.round(number * 100) / 100).toFixed(2);
    }
}
