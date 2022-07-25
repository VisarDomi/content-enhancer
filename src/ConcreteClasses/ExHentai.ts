class ExHentai extends HManga {
    constructor(fullscreen: boolean = false) {
        super(location.href, fullscreen);
    }

    // level one
    protected getAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".ptb").children[0].children[0].children[10].children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = this.searchResultsDocument.querySelector(".itg.gld").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[1].children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);

        const children: HTMLTableCellElement[] = [...mangaDocument.querySelector(".ptt").children[0].children[0].children as HTMLCollectionOf<HTMLTableCellElement>];
        children.pop();
        children.shift(); // remove the first and last element
        const lastIndex: number = children.length - 1;
        const lastChild: HTMLTableCellElement = children[lastIndex];
        const anchor: HTMLAnchorElement = lastChild.children[0] as HTMLAnchorElement;
        const lastHref: string = anchor.href;
        const SEPARATOR: string = "?p=";
        const pageFormat: string = lastHref.split(SEPARATOR)[0] + SEPARATOR;
        const lastPage: number = parseInt(lastHref.split(SEPARATOR)[1]);

        const promises: Promise<Document>[] = [];
        for (let index = 0; index < lastPage + 1; index++) {
            const pagePromise: Promise<Document> = Utilities.getResponseDocument(pageFormat + index);
            promises.push(pagePromise);
        }

        const thumbnails: HTMLElement[] = [];
        const responses: Document[] = await Promise.all(promises); // parallel requests
        for (const pageDocument of responses) {
            const galleryThumbnailCollection: NodeListOf<HTMLDivElement> = pageDocument.querySelectorAll(".gdtl") as NodeListOf<HTMLDivElement>;
            const pageThumbnails: HTMLElement[] = [];
            pageThumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
            thumbnails.push(...pageThumbnails);
        }

        return thumbnails;
    }

    protected getLevelThreeAnchor(item: HTMLDivElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const levelTwoThumbnail: HTMLImageElement = levelThreeAnchor.children[0] as HTMLImageElement;

        return levelTwoThumbnail.alt;
    }

    protected getLastAvailableTwoInnerText(): string {
        return "To be implemented...";
    }

    protected async updateLevelOne(levelTwoHref: string, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): Promise<void> {
    }

    // level two
    protected getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement {
        return levelThreeAnchor.children[0] as HTMLImageElement;
    }

    protected getPageNumber(levelTwoThumbnail: HTMLImageElement): string {
        return levelTwoThumbnail.alt;
    }

    // level three - it does not exist for exhentai (because of the fullscreen experience)
    protected async loadLevelThree(elementContainer: HTMLDivElement, levelTwoScrollPosition: number, infoClicked = false): Promise<void> {
        const levelThreeHref: string = elementContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        window.open(levelThreeHref, levelThreeHref);
    }

    protected async getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement> {
        // use nl instead of the image
        const nl: string = imageDocument.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        const nlHref: string = imageDocument.baseURI + "?nl=" + nl;
        const nlDocument: Document = await Utilities.getResponseDocument(nlHref);
        return nlDocument.getElementById("i3").children[0].children[0] as HTMLImageElement;
    }

    protected setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void {
        // get the next image document href
        const nextAnchor = imageDocument.getElementById("next") as HTMLAnchorElement;
        if (nextAnchor.href === levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF)) {
            levelThreeContainer.removeAttribute(Content.DATA_LEVEL_THREE_HREF);
        } else {
            levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
    }
}
