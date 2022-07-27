class McReader extends NhManga {
    constructor() {
        super(location.href);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        const paginationChildren: HTMLCollectionOf<HTMLLIElement> = this.searchResultsDocument.querySelector(".pagination").children as HTMLCollectionOf<HTMLLIElement>;
        return paginationChildren[paginationChildren.length - 1].children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLLIElement> = this.searchResultsDocument.querySelectorAll(".novel-item") as NodeListOf<HTMLLIElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0].children[0].children[0] as HTMLImageElement;

        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const novelStats: HTMLElement = levelTwoAnchor.querySelector(".novel-stats").children[0] as HTMLElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, novelStats.innerText);
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters: HTMLCollectionOf<HTMLLIElement> = mangaDocument.querySelector(".chapter-list").children as HTMLCollectionOf<HTMLLIElement>;
        const chapters: HTMLElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const chapterTitle: HTMLElement = levelThreeAnchor.querySelector(".chapter-title");
        return chapterTitle.innerText.trim();
    }

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const chapterReader: HTMLDivElement = chapter.querySelector("#chapter-reader");
        const levelThreeImages: NodeListOf<HTMLImageElement> = chapterReader.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
        for (const levelThreeImage of levelThreeImages) {
            if (levelThreeImage.id.includes("image")) {
                const image: HTMLImageElement = new Image();
                image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
                image.setAttribute(Content.DATA_SRC, levelThreeImage.src);
                images.push(image);
            }
        }
    }
}
