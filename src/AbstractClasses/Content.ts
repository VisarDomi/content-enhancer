abstract class Content implements IContent {
    protected static readonly CSS_INNER_HTML: string = `
/* level 1 */
body {
    margin: 0;
    background-color: black;
    font-family: -apple-system, sans-serif;
}

img, video {
    display: block;
    width: 100%;
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
#level-two-container {
    padding-top: 30vh;
}

.go-back-manga, .go-back {
    width: 100%;
    height: 30vh;
    background-color: hsl(0, 50%, 25%);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;
}

.go-back-manga {
    opacity: 0.5;
}

.chapter-button {
    font-size: 1.2rem;
    line-height: 3;
    text-align: center;
    width: 100%;
}

.chapter-container {
    display: flex;
    font-size: 1.2rem;
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
    color: white;
    line-height: 2;
    margin: 20px;
}
`;
    protected static readonly L1_CONTAINER_ID: string = "level-one-container";
    protected static readonly L2_CONTAINER_ID: string = "level-two-container";
    protected static readonly L3_CONTAINER_ID: string = "level-three-container";
    protected static readonly LOOK_AHEAD: string = "2000%"; // look ahead 20 screens
    protected static readonly DATA_SRC: string = "data-src";
    protected static readonly DATA_CFSRC: string = "data-cfsrc";
    protected static readonly DATA_LAZY_SRC: string = "data-lazy-src";
    protected static readonly DATA_LEVEL_TWO_HREF: string = "data-level-two-href";
    protected static readonly DATA_LEVEL_THREE_HREF: string = "data-level-three-href";
    protected static readonly DATA_DURATION: string = "data-duration";
    protected static readonly LEVEL_ONE_THUMBNAIL_CONTAINER: string = "level-one-thumbnail-container";
    protected static readonly LEVEL_TWO_THUMBNAIL_CONTAINER: string = "level-two-thumbnail-container";
    protected static readonly OBSERVE_THUMBNAIL: string = "observe-thumbnail";
    protected static readonly OBSERVE_GALLERY_THUMBNAIL: string = "observe-gallery-thumbnail";
    protected static readonly OBSERVE_IMAGE: string = "observe-image";
    protected static readonly LAST_WATCHED_1: string = "last-watched-one";
    protected static readonly LAST_WATCHED_2: string = "last-watched-two";
    protected static readonly LAST_AVAILABLE_1: string = "last-available-one";
    protected static readonly LAST_AVAILABLE_2: string = "last-available-two";
    protected static readonly CLASS: string = "class";
    protected static readonly BLOCK: string = "block";
    protected static readonly FLEX: string = "flex";
    protected static readonly NONE: string = "none";
    protected static readonly LOADING___: string = "Loading...";

    private readonly href: string;
    private readonly fullscreen: boolean;
    protected searchResultsDocument: Document;
    protected thumbnailContainers: HTMLDivElement[];
    protected breakLoop: boolean;
    private nextSearchResultsHref: string;
    private searchResultsThumbnails: HTMLElement[];

    protected constructor(href: string, fullscreen: boolean = false) {
        this.href = href;
        this.fullscreen = fullscreen;
    }

    public async init() {
        document.write("<html><head></head><body></body></html>");
        const body = document.querySelector("body");
        const head = document.querySelector("head");
        const levelOneContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L1_CONTAINER_ID) as HTMLDivElement;
        body.appendChild(levelOneContainer);
        const styleTag: HTMLScriptElement = Utilities.createTagWithId("style", "content-enhancer-css") as HTMLScriptElement;
        styleTag.innerHTML = Content.CSS_INNER_HTML;
        head.appendChild(styleTag);

        if (this.fullscreen) {
            await this.loadFullscreen();
        } else {
            await this.load();
        }
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
        if (anchor && anchor.href !== undefined) {
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
                await this.loadThumbnailContainer(thumbnailContainers, container, ++index);
            }
            if (index === thumbnailContainersLength - 1) {
                if (container.id === Content.L1_CONTAINER_ID) {
                    thumbnail.className = Content.OBSERVE_THUMBNAIL;
                } else if (container.id === Content.L2_CONTAINER_ID) {
                    thumbnail.className = Content.OBSERVE_GALLERY_THUMBNAIL;
                }
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
                        await this.load();
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

    // level three - the fullscreen experience
    public async loadFullscreen(): Promise<void> {
        const levelOneContainer: HTMLDivElement = document.getElementById(Content.L1_CONTAINER_ID) as HTMLDivElement;
        const levelTwoHref: string = localStorage.getItem(location.href);
        const srcs: string[] = JSON.parse(localStorage.getItem(levelTwoHref)) as string[];
        // the things above can be sent to exhentai
        for (const src of srcs) {
            const image: HTMLImageElement = document.createElement("img");
            image.src = src;
            image.loading = "lazy";
            levelOneContainer.appendChild(image);
        }

        const pOne: HTMLParagraphElement = document.createElement("p");
        levelOneContainer.appendChild(pOne);
        pOne.innerText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.`;

        const pTwo: HTMLParagraphElement = document.createElement("p");
        levelOneContainer.appendChild(pTwo);
        pTwo.innerText = `Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.`;

        const pThree: HTMLParagraphElement = document.createElement("p");
        levelOneContainer.appendChild(pThree);
        pThree.innerText = `Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus.`;

        const pFour: HTMLParagraphElement = document.createElement("p");
        levelOneContainer.appendChild(pFour);
        pFour.innerText = `Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa.`;

        const pFive: HTMLParagraphElement = document.createElement("p");
        levelOneContainer.appendChild(pFive);
        pFive.innerText = `Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales.`;
    }
}
