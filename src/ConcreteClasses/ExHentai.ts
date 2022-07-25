class ExHentai extends HManga {
    constructor(fullscreen: boolean = false) {
        super(location.href, fullscreen);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".ptb").children[0].children[0].children[10].children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = this.searchResultsDocument.querySelector(".itg.gld").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[1].children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected getMangaCollection(mangaDocument: Document): HTMLElement[] {
        const galleryThumbnailCollection: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".gdtl") as NodeListOf<HTMLDivElement>;
        const thumbnails: HTMLElement[] = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));

        return thumbnails;
    }

    protected getLevelThreeAnchor(item: HTMLDivElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const levelTwoThumbnail: HTMLImageElement = levelThreeAnchor.children[0] as HTMLImageElement;

        return levelTwoThumbnail.alt;
    }

    protected getLastAvailableTwoInnerText(mangaDocument: Document): string {
        const children: NodeListOf<HTMLTableCellElement> = mangaDocument.querySelectorAll(".gdt2") as NodeListOf<HTMLTableCellElement>;
        const pages: string = children[children.length - 2].innerText.split(" ")[0];
        return "Page " + pages;
    }

    // level two
    protected observeLastGalleryThumbnail(levelTwoContainer: HTMLDivElement) {
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const thumbnail: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(thumbnail);
                    thumbnail.removeAttribute(Content.CLASS);
                    if (this.nextLevelTwoHref !== null) {
                        await this.loadManga(levelTwoContainer);
                    }
                }
            })
        }
        const options: {} = {
            root: null,
            rootMargin: Content.LOOK_AHEAD
        }
        const observer: IntersectionObserver = new IntersectionObserver(callback, options);
        const thumbnail: HTMLImageElement = document.querySelector(Utilities.PERIOD + Content.OBSERVE_GALLERY_THUMBNAIL) as HTMLImageElement;
        observer.observe(thumbnail);
    }

    protected getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement {
        return levelThreeAnchor.children[0] as HTMLImageElement;
    }

    protected getPageNumber(levelTwoThumbnail: HTMLImageElement): string {
        return levelTwoThumbnail.alt;
    }

    protected setNextLevelTwoHref(mangaDocument: Document) {
        const children: HTMLCollectionOf<HTMLTableCellElement> = mangaDocument.querySelector(".ptt").children[0].children[0].children as HTMLCollectionOf<HTMLTableCellElement>;
        const nextPageChildren: HTMLCollectionOf<HTMLAnchorElement> = children[children.length - 1].children as HTMLCollectionOf<HTMLAnchorElement>;
        if (nextPageChildren.length > 0) {
            this.nextLevelTwoHref = nextPageChildren[0].href;
        } else {
            this.nextLevelTwoHref = null;
        }
    }

    // level three
    protected async getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement> {
        // use nl instead of the image
        const nl: string = imageDocument.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        const nlHref: string = imageDocument.baseURI + "?nl=" + nl;
        const nlDocument: Document = await Utilities.getResponseDocument(nlHref);
        return nlDocument.getElementById("i3").children[0].children[0] as HTMLImageElement;
    }

    protected setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void {
        // get the next image document href
        const nextAnchor = imageDocument.getElementById("next") as HTMLAnchorElement;
        if (nextAnchor.href === levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF)) {
            levelThreeContainer.removeAttribute(Content.DATA_LEVEL_THREE_HREF);
        } else {
            levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
    }
}
