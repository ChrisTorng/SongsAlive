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
        videoId: song.videoId,
        origin: window.location.origin,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    var control = document.getElementById('control');
    control.classList.remove('disabled');
}

function onPlayerStateChange(event) {
}

function onPlayButton() {
    player.playVideo();
}

function onPauseButton() {
    player.pauseVideo();
}