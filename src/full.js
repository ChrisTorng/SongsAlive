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

    window.opener.replacePlayer(player);
}

function onReady(event) {
    window.opener.onReady(event);
}

function onStateChange(event) {
    window.opener.onStateChange(event);
}

function onPlaybackQualityChange(event) {
    window.opener.onPlaybackQualityChange(event);
}

function onPlaybackRateChange(event) {
    window.opener.onPlaybackRateChange(event);
}

function onError(event) {
    window.opener.onError(event);
}