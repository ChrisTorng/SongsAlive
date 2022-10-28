var song;
function loadPlayer(newSong) {
    song = newSong;
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

var fullplayer;
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

var full;
function fullScreenToggle() {
    if (!full || full.closed) {
        fullplayer = undefined;
        const url = 'full?videoId=' + song.videoId + '&title=' + encodeURIComponent(song.title);
        full = window.open(url, 'fullWindow',
            'top=0,left=0,width=' + screen.width + ',height=' + screen.height +
            'fullscreen=yes,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no');
    } else {
        fullplayer = undefined;
        full.close();
        full = undefined;
    }
}

function setFullPlayer(newPlayer) {
    fullplayer = newPlayer;
}

function onVolumeUpButton() {
    const volume = player.getVolume();
    if (volume >= 100) {
        return;
    }

    var newVolume = volume + 10;
    if (newVolume > 100) {
        newVolume = 100;
    }

    player.setVolume(newVolume);
    displayVolumeValue(newVolume);
}

function onVolumeDownButton() {
    const volume = player.getVolume();
    if (volume <= 0) {
        return;
    }
    var newVolume = volume - 10;
    if (newVolume < 0) {
        newVolume = 0;
    }

    player.setVolume(newVolume);
    displayVolumeValue(newVolume);
}

function displayVolumeValue(volume) {
    if (volume === undefined) {
        volume = player.getVolume();
    }
    const volumeValue = document.getElementById('volumeValue');
    volumeValue.innerText = volume;

    const volumeUpButton = document.getElementById('volumeUpButton');
    const volumeDownButton = document.getElementById('volumeDownButton');

    if (volume >= 100) {
        volumeUpButton.classList.add('disabled');
        volumeDownButton.classList.remove('disabled');
    } else if (volume <= 0) {
        volumeUpButton.classList.remove('disabled');
        volumeDownButton.classList.add('disabled');
    } else {
        volumeUpButton.classList.remove('disabled');
        volumeDownButton.classList.remove('disabled');
    }
}

function onMuteButton() {
    const muteButton = document.getElementById('muteButton');
    const isMuted = player.isMuted();
    if (isMuted) {
        player.unMute();
        muteButton.innerText = 'Mute';
    } else {
        player.mute();
        muteButton.innerText = 'Unmute';
    }
}

function onReady(event) {
    console.log('onReady', event);
    
    displayVolumeValue();
    player.cueVideoById(song.videoId);
}

function onStateChange(event) {
    console.log(timestamp(), 'onStateChange', playerState(event.data));

    switch (event.data) {
    case YT.PlayerState.CUED:
        var control = document.getElementById('control');
        control.classList.remove('disabled');
        break;

    case YT.PlayerState.PLAYING:
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
    fullplayer?.loadVideoById(song.videoId, startTime);
    player.loadVideoById(song.videoId, startTime);
}

function onPauseButton() {
    clearTimer();
    fullplayer?.pauseVideo();
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

function setCheckTimer(section = currentSection) {
    const endTime = song.sections[section].end;
    const currentTime = player.getCurrentTime();
    timerId = setTimeout(seekToNext, (endTime - currentTime - skipTime) * 1000);
    console.log(timestamp(), 'setCheckTimer', rightPadTo3Digits(currentTime), endTime);
}

function selectSection(section) {
    console.log('selectSection', section);
    nextSection = section;

    displayNextSection(song.sections[nextSection]);
}

function seekToNext() {
    if (song.sections[nextSection].start >= 0) {
        seekToSection(nextSection);
        displayNextSection(song.sections[nextSection]);
    } else {
        console.log(timestamp(), 'seekToSection end');
        onPauseButton();

        currentSection = nextSection;
        nextSection = 0;

        displayNextSection(song.sections[nextSection]);
    }

    displayCurrentSection(song.sections[currentSection]);

    const allSections = document.getElementById('allSections');
    if (allSections.innerHTML.length !== 0) {
        allSections.innerHTML += ', '
    }
    allSections.innerHTML += song.sections[currentSection].title;
}

function clearNextSection() {
    displayNextSection({ title: '', detail: ''});
}

function displayNextSection(section) {
    const nextSectionTitle = document.getElementById('nextSectionTitle');
    nextSectionTitle.innerText = section.title;

    const nextSectionDuration = document.getElementById('nextSectionDuration');
    const duration = section.end - section.start;
    if (duration != 0) {
        nextSectionDuration.innerText = rightPadTo2Digits(duration);
    } else {
        nextSectionDuration.innerText = '';
    }

    const nextSectionDetail = document.getElementById('nextSectionDetail');
    nextSectionDetail.innerText = section.detail;
    nextSectionDetail.title = section.detail;}

function displayCurrentSection(section) {
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    currentSectionTitle.innerText = section.title;

    const currentSectionDuration = document.getElementById('currentSectionDuration');
    const duration = section.end - section.start;
    if (duration != 0) {
        currentSectionDuration.innerText = rightPadTo2Digits(duration);
    } else {
        currentSectionDuration.innerText = '';
    }

    const currentSectionDetail = document.getElementById('currentSectionDetail');
    currentSectionDetail.innerText = section.detail;
    currentSectionDetail.title = section.detail;}

function seekToSection(section) {
    timerId = undefined;

    if (song.sections[currentSection].end !== song.sections[section].start) 
    {
        const gotoTime = song.sections[section].start;
        fullplayer?.seekTo(gotoTime, true);
        player.seekTo(gotoTime, true);
        const currentTime = player.getCurrentTime();
        console.log(timestamp(), 'seekToSection', section, rightPadTo3Digits(currentTime), gotoTime);
    } else {
        setCheckTimer(nextSection);
    }

    currentSection = nextSection;
    nextSection = currentSection + 1;
    console.log(timestamp(), 'seekToSection current=' + currentSection + ', next=' + nextSection);
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