class KissManga extends NhManga {
    constructor(href: string) {
        super(href);
        this.searchResultsLookAhead = "500%";
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
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
        if (thumbnail.getAttribute(Content.DATA_LAZY_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_LAZY_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected getMangaCollection(mangaDocument: Document): HTMLElement[] {
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

    protected getLastAvailableTwoInnerText(mangaDocument: Document): string {
        const mangaCollection: HTMLElement[] = this.getMangaCollection(mangaDocument);
        const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(mangaCollection[0]);
        const name: string = this.getItemName(levelThreeAnchor);
        return Utilities.hyphenateLongWord(name);
    }

    // level two
    protected getChapterButtonInnerText(levelThreeAnchor: HTMLAnchorElement): string {
        return levelThreeAnchor.innerText.trim();
    };

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const children: NodeListOf<HTMLDivElement> = chapter.querySelectorAll(".page-break") as NodeListOf<HTMLDivElement>;
        for (const child of children) {
            const levelThreeImage: HTMLImageElement = child.children[0] as HTMLImageElement;
            const dataLazySrc: string = levelThreeImage.getAttribute(Content.DATA_LAZY_SRC);
            const image: HTMLImageElement = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, dataLazySrc);
            images.push(image);
        }
    }

    protected getNextChapterHref(href: string): string {
        const parts: string[] = href.split(Utilities.HYPHEN);
        const end: string = parts[parts.length - 1];
        const chapterNumber: string = end.substring(0, end.length - 1);
        let nextChapterNumber: number;
        if (end.includes(Utilities.PERIOD)) { // we are on a half chapter, skip this and get the next one
            nextChapterNumber = parseInt(chapterNumber.split(Utilities.PERIOD)[0]) + 1;
        } else {
            nextChapterNumber = parseInt(chapterNumber) + 1;
        }
        let nextChapterHref: string = Utilities.EMPTY_STRING;
        for (let i: number = 0; i < parts.length - 1; i++) {
            nextChapterHref += parts[i] + Utilities.HYPHEN;
        }
        nextChapterHref += nextChapterNumber + "/";
        return nextChapterHref;
    }
}
