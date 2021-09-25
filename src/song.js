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
    currentSection = song.sections.length - 1;
    selectSection(nextSection);
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

    addStopSection(song.sections);

    for (var index in song.sections) {
        const duration = song.sections[index].end - song.sections[index].start;
        sectionsHtml += '<li onclick="selectSection(' + index + ')" ' +
            'title="' + song.sections[index].detail + '">' +
            '<div>' + song.sections[index].title + '</div>' +
            (duration !== 0 ? '<div>' + rightPadTo2Digits(duration) + '</div>' : '<div>&nbsp;</div>') +
            '<div class="sectionsDetail">' + song.sections[index].detail + '</div>' +
            '</li>\n';
    }

    const sectionsList = document.getElementById('sectionsList');
    sectionsList.innerHTML = sectionsHtml;
}

function addStopSection(sections) {
    sections.push({ title: '停止', detail: '', start: -1, end: -1 });
}