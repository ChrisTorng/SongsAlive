const params = new URLSearchParams(window.location.search);
const videoId = params.get('videoId');
document.title = params.get('title');

function fullScreen() {
    const playerElement = document.getElementById('player');
    var requestFullScreen = playerElement.requestFullScreen ||
        playerElement.webkitRequestFullScreen ||
        playerElement.mozRequestFullScreen ||
        playerElement.msRequestFullScreen;
    if (requestFullScreen) {
        requestFullScreen.bind(playerElement)();
    }
}

loadPlayer();

function loadPlayer() {
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
            'playsinline': 1,
            'controls': 0,
            'rel': 0
            //'modestbranding': 0
            },
        events: {
            'onReady': onReady,
            'onStateChange': onStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange,
            'onPlaybackRateChange': onPlaybackRateChange,
            'onError': onError
            // 'onApiChange': onApiChange
        }
    });

    window.opener.setFullPlayer(player);
}

function onReady(event) {
    player.cueVideoById(videoId);
    player.mute();
}

function onStateChange(event) {
    console.log(timestamp(), 'onStateChange', playerState(event.data));
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