class IsekaiScan extends NhManga {
    constructor() {
        super(location.href);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".nav-previous").children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const pageListingItem: NodeListOf<HTMLDivElement> = this.searchResultsDocument.querySelectorAll(".page-listing-item") as NodeListOf<HTMLDivElement>;

        for (const item of pageListingItem) {
            const selectedElements: NodeListOf<HTMLDivElement> = item.querySelectorAll(".badge-pos-1") as NodeListOf<HTMLDivElement>;
            for (const element of selectedElements) {
                thumbnailCollection.push(element);
            }
        }

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.querySelector("a") as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = searchResultsThumbnail.querySelector("img") as HTMLImageElement;
        const dataSrcSet: string = thumbnail.getAttribute("data-srcset");
        if (dataSrcSet !== null) {
            const parts: string[] = dataSrcSet.split(",");
            thumbnail.src = parts[parts.length - 1].split(" ")[1];
        } else {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
        }

        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const latestChapter: HTMLElement = levelTwoAnchor.parentElement.nextElementSibling.querySelectorAll("a").item(1) as HTMLAnchorElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, latestChapter.innerText.trim());
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters: NodeListOf<HTMLLIElement> = mangaDocument.querySelectorAll(".wp-manga-chapter") as NodeListOf<HTMLLIElement>;
        const chapters: HTMLElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.querySelector("a") as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        return levelThreeAnchor.innerText.trim();
    }

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const imageContainers: NodeListOf<HTMLDivElement> = chapter.querySelector(".read-container").querySelectorAll(".page-break.no-gaps") as NodeListOf<HTMLDivElement>;
        for (const imageContainer of imageContainers) {
            const image: HTMLImageElement = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, imageContainer.children[0].getAttribute(Content.DATA_SRC).trim());
            images.push(image);
        }
    }
}
