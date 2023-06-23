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
        this.player.onReady = () => this.onReady();
    }

    public onYouTubeIframeAPIReady(): void {
        window.opener.setFullPlayer(this);
    }

    private onReady(): void {
        this.player.muteToggle();
    }
    
    public fullScreen(): void {
        this.player.fullScreen();
    }

    public pauseVideo(): void {
        this.player.pause();
    }
}
