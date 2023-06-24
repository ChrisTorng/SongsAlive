export class YTPlayer {
    videoId;
    player;
    lastTimestamp = new Date();
    onYouTubeIframeAPIReady;
    onReady;
    onStateChange;
    static loadPlayer(videoId, onYouTubeIframeAPIReady) {
        const player = new YTPlayer(videoId, onYouTubeIframeAPIReady);
        window.onYouTubeIframeAPIReady = () => player.onYouTubeIframeAPIReadyHandler();
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        return player;
    }
    onYouTubeIframeAPIReadyHandler() {
        this.player = new YT.Player('player', {
            playerVars: {
                origin: window.location.origin,
                playsinline: 1,
                controls: 0,
                rel: 0
            },
            events: {
                onReady: this.onReadyHandler.bind(this),
                onStateChange: this.onStateChangeHandler.bind(this),
                onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
                onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
                onError: this.onError.bind(this)
            }
        });
        if (this.onYouTubeIframeAPIReady) {
            this.onYouTubeIframeAPIReady();
        }
    }
    fullScreen() {
        const playerElement = document.getElementById('player');
        const requestFullScreen = playerElement.requestFullscreen; // ||
        // playerElement.webkitRequestFullscreen ||
        // playerElement.mozRequestFullScreen ||
        // playerElement.msRequestFullscreen;
        if (requestFullScreen) {
            requestFullScreen.bind(playerElement)();
        }
    }
    constructor(videoId, onYouTubeIframeAPIReady) {
        this.videoId = videoId;
        this.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
    volumeUp() {
        const volume = this.Volume;
        if (volume >= 100) {
            return 100;
        }
        let newVolume = volume + 10;
        if (newVolume > 100) {
            newVolume = 100;
        }
        this.Volume = newVolume;
        return newVolume;
    }
    volumeDown() {
        const volume = this.Volume;
        if (volume <= 0) {
            return 0;
        }
        let newVolume = volume - 10;
        if (newVolume < 0) {
            newVolume = 0;
        }
        this.Volume = newVolume;
        return newVolume;
    }
    set Volume(volume) {
        this.player?.setVolume(volume);
    }
    get Volume() {
        return this.player?.getVolume();
    }
    muteToggle() {
        const isMuted = this.player?.isMuted() ?? false;
        if (isMuted) {
            this.player?.unMute();
        }
        else {
            this.player?.mute();
        }
        return !isMuted;
    }
    onReadyHandler(event) {
        console.log(this.timestamp(), 'onReadyHandler');
        // Raise event before cueVideoById, or the volume will got undefined value
        this.onReady?.(event);
        this.player?.cueVideoById(this.videoId);
    }
    onStateChangeHandler(event) {
        console.log(this.timestamp(), 'onStateChangeHandler', this.playerState(event.data));
        this.onStateChange?.(event);
        return event.data;
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
    onPlaybackQualityChange(event) {
        console.log("onPlaybackQualityChange", event.data);
    }
    onPlaybackRateChange(event) {
        console.log("onPlaybackRateChange", event.data);
    }
    onError(event) {
        console.error("onError", event.data);
    }
    // private onApiChange(event: YT.PlayerEvent): void {
    //     console.log('onApiChange');
    //     console.log(player.getOptions());
    //     var options = player.getOptions('captions');
    //     console.log(options);
    //     for (var index in options) {
    //         console.log(options[index], player.getOption('captions', options[index]));
    //     }
    // }
    play(startTime) {
        this.player?.loadVideoById(this.videoId, startTime);
    }
    pause() {
        this.player?.pauseVideo();
        this.displayStatus();
    }
    displayStatus() {
        console.log('getVideoLoadedFraction', this.player?.getVideoLoadedFraction());
        console.log('getPlayerState', this.playerState(this.player?.getPlayerState()));
        console.log('getCurrentTime', this.player?.getCurrentTime());
    }
    seekTo(gotoTime) {
        this.player?.seekTo(gotoTime, true);
        return this.player?.getCurrentTime();
    }
    getCurrentTime() {
        return this.player?.getCurrentTime();
    }
    timestamp() {
        var newTimestamp = new Date();
        const timestampText = `${newTimestamp.getMinutes()}:${newTimestamp.getSeconds()}.${YTPlayer.padTo3Digits(newTimestamp.getMilliseconds())}`;
        var timeSpent = (newTimestamp.getTime() - this.lastTimestamp.getTime()) / 1000;
        this.lastTimestamp = newTimestamp;
        return `${timestampText} ${YTPlayer.rightPadTo3Digits(timeSpent)}`;
    }
    static padTo3Digits(number) {
        if (number < 10) {
            return `00${number}`;
        }
        if (number < 100) {
            return `0${number}`;
        }
        return number.toString();
    }
    static rightPadTo3Digits(number) {
        if (number % 1 === 0) {
            return `${number}.000`;
        }
        if ((number * 10) % 1 === 0) {
            return `${number}00`;
        }
        if ((number * 100) % 1 === 0) {
            return `${number}0`;
        }
        return (Math.round(number * 1000) / 1000).toFixed(3);
    }
}
