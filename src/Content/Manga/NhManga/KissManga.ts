class KissManga extends NhManga {
    private static readonly DATA_LAZY_SRC: string = "data-lazy-src";

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".nextpostslink") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLAnchorElement> = this.searchResultsDocument.querySelectorAll(".item-thumb") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        if (thumbnail.getAttribute(KissManga.DATA_LAZY_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(KissManga.DATA_LAZY_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const lastChapter: HTMLAnchorElement = levelTwoAnchor.parentElement.parentElement.querySelector(".btn-link") as HTMLAnchorElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, lastChapter.innerText);
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters: HTMLCollectionOf<HTMLLIElement> = mangaDocument.querySelector(".main").children as HTMLCollectionOf<HTMLLIElement>;
        const chapters: HTMLElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        return levelThreeAnchor.innerText.trim();
    }

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const children: NodeListOf<HTMLDivElement> = chapter.querySelectorAll(".page-break") as NodeListOf<HTMLDivElement>;
        for (const child of children) {
            const levelThreeImage: HTMLImageElement = child.children[0] as HTMLImageElement;
            const dataLazySrc: string = levelThreeImage.getAttribute(KissManga.DATA_LAZY_SRC);
            const image: HTMLImageElement = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, dataLazySrc);
            images.push(image);
        }
    }
}
