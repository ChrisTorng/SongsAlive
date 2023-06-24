import { Utils } from "./utils.js";

declare global {
    interface Window {
        onYouTubeIframeAPIReady:  () => void;
    }
}

export class YTPlayer {
    private videoId: string;
    private player?: YT.Player;
    private lastTimestamp = new Date();

    public onYouTubeIframeAPIReady?: () => void;
    public onReady?: (event: YT.PlayerEvent) => void;
    public onStateChange?: (event: YT.OnStateChangeEvent) => void;

    public static loadPlayer(videoId: string, onYouTubeIframeAPIReady?: () => void): YTPlayer {
        const player = new YTPlayer(videoId, onYouTubeIframeAPIReady);
        window.onYouTubeIframeAPIReady = () => player.onYouTubeIframeAPIReadyHandler();

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        return player;
    }

    private onYouTubeIframeAPIReadyHandler(): void {
        this.player = new YT.Player('player', {
            playerVars: {
                origin: window.location.origin,
                playsinline: 1,
                controls: 0,
                rel: 0
            },
            events: {
                onReady: this.onReadyHandler.bind(this),
                onStateChange: this.onStateChangeHandler.bind(this),
                onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
                onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
                onError: this.onError.bind(this)
            }
        });

        if (this.onYouTubeIframeAPIReady) {
            this.onYouTubeIframeAPIReady();
        }
    }

    public fullScreen(): void {
        const playerElement: HTMLElement = document.getElementById('player')!;
        const requestFullScreen = playerElement.requestFullscreen // ||
            // playerElement.webkitRequestFullscreen ||
            // playerElement.mozRequestFullScreen ||
            // playerElement.msRequestFullscreen;
        if (requestFullScreen) {
            requestFullScreen.bind(playerElement)();
        }
    }

    constructor(videoId: string, onYouTubeIframeAPIReady?: () => void) {
        this.videoId = videoId;
        this.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    public volumeUp(): number {
        const volume = this.Volume;
        if (volume >= 100) {
            return 100;
        }

        let newVolume = volume + 10;
        if (newVolume > 100) {
            newVolume = 100;
        }

        this.Volume = newVolume;
        return newVolume;
    }
    
    public volumeDown(): number {
        const volume = this.Volume;
        if (volume <= 0) {
            return 0;
        }

        let newVolume = volume - 10;
        if (newVolume < 0) {
            newVolume = 0;
        }

        this.Volume = newVolume;
        return newVolume;
    }

    public set Volume(volume: number) {
        this.player?.setVolume(volume)!;
    }

    public get Volume(): number {
        return this.player?.getVolume()!;
    }

    public muteToggle(): boolean {
        const isMuted = this.player?.isMuted() ?? false;

        if (isMuted) {
            this.player?.unMute();
        } else {
            this.player?.mute();
        }
        return !isMuted;
    }
    
    private onReadyHandler(event: YT.PlayerEvent): void {
        console.log(this.timestamp(), 'onReadyHandler');
        // Raise event before cueVideoById, or the volume will got undefined value
        this.onReady?.(event);
        this.player?.cueVideoById(this.videoId!);
    }

    private onStateChangeHandler(event: YT.OnStateChangeEvent): YT.PlayerState {
        console.log(this.timestamp(), 'onStateChangeHandler', this.playerState(event.data));
        this.onStateChange?.(event);
        return event.data;
    }

    private playerState(state: YT.PlayerState): string {
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
                return (<any>state).toString();
        }
    }

    private onPlaybackQualityChange(event: YT.OnPlaybackQualityChangeEvent): void {
        console.log("onPlaybackQualityChange", event.data);
    }

    private onPlaybackRateChange(event: YT.OnPlaybackRateChangeEvent): void {
        console.log("onPlaybackRateChange", event.data);
    }

    private onError(event: YT.OnErrorEvent): void {
        console.error("onError", event.data);
    }

    // private onApiChange(event: YT.PlayerEvent): void {
    //     console.log('onApiChange');
    //     console.log(player.getOptions());

    //     var options = player.getOptions('captions');
    //     console.log(options);

    //     for (var index in options) {
    //         console.log(options[index], player.getOption('captions', options[index]));
    //     }
    // }

    public play(startTime: number): void {
        this.player?.loadVideoById(this.videoId, startTime);
    }

    public pause(): void {
        this.player?.pauseVideo();
        this.displayStatus();
    }

    private displayStatus(): void {
        console.log('getVideoLoadedFraction', this.player?.getVideoLoadedFraction());
        console.log('getPlayerState', this.playerState(this.player?.getPlayerState()!));
        console.log('getCurrentTime', this.player?.getCurrentTime());
    }
    
    public seekTo(gotoTime: number): number {
        this.player?.seekTo(gotoTime, true);
        return this.player?.getCurrentTime()!;
    }

    public getCurrentTime(): number {
        return this.player?.getCurrentTime()!;
    }

    public timestamp(): string {
        var newTimestamp = new Date();
        const timestampText =
            `${newTimestamp.getMinutes()}:${newTimestamp.getSeconds()}.${Utils.padTo3Digits(newTimestamp.getMilliseconds())}`;
        var timeSpent = (newTimestamp.getTime() - this.lastTimestamp.getTime()) / 1000;

        this.lastTimestamp = newTimestamp;
        return `${timestampText} ${Utils.rightPadTo3Digits(timeSpent)}`;
    }
}
