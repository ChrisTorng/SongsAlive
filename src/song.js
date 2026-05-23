export class SongProcessor {
    songId;
    constructor() {
        this.songId = new URLSearchParams(window.location.search).get('songId');
    }
    async process() {
        if (!this.songId)
            return;
        try {
            const response = await fetch(`songs/${this.songId}.json`);
            const result = await response.json();
            return result;
        }
        catch (err) {
            const player = document.getElementById('player');
            if (player) {
                player.innerText = err.toString();
            }
        }
    }
    processSong(song, songEnd) {
        this.resolveSectionEnds(song, songEnd);
        this.setTitle(song);
        this.setSections(song);
        return song.sections.length - 1;
    }
    setTitle(song) {
        document.title = `${song.title} - ${document.title}`;
        const url = `https://www.youtube.com/watch?v=${song.videoId}`;
        const titleAnchor = document.getElementById('title');
        titleAnchor.href = url;
        titleAnchor.innerText = song.title;
    }
    setSections(song) {
        let sectionsHtml = '';
        this.addStopSection(song.sections);
        song.sections.forEach((section, index) => {
            const duration = section.end - section.start;
            sectionsHtml += `<li class="selectSection" data-index="${index}" title="${section.detail}">
                <div>${section.title}</div>
                ${duration !== 0 ? `<div>${this.rightPadTo2Digits(duration)}</div>` : '<div>&nbsp;</div>'}
                <div class="sectionsDetail">${section.detail}</div>
                </li>\n`;
        });
        const sectionsList = document.getElementById('sectionsList');
        if (sectionsList) {
            sectionsList.innerHTML = sectionsHtml;
        }
    }
    resolveSectionEnds(song, songEnd) {
        this.removeStopSection(song.sections);
        const finalEnd = [songEnd, song.end, song.duration]
            .find((end) => end !== undefined && end > 0);
        song.sections.forEach((section, index) => {
            if (section.end !== undefined) {
                return;
            }
            const nextSection = song.sections[index + 1];
            if (nextSection) {
                section.end = nextSection.start;
                return;
            }
            if (finalEnd !== undefined && finalEnd >= section.start) {
                section.end = finalEnd;
                return;
            }
            console.warn(`No end time found for section "${section.title}".`);
            section.end = section.start;
        });
    }
    addStopSection(sections) {
        sections.push({ title: '停止', detail: '', start: -1, end: -1 });
    }
    removeStopSection(sections) {
        const lastSection = sections[sections.length - 1];
        if (lastSection?.start === -1 && lastSection.end === -1) {
            sections.pop();
        }
    }
    rightPadTo2Digits(number) {
        if (number % 1 === 0) {
            return number + '.00';
        }
        if ((number * 10) % 1 === 0) {
            return number + '0';
        }
        return (Math.round(number * 100) / 100).toFixed(2);
    }
}
