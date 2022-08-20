abstract class Video extends Content {
    // level one
    protected saveDuration(levelOneThumbnail: HTMLImageElement, lastAvailableTwo: HTMLDivElement): void {
        lastAvailableTwo.setAttribute(Content.DATA_DURATION, levelOneThumbnail.getAttribute(Content.DATA_DURATION));
    }

    protected updateLevelOne(levelTwoHref: string, lastWatchedOne: HTMLDivElement, lastWatchedTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
        lastAvailableOne.innerText = "Duration:";
        lastAvailableTwo.innerText = lastAvailableTwo.getAttribute(Content.DATA_DURATION);
        lastWatchedOne.innerText = "Never watched before";
        lastWatchedTwo.innerText = "New";

        try {
            const video: { lastWatched: number, currentTime: number } = JSON.parse(localStorage.getItem(levelTwoHref));
            lastWatchedOne.innerText = "Watched: " + Utilities.getTimeAgo(video.lastWatched + "");
            lastWatchedTwo.innerText = Utilities.getCurrentTime(video.currentTime);
        } catch (ignored) {
        }
    }

    // level two - it doesn't exist for videos
    protected async loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
        searchResultsThumbnailContainer.onclick = null;
        const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelTwoVideo = this.createLevelTwoVideo();
        const bestSource = await this.getBestSource(levelTwoHref);
        levelTwoVideo.appendChild(bestSource);
        const length: number =  searchResultsThumbnailContainer.children.length;
        searchResultsThumbnailContainer.children[length - 1].remove(); // remove the last child.
        searchResultsThumbnailContainer.appendChild(levelTwoVideo);
        levelTwoVideo.onplay = () => {
            const latestContainer: HTMLDivElement = searchResultsThumbnailContainer.getElementsByClassName(Content.LATEST_CONTAINER)[0] as HTMLDivElement;
            const className: string = latestContainer.getAttribute(Content.CLASS);
            latestContainer.setAttribute(Content.CLASS, className + " hide");
        }

        // update last watched
        const lastWatchedOne: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
        setInterval(() => {
            const video: { lastWatched: number, currentTime: number } = {
                lastWatched: Date.now(),
                currentTime: levelTwoVideo.currentTime
            };
            localStorage.setItem(levelTwoHref, JSON.stringify(video));
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement as HTMLDivElement);
        }, 1000);
    }

    private createLevelTwoVideo(): HTMLVideoElement {
        const levelTwoVideo: HTMLVideoElement = document.createElement("video");
        levelTwoVideo.controls = true;
        levelTwoVideo.muted = true;
        levelTwoVideo.autoplay = true;
        levelTwoVideo.playsInline = true;
        levelTwoVideo.onerror = async () => {
            levelTwoVideo.onerror = null;
            await Utilities.waitFor(Utilities.randomNumber(5000, 10000));
            levelTwoVideo.load();
        }

        return levelTwoVideo;
    }

    protected async getBestSource(levelTwoHref: string): Promise<HTMLSourceElement> {
        const levelTwoSource: HTMLSourceElement = document.createElement("source");
        const videoDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const video: HTMLVideoElement = this.getVideo(videoDocument);
        const sources: NodeListOf<HTMLSourceElement> = video.querySelectorAll("source") as NodeListOf<HTMLSourceElement>;
        // select the best source
        let bestSource: string = null;
        for (const source of sources) {
            bestSource = this.getSource(source);
        }
        if (bestSource === null) {
            bestSource = sources[0].src;
        }
        // order matters (first get the source, then append)
        levelTwoSource.src = bestSource;

        return levelTwoSource;
    }

    protected abstract getVideo(videoDocument: Document): HTMLVideoElement;

    protected abstract getSource(sources: HTMLSourceElement): string;
}
