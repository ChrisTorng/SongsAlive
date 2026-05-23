export type SongSection = {
    title: string;
    detail: string;
    start: number;
    end?: number;
};

export type Song = {
    title: string;
    videoId: string;
    end?: number;
    duration?: number;
    sections: SongSection[];
};

export class SongProcessor {
    private songId: string | null;

    constructor() {
        this.songId = new URLSearchParams(window.location.search).get('songId');
    }

    public async process(): Promise<Song | undefined> {
        if (!this.songId)
            return;

        try {
            const response = await fetch(`songs/${this.songId}.json`)
            const result = await response.json();
            return result;
        } catch (err: any) {
            const player = document.getElementById('player')
            if (player) {
                player.innerText = err.toString();
            }
        }
    }

    public processSong(song: Song, songEnd?: number): number {
        this.resolveSectionEnds(song, songEnd);
        this.setTitle(song);
        this.setSections(song);
        return song.sections.length - 1;
    }

    private setTitle(song: Song): void {
        document.title = `${song.title} - ${document.title}`;
        const url = `https://www.youtube.com/watch?v=${song.videoId}`;
        const titleAnchor = document.getElementById('title') as HTMLAnchorElement;
        titleAnchor.href = url;
        titleAnchor.innerText = song.title;
    }

    private setSections(song: Song): void {
        let sectionsHtml = '';
        this.addStopSection(song.sections);

        song.sections.forEach((section, index) => {
            const duration = section.end! - section.start;
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

    private resolveSectionEnds(song: Song, songEnd?: number): void {
        this.removeStopSection(song.sections);

        const finalEnd = [songEnd, song.end, song.duration]
            .find((end): end is number => end !== undefined && end > 0);
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

    private addStopSection(sections: SongSection[]): void {
        sections.push({ title: '停止', detail: '', start: -1, end: -1 });
    }

    private removeStopSection(sections: SongSection[]): void {
        const lastSection = sections[sections.length - 1];
        if (lastSection?.start === -1 && lastSection.end === -1) {
            sections.pop();
        }
    }

    private rightPadTo2Digits(number: number): string {
        if (number % 1 === 0) {
            return number + '.00';
        }

        if ((number * 10) % 1 === 0) {
            return number + '0';
        }

        return (Math.round(number * 100) / 100).toFixed(2);
    }

}
