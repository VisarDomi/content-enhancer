class WcoFun extends Video {
    public constructor(gettingSource: boolean = false) {
        super(gettingSource);
    }

    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        return null;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const episodes: HTMLDivElement[] = [...this.searchResultsDocument.querySelectorAll(".cat-eps") as NodeListOf<HTMLDivElement>];
        const thumbnailImage: HTMLImageElement = this.searchResultsDocument.querySelector(".img5") as HTMLImageElement;
        for (const episode of episodes.reverse()) {
            const anchor: HTMLAnchorElement = document.createElement("a");
            anchor.href = (episode.children[0] as HTMLAnchorElement).href;
            const thumbnail: HTMLImageElement = document.createElement("img");
            thumbnail.src = thumbnailImage.src;
            const parts: string[] = anchor.href.split("/");
            thumbnail.setAttribute(Content.DATA_DURATION, parts[parts.length - 1]);
            anchor.appendChild(thumbnail);
            thumbnailCollection.push(anchor);
        }

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected async initSource(): Promise<void> {
        let video: HTMLVideoElement = null;
        let iframe: HTMLIFrameElement = document.querySelector("iframe");
        let loop: boolean = true;
        while (loop) {
            if (iframe && video && video.src) {
                loop = false;
            } else {
                window.scrollBy(0, window.innerHeight / 2);
                iframe = document.querySelector("iframe");
                video = iframe?.contentDocument?.querySelector("video");
                await Utilities.waitFor(100); // polling, it's brittle
            }
        }
        localStorage.setItem(Content.GETTING_SOURCE + window.location.href, video.src);
        window.close();
    }

    protected async getBestSource(levelTwoHref: string): Promise<HTMLSourceElement> {
        const tempWindow: Window = window.open(levelTwoHref); // do the logic else where (for now, on initSource())
        let src: string = null;
        let loop: boolean = true;

        while (loop) {
            src = localStorage.getItem(Content.GETTING_SOURCE + levelTwoHref);
            if (src) {
                loop = false;
                tempWindow?.close();
            } else {
                await Utilities.waitFor(100); // brittle code (polling), can be stuck in a loop
            }
        }
        const source: HTMLSourceElement = document.createElement("source");
        source.src = src;

        return source;
    }

    protected getVideo(videoDocument: Document): HTMLVideoElement {
        return null;
    }

    protected getSource(source: HTMLSourceElement): string {
        return null;
    }
}
