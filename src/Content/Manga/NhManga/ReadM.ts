class ReadM extends NhManga {
    constructor() {
        super(location.href);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        const paginationChildren: HTMLCollectionOf<HTMLLIElement> = this.searchResultsDocument.querySelector(".pagination").children as HTMLCollectionOf<HTMLLIElement>;
        return paginationChildren[paginationChildren.length - 2].children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLLIElement> = this.searchResultsDocument.querySelectorAll(".segment-poster-sm") as NodeListOf<HTMLLIElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.querySelector("a") as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = searchResultsThumbnail.querySelector("img") as HTMLImageElement;
        thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);

        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const chapters: HTMLElement = levelTwoAnchor.parentElement.parentElement.querySelector(".chapters").children[0].children[0] as HTMLElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, chapters.innerText);
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const episodesLists: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".episodes-list") as NodeListOf<HTMLDivElement>;
        const chapters: HTMLElement[] = [];
        for (const episodeList of episodesLists) {
            const partialChapters: HTMLCollectionOf<HTMLDivElement> = episodeList.children[0].children as HTMLCollectionOf<HTMLDivElement>;
            for (const chapter of partialChapters) {
                chapters.push(chapter);
            }
        }

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.querySelector("a") as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        return levelThreeAnchor.innerText;
    }

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const chapterImages: HTMLDivElement = chapter.querySelector(".ch-images");
        const levelThreeImages: NodeListOf<HTMLImageElement> = chapterImages.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
        for (const levelThreeImage of levelThreeImages) {
            const image: HTMLImageElement = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, levelThreeImage.src);
            images.push(image);
        }
    }
}
