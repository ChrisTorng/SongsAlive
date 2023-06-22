import { YTPlayer } from "./ytplayer.js";
export class FullScreenPlayer {
    videoId;
    player;
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.videoId = params.get('videoId') || '';
        document.title = params.get('title') || '';
    }
    loadPlayer() {
        this.player = YTPlayer.loadPlayer(this.videoId, this.onYouTubeIframeAPIReady);
    }
    onYouTubeIframeAPIReady() {
        window.opener.setFullPlayer(this.player);
    }
    fullScreen() {
        this.player.fullScreen();
    }
    pauseVideo() {
        this.player.pause();
    }
}
