class YtBoob extends Video {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelectorAll(".pagination-nav")[1].children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: HTMLCollectionOf<HTMLAnchorElement> = this.searchResultsDocument.querySelectorAll(".videos-list")[1].children as HTMLCollectionOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbOverlayChildren: HTMLCollectionOf<HTMLElement> = levelTwoAnchor.children[0].children as HTMLCollectionOf<HTMLElement>;
        const thumbnail: HTMLImageElement = thumbOverlayChildren[0] as HTMLImageElement;
        const duration: HTMLSpanElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLSpanElement;
        thumbnail.setAttribute(Content.DATA_DURATION, duration.innerText.trim());
        thumbnail.src = thumbnail.getAttribute(YtBoob.DATA_SRC);
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    // level two
    protected getVideo(videoDocument: Document): HTMLVideoElement {
        return videoDocument.getElementById("wpst-video") as HTMLVideoElement;
    }

    protected getSource(source: HTMLSourceElement): string {
        return source.src;
    }
}
