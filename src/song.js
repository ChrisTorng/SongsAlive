import { Utils } from './utils.js';
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
            return this.normalizeSong(result);
        }
        catch (err) {
            const player = document.getElementById('player');
            if (player) {
                player.innerText = err.toString();
            }
        }
    }
    normalizeSong(song) {
        return {
            title: song.title,
            videoId: song.videoId,
            end: song.end !== undefined ? this.parseTime(song.end, 'song.end') : undefined,
            duration: song.duration !== undefined ? this.parseTime(song.duration, 'song.duration') : undefined,
            sections: song.sections.map((section, index) => ({
                title: section.title,
                detail: section.detail,
                start: this.parseTime(section.start, `sections[${index}].start`),
                end: section.end !== undefined
                    ? this.parseTime(section.end, `sections[${index}].end`)
                    : undefined,
            })),
        };
    }
    parseTime(time, fieldName) {
        if (typeof time === 'number') {
            if (Number.isFinite(time)) {
                return time;
            }
            throw new Error(`${fieldName} must be a finite number.`);
        }
        const parts = time.trim().split(':');
        if (parts.length < 1 || parts.length > 3 || parts.some((part) => part === '')) {
            throw new Error(`${fieldName} has invalid time format: "${time}".`);
        }
        const multipliers = [1, 60, 3600].slice(0, parts.length).reverse();
        const seconds = parts.reduce((total, part, index) => {
            const isLastPart = index === parts.length - 1;
            const isValidPart = isLastPart
                ? /^\d+(\.\d+)?$/.test(part)
                : /^\d+$/.test(part);
            if (!isValidPart) {
                throw new Error(`${fieldName} has invalid time format: "${time}".`);
            }
            const value = Number(part);
            if (parts.length > 1 && isLastPart && value >= 60) {
                throw new Error(`${fieldName} seconds must be less than 60: "${time}".`);
            }
            if (parts.length === 3 && index === 1 && value >= 60) {
                throw new Error(`${fieldName} minutes must be less than 60: "${time}".`);
            }
            return total + value * multipliers[index];
        }, 0);
        return seconds;
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
                ${duration !== 0 ? `<div>${Utils.formatDuration(duration)}</div>` : '<div>&nbsp;</div>'}
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
}
