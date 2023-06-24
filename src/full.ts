import { YTPlayer } from "./ytplayer.js";

export class FullScreenPlayer {
    private videoId: string;
    private player!: YTPlayer;
    
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.videoId = params.get('videoId') || '';
        document.title = params.get('title') || '';
    }

    public loadPlayer(): void {
        this.player = YTPlayer.loadPlayer(this.videoId, this.onYouTubeIframeAPIReady);
        this.player.onReady = (event) => this.onReady(event);
    }

    public onYouTubeIframeAPIReady(): void {
        window.opener.setFullPlayer(this);
    }

    private onReady(event: YT.PlayerEvent): void {
        this.player.muteToggle();
    }
    
    public fullScreen(): void {
        this.player.fullScreen();
    }
}
