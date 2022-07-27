class NHentai extends HManga {
    constructor(fullscreen: boolean = false) {
        super(location.href, fullscreen);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
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

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const galleryThumbnailCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(".thumbs").children as HTMLCollectionOf<HTMLDivElement>;
        const thumbnails: HTMLElement[] = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));

        const names: NodeListOf<HTMLSpanElement> = mangaDocument.querySelectorAll(".name");
        const totalPages: HTMLSpanElement = names.item(names.length - 1);
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoHref, totalPages.innerText);

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

    protected getLastAvailableTwoInnerText(levelTwoHref: string): string {
        const lastAvailableTwoInnerText: string = localStorage.getItem(Content.LAST_AVAILABLE + levelTwoHref);
        return lastAvailableTwoInnerText ? lastAvailableTwoInnerText : "Unknown";
    }

    protected removeExtraDiv(): void {
        // remove a div that gets added from other scripts:
        const removePotential: HTMLDivElement = document.querySelector("body").children[1] as HTMLDivElement;
        if (removePotential.getAttribute("style").length === 80) {
            removePotential.remove();
        }
    }

    protected getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement {
        const levelTwoThumbnail: HTMLImageElement = levelThreeAnchor.children[0] as HTMLImageElement;
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(Content.DATA_SRC);
        return levelTwoThumbnail;
    }

    protected getPageNumber(levelTwoThumbnail: HTMLImageElement): string {
        const src: string = levelTwoThumbnail.getAttribute(NHentai.DATA_SRC);
        const parts: string[] = src.split("/");
        let pageNumber: string = parts[parts.length - 1].split("t.jpg")[0];
        if (pageNumber.includes("t.png")) {
            pageNumber = parts[parts.length - 1].split("t.png")[0];
        }

        return pageNumber;
    }

    // level three
    protected async getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement> {
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
