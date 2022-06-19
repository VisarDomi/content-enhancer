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
        const duration: HTMLDivElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLDivElement;
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
