const CSS_INNER_HTML: string = `/* level 1 */
body {
    margin: 0;
    background-color: black;
    padding-top: 100px;
    padding-bottom: 200px;
}

img, video {
    display: block;
    width: 100%;
}

video {
    margin-bottom: 100px;
}

.loading {
    background-color: hsl(30, 75%, 50%);
}

.loaded {
    background-color: hsl(120, 75%, 50%);
}

.loading > img, .loaded > img {
    opacity: 0.5;
}

.level-one-thumbnail-container {
    position: relative;
}

.latest-container {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: end;
    width: 100%;
    font-family: sans-serif;
    color: white;
}

.last-watched-element, .last-available-element {
    background-color: rgba(0, 0, 0, 0.5);
    width: 50%;
}

.last-watched-element > div:nth-child(2), .last-available-element > div:nth-child(2) {
    font-size: 2rem;
}

.last-available-element {
    display: flex;
    flex-direction: column;
    align-items: end;
}

/* level 2 */
.go-back-video {
    width: 100%;
    height: 100vh;
    background-color: hsl(0, 50%, 25%);
}

.refresh {
    margin: 200px 0;
}

.go-back-manga, .go-back {
    width: 100%;
    height: 30vh;
    background-color: hsl(0, 50%, 25%);
}

.refresh, .chapter-button {
    font-size: 1.2rem;
    line-height: 3;
    text-align: center;
    width: 100%;
}

.chapter-container {
    display: flex;
    font-size: 1.2rem;
    font-family: sans-serif;
    color: white;
    align-items: center;
}

.last-read-container {
    width: 100%;
}

.last-read {
    margin-left: 10px;
}

.level-two-thumbnail-container {
    position: relative;
    width: 50%;
}

.last-read-gallery, .gallery-page {
    background-color: rgba(0, 0, 0, 0.5);
}

.last-read-gallery {
    margin-right: auto;
}

.gallery-page {
    margin-left: auto;
    font-size: 2rem;
}

/* level 3 */
.go-back {
    position: fixed;
    left: 0;
    top: 0;
    animation: fadeout 1s linear 0s 1 normal forwards running;
}

@keyframes fadeout {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.info, .info-clicked {
    position: fixed;
    left: 0;
    top: 30%;
    height: 30%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.info {
    background-color: rgba(0, 0, 0, 0.0);
}

.info-clicked {
    background-color: rgba(0, 0, 0, 0.7);
}

.info-content {
    display: none;
}

.info-content-clicked {
    display: block;
    font-size: 1.1rem;
    font-family: sans-serif;
    color: white;
    line-height: 2;
    margin: 20px;
}
`;

function loadContent(): void {
    document.write("<html><head></head><body></body></html>");
    const body = document.querySelector("body");
    const head = document.querySelector("head");
    const levelOneContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L1_CONTAINER_ID) as HTMLDivElement;
    body.appendChild(levelOneContainer);
    const styleTag: HTMLScriptElement = Utilities.createTagWithId("style", "content-enhancer-css") as HTMLScriptElement;
    styleTag.innerHTML = CSS_INNER_HTML;
    head.appendChild(styleTag);

    const content: Content = createContent(location.href);
    content?.load(); // asynchronously
}

function createContent(href: string): Content {
    let content: Content = null;
    if (href.includes(Content.TOKYOMOTION)) {
        content = new TokyoMotion(href);
    } else if (href.includes(Content.KISSJAV)) {
        content = new KissJav(href);
    } else if (href.includes(Content.NHENTAI)) {
        content = new NHentai(href);
    } else if (href.includes(Content.ASURASCANS)) {
        content = new AsuraScans(href);
    }

    return content;
}

interface IContent {
    load(): Promise<void>;
}

abstract class Content implements IContent {

    public static readonly TOKYOMOTION: string = "tokyomotion";
    public static readonly KISSJAV: string = "kissjav";
    public static readonly NHENTAI: string = "nhentai";
    public static readonly ASURASCANS: string = "asurascans";
    public static readonly L1_CONTAINER_ID: string = "level-one-container";
    protected static readonly L2_CONTAINER_ID: string = "level-two-container";
    protected static readonly L3_CONTAINER_ID: string = "level-three-container";
    protected static readonly LOOK_AHEAD: string = "2000%"; // look ahead 20 screens
    protected static readonly DATA_SRC: string = "data-src";
    protected static readonly DATA_CFSRC: string = "data-cfsrc";
    protected static readonly DATA_LEVEL_TWO_HREF: string = "data-level-two-href";
    protected static readonly DATA_LEVEL_THREE_HREF: string = "data-level-three-href";
    protected static readonly DATA_DURATION: string = "data-duration";
    protected static readonly LEVEL_ONE_THUMBNAIL_CONTAINER: string = "level-one-thumbnail-container";
    protected static readonly LEVEL_TWO_THUMBNAIL_CONTAINER: string = "level-two-thumbnail-container";
    protected static readonly OBSERVE_THUMBNAIL: string = "observe-thumbnail";
    protected static readonly OBSERVE_IMAGE: string = "observe-image";
    protected static readonly EPH_NUM: string = "eph-num";
    protected static readonly THUMBS: string = "thumbs";
    protected static readonly LAST_WATCHED_1: string = "last-watched-one";
    protected static readonly LAST_WATCHED_2: string = "last-watched-two";
    protected static readonly LAST_AVAILABLE_1: string = "last-available-one";
    protected static readonly LAST_AVAILABLE_2: string = "last-available-two";
    protected static readonly CLASS: string = "class";
    protected static readonly FLEX: string = "flex";
    protected static readonly NONE: string = "none";
    protected static readonly LOADING___: string = "Loading...";
    protected static readonly DATA_LOAD_STATUS = "data-load-status";
    protected static readonly LOADED = "loaded";
    protected static readonly LOADING = "loading";
    protected static readonly BLOCK: string = "block";

    private readonly href: string;
    protected searchResultsDocument: Document;
    protected thumbnailContainers: HTMLDivElement[];
    protected breakLoop: boolean;
    private nextSearchResultsHref: string;
    private searchResultsThumbnails: HTMLElement[];

    protected constructor(href: string) {
        this.href = href;
    }

    // level one
    public async load(href: string = this.href): Promise<void> {
        this.searchResultsDocument = await Utilities.getResponseDocument(href);
        this.setNextSearchResultsHref();
        this.createThumbnailContainers();
        await this.loadThumbnailContainer(this.thumbnailContainers, document.getElementById(Content.L1_CONTAINER_ID) as HTMLDivElement);
    }

    private setNextSearchResultsHref(): void {
        this.nextSearchResultsHref = null;
        const anchor: HTMLAnchorElement = this.getAnchor();
        if (anchor !== null) {
            this.nextSearchResultsHref = anchor.href;
        }
    }

    protected abstract getAnchor(): HTMLAnchorElement;

    private createThumbnailContainers(): void {
        this.thumbnailContainers = [];
        this.searchResultsThumbnails = this.getSearchResultsThumbnails();
        for (const searchResultsThumbnail of this.searchResultsThumbnails) {
            this.appendThumbnailContainer(searchResultsThumbnail);
        }
    }

    protected abstract getSearchResultsThumbnails(): HTMLElement[];

    protected abstract appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void;

    protected pushThumbnail(thumbnail: HTMLImageElement, levelTwoAnchor: HTMLAnchorElement) {
        const thumbnailContainer = this.createThumbnailContainer(thumbnail, levelTwoAnchor);
        this.thumbnailContainers.push(thumbnailContainer);
    }

    protected createThumbnailContainer(levelOneThumbnail: HTMLImageElement, levelTwoAnchor: HTMLAnchorElement): HTMLDivElement {
        const thumbnailContainer: HTMLDivElement = Utilities.createTagWithClassName("div", Content.LEVEL_ONE_THUMBNAIL_CONTAINER) as HTMLDivElement;
        thumbnailContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoAnchor.href);

        const thumbnail: HTMLImageElement = new Image();
        const latestContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "latest-container") as HTMLDivElement;
        const lastWatched: HTMLDivElement = Utilities.createTagWithClassName("div", "last-watched-element") as HTMLDivElement;
        const lastAvailable: HTMLDivElement = Utilities.createTagWithClassName("div", "last-available-element") as HTMLDivElement;
        const lastWatchedOne: HTMLDivElement = Utilities.createTagWithId("div", Content.LAST_WATCHED_1 + levelTwoAnchor.href) as HTMLDivElement;
        lastWatchedOne.innerText = Content.LOADING___;
        const lastWatchedTwo: HTMLDivElement = Utilities.createTagWithId("div", Content.LAST_WATCHED_2 + levelTwoAnchor.href) as HTMLDivElement;
        lastWatchedTwo.innerText = Content.LOADING___;
        const lastAvailableOne: HTMLDivElement = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_1 + levelTwoAnchor.href) as HTMLDivElement;
        lastAvailableOne.innerText = Content.LOADING___;
        const lastAvailableTwo: HTMLDivElement = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_2 + levelTwoAnchor.href) as HTMLDivElement;
        lastAvailableTwo.innerText = Content.LOADING___;

        this.saveDuration(levelOneThumbnail, lastAvailableTwo);

        lastWatched.appendChild(lastWatchedOne);
        lastWatched.appendChild(lastWatchedTwo);
        lastAvailable.appendChild(lastAvailableOne);
        lastAvailable.appendChild(lastAvailableTwo);
        latestContainer.appendChild(lastWatched);
        latestContainer.appendChild(lastAvailable);
        thumbnailContainer.appendChild(latestContainer);

        thumbnail.setAttribute(Content.DATA_SRC, levelOneThumbnail.src);
        thumbnailContainer.appendChild(thumbnail);
        thumbnailContainer.onclick = async () => {
            await this.loadLevelTwo(thumbnailContainer, window.scrollY);
        }

        return thumbnailContainer;
    }

    protected saveDuration(levelOneThumbnail: HTMLImageElement, lastAvailableTwo: HTMLDivElement): void {
    }

    protected async loadThumbnailContainer(thumbnailContainers: HTMLDivElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
        const thumbnailContainersLength = thumbnailContainers.length;
        if (index < thumbnailContainersLength) {
            const thumbnailContainer = thumbnailContainers[index];
            const thumbnail: HTMLImageElement = thumbnailContainer.querySelector("img");
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
            thumbnail.onload = async () => {
                await this.loadThumbnailContainer(thumbnailContainers, container, ++index);
            }
            thumbnail.onerror = async () => {
                await Utilities.onImageLoadError(thumbnail);
            }
            if (index === thumbnailContainersLength - 1 && container.id === Content.L1_CONTAINER_ID) {
                thumbnail.className = Content.OBSERVE_THUMBNAIL;
            }
            container.appendChild(thumbnailContainer);
        } else if (index === thumbnailContainersLength && container.id === Content.L1_CONTAINER_ID) {
            this.observeLastThumbnail();
            for (const thumbnailContainer of thumbnailContainers) {
                await this.updateThumbnailContainer(thumbnailContainer);
            }
        }
    }

    private observeLastThumbnail() {
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const thumbnail: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(thumbnail);
                    thumbnail.removeAttribute(Content.CLASS);
                    const href: string = this.nextSearchResultsHref;
                    if (href !== null) {
                        await this.load(href);
                    }
                }
            })
        }
        const options: {} = {
            root: null,
            rootMargin: Content.LOOK_AHEAD
        }
        const observer: IntersectionObserver = new IntersectionObserver(callback, options);
        const thumbnail: HTMLImageElement = document.querySelector(Utilities.PERIOD + Content.OBSERVE_THUMBNAIL) as HTMLImageElement;
        observer.observe(thumbnail);
    }

    protected async updateThumbnailContainer(thumbnailContainer: HTMLDivElement): Promise<void> {
        const levelTwoHref: string = thumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const lastWatchedOne: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
        const lastWatchedTwo: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_2 + levelTwoHref) as HTMLDivElement;
        const lastAvailableOne: HTMLDivElement = document.getElementById(Content.LAST_AVAILABLE_1 + levelTwoHref) as HTMLDivElement;
        const lastAvailableTwo: HTMLDivElement = document.getElementById(Content.LAST_AVAILABLE_2 + levelTwoHref) as HTMLDivElement;

        await this.updateLevelOne(levelTwoHref, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo);
    }

    protected abstract updateLevelOne(levelTwoHref: string, lastWatchedOne: HTMLDivElement, lastWatchedTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void;

    // level two
    protected abstract loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): void;
}

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

abstract class Manga extends Content {
    // level one
    protected async updateLevelOne(levelTwoHref: string, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): Promise<void> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const mangaCollection: HTMLDivElement[] = this.getMangaCollection(mangaDocument);
        this.updateLevelOneManga(mangaCollection, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }

    protected abstract getMangaCollection(mangaDocument: Document): HTMLDivElement[];

    protected updateLevelOneManga(mangaCollection: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
        lastReadOne.innerText = "Never watched before";
        lastReadTwo.innerText = "New";
        const readCollection: { name: string, lastRead: number }[] = [];
        let lastReadFound: boolean = false;
        for (let i = 0; i < mangaCollection.length; i++) {
            const item = mangaCollection[i];
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(item);
            const name: string = this.getItemName(levelThreeAnchor);
            const lastReadStorage: string = localStorage.getItem(levelThreeAnchor.href);
            if (lastReadStorage !== null) {
                lastReadFound = true;
                const lastRead: number = parseInt(lastReadStorage);
                readCollection.push({
                    name,
                    lastRead
                })
            }
        }

        if (lastReadFound) {
            // I caved in and got some help for this. It returns the object that has the greatest lastRead
            const lastReadItem: { name: string, lastRead: number } = readCollection.reduce(Utilities.getLastReadChapter);
            lastReadOne.innerText = "Read: " + Utilities.getTimeAgo(lastReadItem.lastRead + "");
            lastReadTwo.innerText = this.getLastReadTwoInnerText(lastReadItem.name);
        }

        lastAvailableOne.innerText = this.getLastAvailableOneInnerText();
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(mangaCollection);
    }

    protected abstract getLevelThreeAnchor(item: HTMLDivElement): HTMLAnchorElement;

    protected abstract getItemName(levelThreeAnchor: HTMLAnchorElement): string;

    protected abstract getLastReadTwoInnerText(lastReadItemName: string): string;

    protected abstract getLastAvailableOneInnerText(): string;

    protected abstract getLastAvailableTwoInnerText(mangaCollection: HTMLDivElement[]): string;

    // level two
    protected async loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
        window.scrollTo({top: 100});
        // create level 2
        const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelTwoContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L2_CONTAINER_ID) as HTMLDivElement;
        levelTwoContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoHref);
        levelTwoContainer.style.display = Content.FLEX;
        document.querySelector("body").appendChild(levelTwoContainer);
        document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.NONE; // hide level 1
        const backButton: HTMLDivElement = Utilities.createTagWithId("div", "go-to-level-one") as HTMLDivElement;
        backButton.className = "go-back-manga";
        backButton.onclick = () => {
            document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            window.scrollTo({top: levelOneScrollPosition});
            const lastWatchedOne: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement as HTMLDivElement); // do this asynchronously
        }
        levelTwoContainer.appendChild(backButton);

        // get the gallery thumbnails
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        this.loadManga(levelTwoContainer, mangaDocument);
    }

    protected abstract loadManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document): void;

    // level three
    protected async loadLevelThree(elementContainer: HTMLDivElement, levelTwoScrollPosition: number, infoClicked = false): Promise<void> {
        this.breakLoop = false;
        window.scrollTo({top: 100});

        // create level 3
        const levelTwoContainer: HTMLDivElement = document.getElementById(Content.L2_CONTAINER_ID) as HTMLDivElement;
        const levelThreeHref: string = elementContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const levelThreeContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L3_CONTAINER_ID) as HTMLDivElement;
        levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
        document.querySelector("body").appendChild(levelThreeContainer);
        levelTwoContainer.style.display = Content.NONE; // hide level 2

        // create the back button
        const backButton: HTMLDivElement = Utilities.createTagWithId("div", "go-to-level-two") as HTMLDivElement;
        backButton.className = "go-back";
        backButton.onclick = () => {
            // stop requests
            this.breakLoop = true;

            levelTwoContainer.style.display = Content.FLEX; // show level 2
            levelThreeContainer.remove(); // destroy level 3
            window.scrollTo({top: levelTwoScrollPosition});
        };
        levelThreeContainer.appendChild(backButton);

        // display info
        const span: HTMLSpanElement = Utilities.createTagWithClassName("span", "info-content") as HTMLSpanElement;
        span.innerText = levelThreeHref;
        const info: HTMLDivElement = Utilities.createTagWithClassName("div", "info") as HTMLDivElement;
        info.onclick = () => {
            infoClicked = !infoClicked; // change the status
            if (infoClicked) {
                info.className = "info-clicked";
                span.className = "info-content-clicked";
            } else {
                info.className = "info";
                span.className = "info-content";
            }
        }
        info.appendChild(span);
        levelThreeContainer.appendChild(info);

        // now it's time to load the images
        await this.loadImages(levelThreeContainer);
    }

    protected abstract loadImages(levelThreeContainer: HTMLDivElement): Promise<void>;

    protected abstract observeImage(image: HTMLImageElement): void;
}

abstract class HManga extends Manga {
    // level one
    protected getLastReadTwoInnerText(lastReadItemName: string): string {
        return "Page " + lastReadItemName;
    }

    protected getLastAvailableOneInnerText(): string {
        return "Total pages:";
    }

    // level two
    protected async loadManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document): Promise<void> {
        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers: HTMLDivElement[] = [];

        this.removeExtraDiv();

        const galleryThumbnailsList: HTMLDivElement[] = this.getMangaCollection(mangaDocument);
        for (let i = 0; i < galleryThumbnailsList.length; i++) {
            const galleryThumbnailElement = galleryThumbnailsList[i];
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelTwoThumbnail: HTMLImageElement = this.getLevelTwoThumbnail(levelThreeAnchor);

            const thumbnailContainer: HTMLDivElement = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER) as HTMLDivElement;
            const levelThreeHref: string = levelThreeAnchor.href;
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            }

            const galleryThumbnail: HTMLImageElement = new Image();
            galleryThumbnail.setAttribute(Content.DATA_SRC, levelTwoThumbnail.getAttribute(Content.DATA_SRC));
            thumbnailContainer.append(galleryThumbnail);

            // add the last read information next to the button
            const lastReadContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "latest-container") as HTMLDivElement;
            const lastRead: HTMLSpanElement = Utilities.createTagWithClassName("span", "last-read-gallery") as HTMLSpanElement;
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);

            const pageNumber: HTMLSpanElement = Utilities.createTagWithClassName("span", "gallery-page") as HTMLSpanElement;
            pageNumber.innerText = (i + 1) + "";
            lastReadContainer.appendChild(pageNumber);

            thumbnailContainer.appendChild(lastReadContainer);
            levelTwoThumbnailContainers.push(thumbnailContainer);
        }

        await this.loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
    }

    protected abstract removeExtraDiv(): void;

    protected abstract getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement;

    // level three
    protected async loadImages(levelThreeContainer: HTMLDivElement): Promise<void> {
        const levelThreeHref: string = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null && !this.breakLoop) {
            const imageDocument: Document = await Utilities.getResponseDocument(levelThreeHref);

            // append the image to the container
            const levelThreeImage: HTMLImageElement = this.getLevelThreeImage(imageDocument);
            const image: HTMLImageElement = new Image();
            image.src = levelThreeImage.src;
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            levelThreeContainer.appendChild(image);

            this.setNextAnchor(imageDocument, levelThreeContainer);

            // load the image
            image.onload = async () => {
                await this.loadImages(levelThreeContainer);
            }
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            }

            this.observeImage(image);
        }
    }

    protected observeImage(image: HTMLImageElement): void {
        // observe the image
        const setInfo = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                    const levelThreeHref: string = entryTarget.getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    localStorage.setItem(levelThreeHref, Date.now() + "");
                    Utilities.updateLastRead(document.getElementById(levelThreeHref));
                }
            })
        }
        const infoOptions: {} = {
            root: null,
            rootMargin: "0px"
        }
        const infoObserver: IntersectionObserver = new IntersectionObserver(setInfo, infoOptions);
        infoObserver.observe(image);
    }

    protected abstract getLevelThreeImage(imageDocument: Document): HTMLImageElement;

    protected abstract setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void;
}

abstract class NhManga extends Manga {
    // level one
    protected getLastReadTwoInnerText(lastReadItemName: string): string {
        return lastReadItemName;
    }

    protected getLastAvailableOneInnerText(): string {
        return "Last available:";
    }

    // level two
    protected loadManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document): void {
        levelTwoContainer.style.flexDirection = "column";

        const chapters: HTMLDivElement[] = this.getMangaCollection(mangaDocument);
        for (const chapter of chapters) {
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(chapter);
            const levelThreeHref = levelThreeAnchor.href;

            // add the chapter button
            const chapterContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "chapter-container") as HTMLDivElement;
            chapterContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            chapterContainer.onclick = async () => {
                await this.loadLevelThree(chapterContainer, window.scrollY);
            }

            const chapterButton: HTMLButtonElement = Utilities.createTagWithClassName("button", "chapter-button") as HTMLButtonElement;
            const span: HTMLSpanElement = levelThreeAnchor.children[0] as HTMLSpanElement;
            const maxChapterNameLength: number = 15;
            chapterButton.innerText = span.innerText.substring(0, maxChapterNameLength);
            chapterContainer.appendChild(chapterButton);

            // add the last read information next to the button
            const lastReadContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "last-read-container") as HTMLDivElement;
            const lastRead: HTMLSpanElement = Utilities.createTagWithClassName("span", "last-read") as HTMLSpanElement;
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);

            chapterContainer.appendChild(lastReadContainer);
            levelTwoContainer.appendChild(chapterContainer);
        }
    }

    // level three
    protected async loadImages(levelThreeContainer: HTMLDivElement): Promise<void> {
        const levelThreeHref: string = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const images: HTMLImageElement[] = await this.getMangaImages(levelThreeHref);
        await this.loadMangaImage(images, levelThreeContainer);
    }

    protected async getMangaImages(levelThreeHref: string, retry: boolean = true): Promise<HTMLImageElement[]> {
        const images: HTMLImageElement[] = [];
        const chapter: Document = await Utilities.getResponseDocument(levelThreeHref, retry);
        if (chapter !== null) {
            this.pushImage(chapter, levelThreeHref, images);
        }

        if (images.length > 0) {
            const image: HTMLImageElement = images.pop();
            image.className = Content.OBSERVE_IMAGE;
            images.push(image);
        }

        return images;
    }

    protected abstract pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): void;

    protected async loadMangaImage(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement, index: number = 0): Promise<void> {
        if (index < images.length && !this.breakLoop) {
            const image: HTMLImageElement = images[index];
            levelThreeContainer.append(image);
            image.src = image.getAttribute(Content.DATA_SRC);
            image.onload = async () => {
                await this.loadMangaImage(images, levelThreeContainer, ++index);
            }
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            }
            this.observeImage(image);

        } else if (index === images.length) {
            this.loadNextChapter(images, levelThreeContainer);
        }
    }

    protected observeImage(image: HTMLImageElement) {
        // set the info of the current image
        const setInfo = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const observedImage: HTMLImageElement = entry.target as HTMLImageElement;
                    const infoContent: HTMLSpanElement = document.querySelector(".info-content") as HTMLSpanElement;
                    const levelThreeHref = observedImage.getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    infoContent.innerText = levelThreeHref;
                    localStorage.setItem(levelThreeHref, Date.now() + "");
                    Utilities.updateLastRead(document.getElementById(levelThreeHref));
                }
            })
        }
        const infoOptions: {} = {
            root: null,
            rootMargin: "0px"
        }
        const infoObserver: IntersectionObserver = new IntersectionObserver(setInfo, infoOptions);
        infoObserver.observe(image);
    }

    private loadNextChapter(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement) {
        // load next chapter
        const nextChapter = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const image: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(image);
                    image.removeAttribute(Content.CLASS);
                    const nextChapterHref: string = Utilities.getNextChapterHref(images[0].getAttribute(Content.DATA_LEVEL_THREE_HREF));
                    const nextChapterImages: HTMLImageElement[] = await this.getMangaImages(nextChapterHref, false);
                    if (nextChapterImages.length > 0) {
                        await this.loadMangaImage(nextChapterImages, levelThreeContainer);
                    }
                }
            })
        }
        const nextChapterOptions: {} = {
            root: null,
            rootMargin: Content.LOOK_AHEAD
        }
        const nextChapterObserver: IntersectionObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
        const image: HTMLImageElement = document.querySelector(Utilities.PERIOD + Content.OBSERVE_IMAGE) as HTMLImageElement;
        nextChapterObserver.observe(image);
    }
}

class TokyoMotion extends Video {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".prevnext") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLAnchorElement> = this.searchResultsDocument.querySelectorAll(".thumb-popu") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        if (thumbnailCollection.length === 75) { // we are on the landing page
            thumbnailCollection.splice(0, 63); // we need only the last 12 thumbnails
        }

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail as HTMLAnchorElement;
        const thumbOverlayChildren: HTMLCollectionOf<HTMLElement> = levelTwoAnchor.children[0].children as HTMLCollectionOf<HTMLElement>;
        const thumbnail: HTMLImageElement = thumbOverlayChildren[0] as HTMLImageElement;
        const duration: HTMLDivElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLImageElement;
        thumbnail.setAttribute(Content.DATA_DURATION, duration.innerText.trim());
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    // level two
    protected getVideo(videoDocument: Document): HTMLVideoElement {
        return videoDocument.getElementById("vjsplayer") as HTMLVideoElement;
    }

    protected getSource(source: HTMLSourceElement): string {
        let returnedSource = null;
        if (source.src.includes("/hd/")) {
            returnedSource = source.src;
        }

        return returnedSource;
    }
}

class KissJav extends Video {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".pagination-next") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: HTMLCollectionOf<HTMLLIElement> = this.searchResultsDocument.querySelector(".videos").children as HTMLCollectionOf<HTMLLIElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        let shouldPushThumbnail: boolean = true;
        const cardImageChildren: HTMLCollectionOf<HTMLElement> = searchResultsThumbnail.children[0].children[0].children as HTMLCollectionOf<HTMLElement>;
        const levelTwoAnchor: HTMLAnchorElement = cardImageChildren[0].children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor?.children[0] as HTMLImageElement;
        if (thumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        } else if (thumbnail.getAttribute(Content.DATA_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
            const duration: HTMLDivElement = cardImageChildren[1] as HTMLDivElement;
            const parts = duration.innerText.split("HD");
            thumbnail.setAttribute(Content.DATA_DURATION, parts[parts.length - 1].trim());
        }

        if (shouldPushThumbnail) {
            this.pushThumbnail(thumbnail, levelTwoAnchor);
        }
    }

    // level two
    protected getVideo(videoDocument: Document): HTMLVideoElement {
        return videoDocument.getElementById("player-fluid") as HTMLVideoElement;
    }

    protected getSource(source: HTMLSourceElement): string {
        let returnedSource = null;
        if (source.src.includes("720p")) {
            returnedSource = source.src;
        }

        return returnedSource;
    }
}

class NHentai extends HManga {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".next") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = this.searchResultsDocument.querySelector(".index-container").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        if (thumbnail.getAttribute(Content.DATA_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected getMangaCollection(mangaDocument: Document): HTMLDivElement[] {
        const galleryThumbnailCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(Utilities.PERIOD + Content.THUMBS).children as HTMLCollectionOf<HTMLDivElement>;
        const thumbnails: HTMLDivElement[] = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));

        return thumbnails;
    }

    protected getLevelThreeAnchor(item: HTMLDivElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const levelThreeHref: string = levelThreeAnchor.href;
        const parts: string[] = levelThreeHref.split("/");

        return parts[parts.length - 2]; // the penultimate part
    }

    protected getLastAvailableTwoInnerText(mangaCollection: HTMLDivElement[]): string {
        return "Page " + mangaCollection.length;
    }

    // level two
    protected removeExtraDiv(): void {
        // remove a div that gets added from other scripts:
        const removePotential: HTMLDivElement = document.querySelector("body").children[1] as HTMLDivElement;
        if (removePotential.getAttribute("style").length === 80) {
            removePotential.remove();
        }
    }

    protected getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement {
        return levelThreeAnchor.children[0] as HTMLImageElement;
    }

    // level three
    protected getLevelThreeImage(imageDocument: Document): HTMLImageElement {
        return imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
    }

    protected setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void {
        // get the next image document href
        const nextAnchor = imageDocument.querySelector(".next") as HTMLAnchorElement;
        if (nextAnchor.href === Utilities.EMPTY_STRING) { // there's always a .next, but .next.href can be empty
            levelThreeContainer.removeAttribute(Content.DATA_LEVEL_THREE_HREF);
        } else {
            levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
    }
}

class AsuraScans extends NhManga {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".r") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLAnchorElement> = this.searchResultsDocument.querySelectorAll(".imgu") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        if (thumbnail.getAttribute(Content.DATA_CFSRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_CFSRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected getMangaCollection(mangaDocument: Document): HTMLDivElement[] {
        const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(Utilities.PERIOD + Content.EPH_NUM) as NodeListOf<HTMLDivElement>;
        const chapters: HTMLDivElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLDivElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const span: HTMLSpanElement = levelThreeAnchor.children[0] as HTMLSpanElement;

        return span.innerText;
    }

    protected getLastAvailableTwoInnerText(mangaCollection: HTMLDivElement[]): string {
        const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(mangaCollection[0]);
        const name: string = this.getItemName(levelThreeAnchor);
        return Utilities.hyphenateLongWord(name);
    }

    // level two - getMangaCollection and getLevelThreeAnchor from above

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const viewports: number[] = [];
        const readerAreaChildren: HTMLCollectionOf<HTMLElement> = chapter.getElementById("readerarea").children as HTMLCollectionOf<HTMLElement>;
        for (let i: number = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(Content.CLASS)?.includes("ai-viewport-2")) {
                viewports.push(i);
            }
        }
        for (const viewport of viewports) {
            // the index of the p tags are always 2 more than the index of the viewports
            // the p tag contains only the image
            const parent: HTMLElement = readerAreaChildren[viewport + 2];
            if (parent !== undefined) {
                const levelThreeImage: HTMLImageElement = readerAreaChildren[viewport + 2].children[0] as HTMLImageElement;
                if (levelThreeImage !== undefined) {
                    const dataCfsrc = levelThreeImage.getAttribute(Content.DATA_CFSRC);
                    if (dataCfsrc !== null) {
                        const image: HTMLImageElement = new Image();
                        image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
                        image.setAttribute(Content.DATA_SRC, levelThreeImage.getAttribute(Content.DATA_CFSRC));
                        images.push(image);
                    }
                }
            }
        }
    }
}

loadContent();
