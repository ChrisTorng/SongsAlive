class FullScreenPlayer {
    private videoId: string;
    private player!: YT.Player;
    
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.videoId = params.get('videoId') || '';
        document.title = params.get('title') || '';
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

    public loadPlayer(): void {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    }

    public onYouTubeIframeAPIReady(): void {
        this.player = new YT.Player('player', {
            playerVars: {
                origin: window.location.origin,
                playsinline: 1,
                controls: 0,
                rel: 0
                //modestbranding: 0
            },
            events: {
                onReady: this.onReady.bind(this),
                onStateChange: this.onStateChange.bind(this),
                onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
                onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
                onError: this.onError.bind(this)
                // onApiChange: onApiChange
        }
        });

        window.opener.setFullPlayer(this.player);
    }

    private onReady(event: YT.PlayerEvent): void {
        this.player.cueVideoById(this.videoId);
        this.player.mute();
    }

    private onStateChange(event: YT.OnStateChangeEvent): void {
        console.log('onStateChange', event.data);
    }

    private onPlaybackQualityChange(event: YT.OnPlaybackQualityChangeEvent): void {
        console.log("onPlaybackQualityChange", event.data);
    }

    private onPlaybackRateChange(event: YT.OnPlaybackRateChangeEvent): void {
        console.log("onPlaybackRateChange", event.data);
    }

    private onError(event: YT.OnErrorEvent): void {
        console.log("onError", event.data);
    }
}