import { Song, SongSection, SongProcessor } from './song';
import { Utils } from './utils.js';
import { YTPlayer } from './ytplayer.js';

export class YouTubePlayer {
    private readonly volumeValue: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('volumeValue')!;
    private readonly volumeUpButton: HTMLButtonElement =
        <HTMLButtonElement>document.getElementById('volumeUpButton')!;
    private readonly volumeDownButton: HTMLButtonElement =
        <HTMLButtonElement>document.getElementById('volumeDownButton')!;
    private readonly muteButton: HTMLButtonElement =
        <HTMLButtonElement>document.getElementById('muteButton')!;
    private readonly control: HTMLDivElement =
        <HTMLDivElement>document.getElementById('control')!;
    private readonly allSections: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('allSections')!;
    private readonly currentSectionTitle: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('currentSectionTitle')!;
    private readonly currentSectionDuration: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('currentSectionDuration')!;
    private readonly currentSectionDetail: HTMLDivElement =
        <HTMLDivElement>document.getElementById('currentSectionDetail')!;
    private readonly nextSectionTitle: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('nextSectionTitle')!;
    private readonly nextSectionDuration: HTMLSpanElement =
        <HTMLSpanElement>document.getElementById('nextSectionDuration');
    private readonly nextSectionDetail: HTMLDivElement =
        <HTMLDivElement>document.getElementById('nextSectionDetail');
    private readonly songProgressBar: HTMLDivElement =
        <HTMLDivElement>document.getElementById('songProgressBar')!;
    private readonly songProgressFill: HTMLDivElement =
        <HTMLDivElement>document.getElementById('songProgressFill')!;
    private readonly songProgressMarkers: HTMLDivElement =
        <HTMLDivElement>document.getElementById('songProgressMarkers')!;
    private readonly songProgressTime: HTMLDivElement =
        <HTMLDivElement>document.getElementById('songProgressTime')!;
    private readonly segmentProgressBar: HTMLDivElement =
        <HTMLDivElement>document.getElementById('segmentProgressBar')!;
    private readonly segmentProgressFill: HTMLDivElement =
        <HTMLDivElement>document.getElementById('segmentProgressFill')!;
    private readonly segmentProgressTime: HTMLDivElement =
        <HTMLDivElement>document.getElementById('segmentProgressTime')!;

    private readonly skipTime = 0.1;
    private song?: Song;
    private fullplayer?: YTPlayer;
    private player?: YTPlayer;
    private full?: Window;
    private timerId?: number;
    private progressTimerId?: number;
    private currentSection = 0;
    private nextSection = 0;
    private isSongReady = false;
    public onSongReady?: (songEnd?: number) => void;

    constructor() {
        this.initializeEventHandlers();
    }

    private initializeEventHandlers(): void {
        (<HTMLButtonElement>document.getElementById('fullScreenToggleButton'))
            .addEventListener('click', this.onFullScreenToggle.bind(this));
        (<HTMLButtonElement>document.getElementById('playButton'))
            .addEventListener('click', this.onPlayButton.bind(this));
        (<HTMLButtonElement>document.getElementById('pauseButton'))
            .addEventListener('click', this.onPauseButton.bind(this));

        this.volumeUpButton.addEventListener('click', this.onVolumeUpButton.bind(this));
        this.volumeDownButton.addEventListener('click', this.onVolumeDownButton.bind(this));
        this.muteButton.addEventListener('click', this.onMuteButton.bind(this));
        this.songProgressBar.addEventListener('click', this.onSongProgressBar.bind(this));
        this.segmentProgressBar.addEventListener('click', this.onSegmentProgressBar.bind(this));
    }

    public setSelectSections(): void {
        const selectSections = (<HTMLCollectionOf<HTMLLIElement>>document.getElementsByClassName('selectSection'))
        Array.from(selectSections).forEach((li: HTMLLIElement) => {
            li.addEventListener('click', () => this.selectSection(parseInt(li.dataset.index!)));
        });

        this.currentSection = selectSections.length - 1;
        this.nextSection = 0;
        this.selectSection(this.nextSection);
        this.renderSongProgressMarkers();
        this.updateProgressDisplay();
    }

    public loadPlayer(newSong: Song): void {
        this.song = newSong;
        this.player = YTPlayer.loadPlayer(this.song.videoId!);
        this.player.onReady = (event) => this.onReady(event);
        this.player.onStateChange = (event) => this.onStateChange(event);
    }

    private onFullScreenToggle(): void {
        if (!this.full || this.full.closed) {
            this.fullplayer = undefined;
            const url = `full?videoId=${this.song?.videoId}&title=${encodeURIComponent(this.song?.title!)}`;
            this.full = window.open(url, 'fullWindow',
                `top=0,left=0,width=${screen.width},height=${screen.height},fullscreen=yes,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`)
                || undefined;
        } else {
            this.fullplayer = undefined;
            this.full.close();
            this.full = undefined;
        }
    }

    public setFullPlayer(newPlayer: YTPlayer): void {
        this.fullplayer = newPlayer;
        console.log('fullplayer setted');
    }

    private onVolumeUpButton(): void {
        const volume = this.player?.volumeUp();
        this.displayVolumeValue(volume);
    }
    
    private onVolumeDownButton(): void {
        const volume = this.player?.volumeDown();
        this.displayVolumeValue(volume);
    }

    private displayVolumeValue(volume?: number): void {
        if (!volume) {
            volume = this.player?.Volume!;
        }

        this.volumeValue.innerText = volume.toString();
        if (volume >= 100) {
            this.volumeUpButton?.classList.add('disabled');
            this.volumeDownButton?.classList.remove('disabled');
        } else if (volume <= 0) {
            this.volumeUpButton?.classList.remove('disabled');
            this.volumeDownButton?.classList.add('disabled');
        } else {
            this.volumeUpButton?.classList.remove('disabled');
            this.volumeDownButton?.classList.remove('disabled');
        }
    }

    private onMuteButton(): void {
        const isUnmuted = this.player?.muteToggle();
        this.muteButton.innerText = isUnmuted ? 'Unmute' : 'Mute';
    }
    
    private onReady(event: YT.PlayerEvent): void {
        this.displayVolumeValue();
    }

    private onStateChange(event: YT.OnStateChangeEvent): void {
        switch (event.data) {
        case YT.PlayerState.CUED:
            this.control.classList.remove('disabled');
            this.notifySongReady();
            break;

        case YT.PlayerState.PLAYING:
            this.setCheckTimer();
            this.startProgressTimer();
            break;

        case YT.PlayerState.PAUSED:
        case YT.PlayerState.ENDED:
            this.clearProgressTimer();
            break;
        }
    }

    private notifySongReady(): void {
        if (this.isSongReady) {
            return;
        }

        this.isSongReady = true;
        this.onSongReady?.(this.player?.getDuration());
    }

    // private duration(duration: number): string {
    //     const seconds = Math.round(duration % 60 * 1000) / 1000;
    //     let minutes = Math.floor(duration / 60);
    //     const hours = Math.floor(minutes / 60);
    //     if (hours > 0) {
    //         minutes = Math.floor(minutes % 60);
    //         return `${hours}:${Utils.padTo2Digits(minutes)}:${Utils.padTo2Digits(seconds)}`;
    //     }

    //     return `${minutes}:${seconds}`;
    // }

    private onPlayButton(): void {
        this.clearTimer();
        const section = this.song?.sections[this.nextSection];
        if (!section) {
            return;
        }

        if (section.start < 0) {
            this.onPauseButton();
            return;
        }

        this.currentSection = this.nextSection;
        this.nextSection = this.currentSection + 1;
        const startTime = section.start;
        this.player?.play(startTime);
        this.fullplayer?.play(startTime);
        this.displayCurrentSection(section);
        this.displayNextSection(this.song?.sections[this.nextSection]!);
        this.addPlayedSection(section);
        this.updateProgressDisplay(startTime);
    }

    private onPauseButton(): void {
        this.clearTimer();
        this.clearProgressTimer();
        this.player?.pause();
        this.fullplayer?.pause();
    }

    private clearTimer(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    }

    private startProgressTimer(): void {
        this.clearProgressTimer();
        this.updateProgressDisplay();
        this.progressTimerId = window.setInterval(() => this.updateProgressDisplay(), 200);
    }

    private clearProgressTimer(): void {
        if (this.progressTimerId) {
            clearInterval(this.progressTimerId);
            this.progressTimerId = undefined;
        }
        this.updateProgressDisplay();
    }

    private setCheckTimer(section: number = this.currentSection): void {
        const endTime = this.song?.sections[section].end!;
        const currentTime = this.player?.getCurrentTime()!;
        const timeout = endTime - currentTime - this.skipTime;
        console.log(`endTime:${endTime}, currentTime:${currentTime}, skipTime:${this.skipTime}`);
        if (timeout < 0) {
            console.warn(`endTime-currentTime-skipTime:${timeout}`);
            //seekToNext();
        }

        this.timerId = setTimeout(() => this.seekToNext(), timeout * 1000);
        console.log(this.player?.timestamp(), 'setCheckTimer', Utils.rightPadTo3Digits(timeout), endTime);
    }

    private selectSection(section: number): void {
        console.log('selectSection', section);
        this.nextSection = section;

        this.displayNextSection(this.song?.sections[this.nextSection]!);
    }

    private seekToNext(): void {
        if (this.song?.sections[this.nextSection].start! >= 0) {
            this.seekToSection(this.nextSection);
            this.displayNextSection(this.song?.sections[this.nextSection]!);
        } else {
            console.log(this.player?.timestamp(), 'seekToSection end');
            this.onPauseButton();

            this.currentSection = this.nextSection;
            this.nextSection = 0;

            this.displayNextSection(this.song?.sections[this.nextSection]!);
        }

        this.displayCurrentSection(this.song?.sections[this.currentSection]!);

        this.addPlayedSection(this.song?.sections[this.currentSection]!);
    }

    private addPlayedSection(section: SongSection): void {
        if (this.allSections.innerHTML.length !== 0) {
            this.allSections.innerHTML += ', '
        }
        this.allSections.innerHTML += section.title;
    }

    // private clearNextSection(): void {
    //     this.displayNextSection({ title: '', detail: '', start: -1, end: -1});
    // }

    private displayNextSection(section: SongSection): void {
        this.nextSectionTitle.innerText = section.title;

        const duration = section.end! - section.start;
        if (duration != 0) {
            this.nextSectionDuration.innerText = Utils.formatDuration(duration);
        } else {
            this.nextSectionDuration.innerText = '';
        }
        this.nextSectionDetail.innerText = section.detail;
        this.nextSectionDetail.title = section.detail;
    }
    
    private displayCurrentSection(section: SongSection): void {
        this.currentSectionTitle.innerText = section.title;

        const duration = section.end! - section.start;
        if (duration != 0) {
            this.currentSectionDuration.innerText = Utils.formatDuration(duration);
        } else {
            this.currentSectionDuration.innerText = '';
        }

        this.currentSectionDetail.innerText = section.detail;
        this.currentSectionDetail.title = section.detail;
        this.updateProgressDisplay();
    }

    private onSegmentProgressBar(event: MouseEvent): void {
        const section = this.song?.sections[this.currentSection];
        if (!section || section.start < 0 || section.end === undefined || section.end <= section.start) {
            return;
        }

        const rect = this.segmentProgressBar.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const gotoTime = section.start + (section.end - section.start) * ratio;

        this.clearTimer();
        this.player?.play(gotoTime);
        this.fullplayer?.play(gotoTime);
        this.updateProgressDisplay(gotoTime);
    }

    private onSongProgressBar(event: MouseEvent): void {
        const songDuration = this.getSongDuration();
        if (songDuration <= 0) {
            return;
        }

        const rect = this.songProgressBar.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const gotoTime = songDuration * ratio;

        this.clearTimer();
        this.player?.play(gotoTime);
        this.fullplayer?.play(gotoTime);
        this.updateCurrentSectionForTime(gotoTime);
        this.updateProgressDisplay(gotoTime);
    }

    private updateProgressDisplay(currentTime: number = this.player?.getCurrentTime() ?? 0): void {
        const section = this.song?.sections[this.currentSection];
        const songDuration = this.getSongDuration();
        const songElapsed = songDuration > 0 ? Math.min(Math.max(currentTime, 0), songDuration) : Math.max(currentTime, 0);
        const songProgress = songDuration > 0 ? songElapsed / songDuration : 0;

        this.songProgressFill.style.width = `${songProgress * 100}%`;
        this.songProgressTime.innerText =
            `${Utils.formatDurationForPosition(songElapsed)} / ${Utils.formatDuration(songDuration)}`;

        if (!section || section.start < 0 || section.end === undefined || section.end <= section.start) {
            this.segmentProgressFill.style.width = '0%';
            this.segmentProgressTime.innerText = '0 / 0.0';
            return;
        }

        const sectionDuration = section.end - section.start;
        const sectionElapsed = Math.min(Math.max(currentTime - section.start, 0), sectionDuration);
        const progress = sectionDuration > 0 ? sectionElapsed / sectionDuration : 0;

        this.segmentProgressFill.style.width = `${progress * 100}%`;
        this.segmentProgressTime.innerText =
            `${Utils.formatDurationForPosition(sectionElapsed)} / ${Utils.formatDuration(sectionDuration)}`;
    }

    private getSongDuration(): number {
        const sections = this.song?.sections ?? [];
        const songEnd = this.song?.end ?? this.song?.duration ?? 0;
        return Math.max(
            songEnd,
            ...sections
                .filter((section) => section.start >= 0)
                .map((section) => section.end ?? section.start),
            0);
    }

    private renderSongProgressMarkers(): void {
        const songDuration = this.getSongDuration();
        const sections = this.song?.sections ?? [];

        if (songDuration <= 0) {
            this.songProgressMarkers.innerHTML = '';
            return;
        }

        this.songProgressMarkers.innerHTML = sections
            .filter((section) => section.start >= 0)
            .map((section) => {
                const left = Math.min(Math.max(section.start / songDuration, 0), 1) * 100;
                return `<div class="progressMarker" style="left: ${left}%" title="${this.escapeHtml(section.title)}"></div>`;
            })
            .join('');
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private updateCurrentSectionForTime(currentTime: number): void {
        const sections = this.song?.sections ?? [];
        const sectionIndex = sections.findIndex((section) =>
            section.start >= 0 &&
            section.end !== undefined &&
            currentTime >= section.start &&
            currentTime < section.end);

        if (sectionIndex < 0) {
            return;
        }

        this.currentSection = sectionIndex;
        this.nextSection = sectionIndex + 1;
        this.displayCurrentSection(sections[this.currentSection]);
        this.displayNextSection(sections[this.nextSection]);
    }

    private seekToSection(section: number): void {
        this.timerId = undefined;

        if (this.song?.sections[this.currentSection].end !== this.song?.sections[section].start) {
            const gotoTime = this.song?.sections[section].start!;
            this.fullplayer?.seekTo(gotoTime);
            this.player?.seekTo(gotoTime);
            const currentTime = this.player?.getCurrentTime()!;
            console.log(this.player?.timestamp(), 'seekToSection', section, Utils.rightPadTo3Digits(currentTime), gotoTime);
        } else {
            this.setCheckTimer(this.nextSection);
        }

        this.currentSection = this.nextSection;
        this.nextSection = this.currentSection + 1;
        console.log(this.player?.timestamp(), `seekToSection current=${this.currentSection}, next=${this.nextSection}`);
    }
}
