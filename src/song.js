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
    setTitle(song);
    setSections(song);
}

function setTitle(song) {
    document.title = song.title + ' - ' + document.title;
    const url = 'https://www.youtube.com/watch?v=' + song.videoId;
    const titleAnchor = document.getElementById('title');
    titleAnchor.href = url;
    titleAnchor.innerText = song.title;
}

function setSections(song) {
    var sectionsHtml = '';
    for (var index in song.sections) {
        sectionsHtml += '<li onclick="selectSection(' + index + ')" ' +
            'title="' + song.sections[index].detail + '">' +
            '<div>' + song.sections[index].title + '</div>' +
            '<div>' + song.sections[index].detail.substring(0, 4) + '</div>' +
            '<div>' + song.sections[index].start + '<br/>' +
            song.sections[index].end + '</div>' +
            '</li>\n';
    }

    const sections = document.getElementById('sections');
    sections.innerHTML = sectionsHtml;
}