class KissJav extends Video {
    constructor() {
        super(location.href);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
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
