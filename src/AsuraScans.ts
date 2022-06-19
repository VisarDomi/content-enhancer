class AsuraScans extends NhManga {
    constructor(href: string) {
        super(href);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".r") as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLAnchorElement> = this.searchResultsDocument.querySelectorAll(".imgu") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        if (thumbnail.getAttribute(Content.DATA_CFSRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_CFSRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected getMangaCollection(mangaDocument: Document): HTMLElement[] {
        const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".eph-num") as NodeListOf<HTMLDivElement>;
        const chapters: HTMLElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const span: HTMLSpanElement = levelThreeAnchor.children[0] as HTMLSpanElement;

        return span.innerText;
    }

    protected getLastAvailableTwoInnerText(mangaDocument: Document): string {
        const mangaCollection: HTMLElement[] = this.getMangaCollection(mangaDocument);
        const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(mangaCollection[0]);
        const name: string = this.getItemName(levelThreeAnchor);
        return Utilities.hyphenateLongWord(name);
    }

    // level two
    protected getChapterButtonInnerText(levelThreeAnchor: HTMLAnchorElement): string {
        const span: HTMLSpanElement = levelThreeAnchor.children[0] as HTMLSpanElement;

        return span.innerText;
    };

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const viewports: number[] = [];
        const readerAreaChildren: HTMLCollectionOf<HTMLElement> = chapter.getElementById("readerarea").children as HTMLCollectionOf<HTMLElement>;
        for (let i: number = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(Content.CLASS)?.includes("ai-viewport-2")) {
                viewports.push(i);
            }
        }
        for (const viewport of viewports) {
            // the index of the p tags are always 2 more than the index of the viewports
            // the p tag contains only the image
            const parent: HTMLElement = readerAreaChildren[viewport + 2];
            if (parent !== undefined) {
                const levelThreeImage: HTMLImageElement = readerAreaChildren[viewport + 2].children[0] as HTMLImageElement;
                if (levelThreeImage !== undefined) {
                    const dataCfsrc: string = levelThreeImage.getAttribute(Content.DATA_CFSRC);
                    if (dataCfsrc !== null) {
                        const image: HTMLImageElement = new Image();
                        image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
                        image.setAttribute(Content.DATA_SRC, dataCfsrc);
                        images.push(image);
                    }
                }
            }
        }
    }

    protected getNextChapterHref(href: string): string {
        const parts: string[] = href.split(Utilities.HYPHEN);
        const chapterString: string = "chapter";
        const indexOfChapter: number = parts.indexOf(chapterString);
        const end: string = parts[indexOfChapter + 1];
        const chapterNumber: string = end.substring(0, end.length - 1);
        let nextChapterNumber: number;
        if (end.includes(Utilities.PERIOD)) { // we are on a half chapter, skip this and get the next one
            nextChapterNumber = parseInt(chapterNumber.split(Utilities.PERIOD)[0]) + 1;
        } else {
            nextChapterNumber = parseInt(chapterNumber) + 1;
        }
        let nextChapterHref: string = Utilities.EMPTY_STRING;
        for (let i: number = 0; i < indexOfChapter; i++) {
            nextChapterHref += parts[i] + Utilities.HYPHEN;
        }
        nextChapterHref += chapterString + Utilities.HYPHEN + nextChapterNumber + "/";
        return nextChapterHref;
    }
}
