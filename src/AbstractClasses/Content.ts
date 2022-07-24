abstract class Content implements IContent {
    public static readonly L1_CONTAINER_ID: string = "level-one-container";
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
    protected searchResultsDocument: Document;
    protected thumbnailContainers: HTMLDivElement[];
    protected breakLoop: boolean;
    private nextSearchResultsHref: string;
    private searchResultsThumbnails: HTMLElement[];
    protected searchResultsLookAhead: string = Content.LOOK_AHEAD;
    protected lookAhead: string = Content.LOOK_AHEAD;

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
        } else if (index === thumbnailContainersLength) {
            if (container.id === Content.L1_CONTAINER_ID) {
                this.observeLastThumbnail();
                for (const thumbnailContainer of thumbnailContainers) {
                    await this.updateThumbnailContainer(thumbnailContainer);
                }
            } else if (container.id === Content.L2_CONTAINER_ID && !this.breakLoop) {
                this.observeLastGalleryThumbnail(container);
            }
        }
    }

    protected observeLastGalleryThumbnail(levelTwoContainer: HTMLDivElement) {}

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
            rootMargin: this.searchResultsLookAhead
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
