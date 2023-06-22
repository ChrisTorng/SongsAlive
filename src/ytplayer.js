export class YTPlayer {
    videoId;
    fullplayer;
    player;
    onYouTubeIframeAPIReady;
    static loadPlayer(videoId, onYouTubeIframeAPIReady) {
        const player = new YTPlayer(videoId, onYouTubeIframeAPIReady);
        window.onYouTubeIframeAPIReady = () => player.onYouTubeIframeAPIReadyHandler();
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        return player;
    }
    onYouTubeIframeAPIReadyHandler() {
        //        const player = new YTPlayer('5HqZJr1kKq8');
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
    setFullPlayer(newPlayer) {
        this.fullplayer = newPlayer;
    }
    volumeUp() {
        const volume = this.getVolume();
        if (volume >= 100) {
            return 100;
        }
        let newVolume = volume + 10;
        if (newVolume > 100) {
            newVolume = 100;
        }
        this.player?.setVolume(newVolume);
        return this.getVolume();
    }
    volumeDown() {
        const volume = this.getVolume();
        if (volume <= 0) {
            return 0;
        }
        let newVolume = volume - 10;
        if (newVolume < 0) {
            newVolume = 0;
        }
        this.player?.setVolume(newVolume);
        return this.getVolume();
    }
    getVolume() {
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
        return isMuted;
    }
    onReady() {
        console.log('onReady');
        this.player?.cueVideoById(this.videoId);
    }
    onStateChange(event) {
        console.log('onStateChange', this.playerState(event.data));
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
    play(startTime) {
        this.player?.loadVideoById(this.videoId, startTime);
        if (this.fullplayer) {
            this.fullplayer.loadVideoById(this.videoId, startTime);
        }
    }
    pause() {
        this.player?.pauseVideo();
        this.fullplayer?.pauseVideo();
        //(<any>this.full)?.pauseVideo();
        this.displayStatus();
    }
    displayStatus() {
        console.log('getVideoLoadedFraction', this.player?.getVideoLoadedFraction());
        console.log('getPlayerState', this.playerState(this.player?.getPlayerState()));
        console.log('getCurrentTime', this.player?.getCurrentTime());
    }
    seekTo(gotoTime) {
        this.fullplayer?.seekTo(gotoTime, true);
        this.player?.seekTo(gotoTime, true);
        return this.player?.getCurrentTime();
    }
}
