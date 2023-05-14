"use strict";
class FullScreenPlayer {
    videoId;
    player;
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.videoId = params.get('videoId') || '';
        document.title = params.get('title') || '';
        this.loadPlayer();
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
    loadPlayer() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    onYouTubeIframeAPIReady() {
        this.player = new YT.Player('player', {
            playerVars: {
                origin: window.location.origin,
                playsinline: 1,
                controls: 0,
                rel: 0
                //'modestbranding': 0
            },
            events: {
                onReady: this.onReady.bind(this),
                onStateChange: this.onStateChange.bind(this),
                onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
                onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
                onError: this.onError.bind(this)
                // onApiChange: onApiChange
            }
        });
        window.opener.setFullPlayer(this.player);
    }
    onReady(event) {
        this.player.cueVideoById(this.videoId);
        this.player.mute();
    }
    onStateChange(event) {
        console.log('onStateChange', event.data);
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
}
