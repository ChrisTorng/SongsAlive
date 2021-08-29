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
}

function onReady(event) {
    console.log('onReady', event);
    
    event.target.cueVideoById(song.videoId);
}

function onStateChange(event) {
    console.log(timestamp(), 'onStateChange', playerState(event.data));

    switch (event.data) {
    case YT.PlayerState.CUED:
        var control = document.getElementById('control');
        control.classList.remove('disabled');
        break;

    case YT.PlayerState.PLAYING:
        //console.log('duration', duration(player.getDuration()));
        setCheckTimer();
        break;
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

function duration(duration) {
    const seconds = Math.round(duration % 60 * 1000) / 1000;
    let minutes = Math.floor(duration / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        minutes = Math.floor(minutes % 60);
        return hours + ':' + padTo2Digits(minutes) + ':' + padTo2Digits(seconds);
    }

    return minutes + ':' + seconds;
}

function padTo2Digits(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

function padTo3Digits(number) {
    if (number < 10) {
        return '00' + number;
    }
    if (number < 100) {
        return '0' + number;
    }
    return number;
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

// function onApiChange(event) {
//     console.log('onApiChange');
//     console.log(player.getOptions());

//     var options = player.getOptions('captions');
//     console.log(options);

//     for (var index in options) {
//         console.log(options[index], player.getOption('captions', options[index]));
//     }
// }

function onPlayButton() {
    clearTimer();
    //seekToSection(nextSection);
    //player.playVideo();
    const startTime = song.sections[nextSection].start;
    player.loadVideoById(song.videoId, startTime);
}

function onPauseButton() {
    clearTimer();
    player.pauseVideo();
    displayStatus();
}

function clearTimer() {
    if (timerId) {
        clearTimeout(timerId);
        timerId = undefined;
    }
}

function displayStatus() {
    console.log('getVideoLoadedFraction', player.getVideoLoadedFraction());
    console.log('getPlayerState', playerState(player.getPlayerState()));
    console.log('getCurrentTime', player.getCurrentTime());
}

var timerId;
const skipTime = 0.1;

var currentSection = 0;
var nextSection = 0;

function setCheckTimer() {
    const endTime = song.sections[currentSection].end;
    const currentTime = player.getCurrentTime();
    timerId = setTimeout(seekToNext, (endTime - currentTime - skipTime) * 1000);
    console.log(timestamp(), 'setCheckTimer', rightPadTo3Digits(currentTime), endTime);
}

function selectSection(section) {
    nextSection = section;

    const nextSectionTitle = document.getElementById('nextSectionTitle');
    nextSectionTitle.innerText = song.sections[nextSection].title;
    const nextSectionDetail = document.getElementById('nextSectionDetail');
    nextSectionDetail.innerText = song.sections[nextSection].detail;
}

function seekToNext() {
    seekToSection(nextSection);

    const currentSectionTitle = document.getElementById('currentSectionTitle');
    currentSectionTitle.innerText = song.sections[currentSection].title;
    const currentSectionDetail = document.getElementById('currentSectionDetail');
    currentSectionDetail.innerText = song.sections[currentSection].detail;

    const allSections = document.getElementById('allSections');
    if (allSections.innerText.length !== 0) {
        allSections.innerText += ', '
    }
    allSections.innerText += song.sections[currentSection].title;
}

function seekToSection(section) {
    timerId = undefined;
    const gotoTime = song.sections[section].start;
    player.seekTo(gotoTime, true);
    const currentTime = player.getCurrentTime();
    console.log(timestamp(), 'seekToSection', section, rightPadTo3Digits(currentTime), gotoTime);
    currentSection = nextSection;
}

var lastTimestamp = new Date();
function timestamp() {
    var newTimestamp = new Date();
    const timestampText = newTimestamp.getMinutes() + ':' +
        newTimestamp.getSeconds() + '.' +
        padTo3Digits(newTimestamp.getMilliseconds());
    var timeSpent = (newTimestamp - lastTimestamp) / 1000;

    lastTimestamp = newTimestamp;
    return timestampText + ' ' + rightPadTo3Digits(timeSpent);
}

function rightPadTo3Digits(number) {
    if (number % 1 === 0) {
        return number + '.000';
    }

    if ((number * 10) % 1 === 0) {
        return number + '00';
    }

    if ((number * 100) % 1 === 0) {
        return number + '0';
    }

    return Math.round(number * 1000) / 1000;
}


function rightPadTo2Digits(number) {
    if (number % 1 === 0) {
        return number + '.00';
    }

    if ((number * 10) % 1 === 0) {
        return number + '0';
    }

    return Math.round(number * 100) / 100;
}