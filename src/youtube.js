var song;
function loadPlayer(newSong) {
    song = newSong;
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        origin: window.location.origin,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onReady,
            'onStateChange': onStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange,
            'onPlaybackRateChange': onPlaybackRateChange,
            'onError': onError,
            'onApiChange': onApiChange
        }
    });
}

function onReady(event) {
    console.log("onReady", event);
    event.target.cueVideoById(song.videoId);
}

function onStateChange(event) {
    console.log("onStateChange", playerState(event.data));
    if (event.data === YT.PlayerState.CUED) {
        var control = document.getElementById('control');
        control.classList.remove('disabled');
    }
}

function playerState(state) {
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
            return state;
    }
}

function onPlaybackQualityChange(event) {
    console.log("onPlaybackQualityChange", event.data);
}

function onPlaybackRateChange(event) {
    console.log("onPlaybackRateChange", event.data);
}

function onError(event) {
    console.log("onError", event.data);
}

function onApiChange(event) {
    console.log('onApiChange');
    console.log(player.getOptions());

    var options = player.getOptions('captions');
    console.log(options);

    for (var index in options) {
        console.log(options[index], player.getOption('captions', options[index]));
    }
}

function onPlayButton() {
    player.playVideo();
}

function onPauseButton() {
    player.pauseVideo();
}