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

    // level two
    protected async loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
        const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelOneContainer: HTMLDivElement = document.getElementById(Content.L1_CONTAINER_ID) as HTMLDivElement;
        const videoLoaded: boolean = (searchResultsThumbnailContainer.getAttribute(Content.DATA_LOAD_STATUS) === Content.LOADED);
        const videoLoading: boolean = (searchResultsThumbnailContainer.getAttribute(Content.DATA_LOAD_STATUS) === Content.LOADING);
        if (videoLoaded) {
            window.scrollTo({top: 100});
            searchResultsThumbnailContainer.removeAttribute(Content.DATA_LOAD_STATUS); // remove the load status
            levelOneContainer.style.display = Content.NONE; // hide level 1
            document.getElementById(levelTwoHref).style.display = Content.BLOCK; // show level 2
        } else if (!videoLoading) {
            // after the first click, the video's load status is loading
            searchResultsThumbnailContainer.setAttribute(Content.DATA_LOAD_STATUS, Content.LOADING);
            searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER + Utilities.SPACE + Content.LOADING;

            // create level 2
            const levelTwoContainer: HTMLDivElement = Utilities.createTagWithId("div", levelTwoHref) as HTMLDivElement;
            levelTwoContainer.style.display = Content.NONE;
            document.querySelector("body").appendChild(levelTwoContainer);

            const levelTwoVideo = this.createLevelTwoVideo(searchResultsThumbnailContainer);
            const bestSource = await this.getBestSource(levelTwoHref);
            levelTwoVideo.appendChild(bestSource);
            levelTwoContainer.appendChild(levelTwoVideo);

            // the go back button
            const backButton: HTMLDivElement = Utilities.createTagWithId("div", "go-to-level-one") as HTMLDivElement;
            backButton.className = "go-back-video";
            const intervalId = setInterval(() => {
                const video: { lastWatched: number, currentTime: number } = {
                    lastWatched: Date.now(),
                    currentTime: levelTwoVideo.currentTime
                };
                localStorage.setItem(levelTwoHref, JSON.stringify(video));
            }, 1000);
            backButton.onclick = () => {
                clearInterval(intervalId);
                levelOneContainer.style.display = Content.BLOCK; // show level 1
                levelTwoContainer.remove(); // destroy level 2
                searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER;
                window.scrollTo({top: levelOneScrollPosition});
                const lastWatchedOne: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
                this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement as HTMLDivElement); // do this asynchronously
            }
            levelTwoContainer.appendChild(backButton);

            // refresh should be at the end of the page
            const refresh: HTMLButtonElement = Utilities.createTagWithClassName("button", "refresh") as HTMLButtonElement;
            refresh.type = "button";
            refresh.onclick = () => {
                levelTwoVideo.load();
                levelTwoVideo.scrollIntoView();
            };
            refresh.innerText = "Reload the video";
            levelTwoContainer.appendChild(refresh);
        }
    }

    private createLevelTwoVideo(searchResultsThumbnailContainer: HTMLDivElement): HTMLVideoElement {
        const levelTwoVideo: HTMLVideoElement = document.createElement("video");
        levelTwoVideo.controls = true;
        levelTwoVideo.preload = "auto";
        levelTwoVideo.playsInline = true;
        levelTwoVideo.muted = true;
        levelTwoVideo.onloadedmetadata = async () => {
            levelTwoVideo.onloadedmetadata = null;
            // manually autoplay
            await Utilities.waitFor(100);
            await levelTwoVideo.play();
            await Utilities.waitFor(100);
            levelTwoVideo.pause();
            // the video is loaded
            searchResultsThumbnailContainer.setAttribute(Content.DATA_LOAD_STATUS, Content.LOADED);
            searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER + Utilities.SPACE + Content.LOADED;
        }
        levelTwoVideo.onerror = async () => {
            await Utilities.waitFor(Utilities.randomNumber(5000, 10000));
            levelTwoVideo.load();
        }

        return levelTwoVideo;
    }

    private async getBestSource(levelTwoHref: string): Promise<HTMLSourceElement> {
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
