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

    private readonly skipTime = 0.1;
    private song?: Song;
    private fullplayer?: YTPlayer;
    private player?: YTPlayer;
    private full?: Window;
    private timerId?: number;
    private currentSection = 0;
    private nextSection = 0;

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
    }

    public setSelectSections(): void {
        const selectSections = (<HTMLCollectionOf<HTMLLIElement>>document.getElementsByClassName('selectSection'))
        Array.from(selectSections).forEach((li: HTMLLIElement) => {
                li.addEventListener('click', () => this.selectSection(parseInt(li.dataset.index!)));
            });
    }

    public loadPlayer(newSong: Song): void {
        this.song = newSong;
        this.player = YTPlayer.loadPlayer(this.song.videoId!);
        this.player.onReady = (event) => this.onReady(event);
        this.player.onStateChange = (event) => this.onStateChange(event);
    }

    public setCurrentSection(currentSection: number): void {
        this.currentSection = currentSection;
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

        if (isUnmuted) {
            if (this.muteButton) {
                this.muteButton.innerText = 'Unmute';
            }
        } else {
            if (this.muteButton) {
                this.muteButton.innerText = 'Mute';
            }
        }
    }
    
    private onReady(event: YT.PlayerEvent): void {
        this.displayVolumeValue();
    }

    private onStateChange(event: YT.OnStateChangeEvent): void {
        switch (event.data) {
        case YT.PlayerState.CUED:
            this.control.classList.remove('disabled');
            break;

        case YT.PlayerState.PLAYING:
            this.setCheckTimer();
            break;
        }
    }

    private duration(duration: number): string {
        const seconds = Math.round(duration % 60 * 1000) / 1000;
        let minutes = Math.floor(duration / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            minutes = Math.floor(minutes % 60);
            return `${hours}:${Utils.padTo2Digits(minutes)}:${Utils.padTo2Digits(seconds)}`;
        }

        return `${minutes}:${seconds}`;
    }

    private onPlayButton(): void {
        this.clearTimer();
        const startTime = this.song?.sections[this.nextSection].start!;
        this.player?.play(startTime);
        this.fullplayer?.play(startTime);
    }

    private onPauseButton(): void {
        this.clearTimer();
        this.player?.pause();
        this.fullplayer?.pause();
    }

    private clearTimer(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
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
        console.log(this.player?.timestamp(), 'setCheckTimer', Utils.rightPadTo3Digits(currentTime), endTime);
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

        if (this.allSections.innerHTML.length !== 0) {
            this.allSections.innerHTML += ', '
        }
        this.allSections.innerHTML += this.song?.sections[this.currentSection].title;
    }

    private clearNextSection(): void {
        this.displayNextSection({ title: '', detail: '', start: -1, end: -1});
    }

    private displayNextSection(section: SongSection): void {
        this.nextSectionTitle.innerText = section.title;

        const duration = section.end - section.start;
        if (duration != 0) {
            this.nextSectionDuration.innerText = Utils.rightPadTo2Digits(duration);
        } else {
            this.nextSectionDuration.innerText = '';
        }
        this.nextSectionDetail.innerText = section.detail;
        this.nextSectionDetail.title = section.detail;
    }
    
    private displayCurrentSection(section: SongSection): void {
        this.currentSectionTitle.innerText = section.title;

        const duration = section.end - section.start;
        if (duration != 0) {
            this.currentSectionDuration.innerText = Utils.rightPadTo2Digits(duration);
        } else {
            this.currentSectionDuration.innerText = '';
        }

        this.currentSectionDetail.innerText = section.detail;
        this.currentSectionDetail.title = section.detail;
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
