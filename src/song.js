const urlParams = new URLSearchParams(window.location.search);
const songId = urlParams.get('songId');

fetch('songs/' + songId + '.json')
    .then(response => response.json())
    .then(result => processSong(result))
    .catch(err => {
        const player = document.getElementById('player');
        player.innerText = err;
    });

function processSong(song) {
    loadPlayer(song);

    document.title = song.title + ' - ' + document.title;

    const url = 'https://www.youtube.com/watch?v=' + song.videoId;
    const titleAnchor = document.getElementById('title');
    titleAnchor.href = url;
    titleAnchor.innerText = song.title;
}