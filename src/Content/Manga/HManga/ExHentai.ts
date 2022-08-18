class ExHentai extends HManga {
    constructor() {
        super(location.href);
    }

    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
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

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const totalPages: HTMLDivElement = levelTwoAnchor.parentElement.parentElement.querySelector(".ir").parentElement.children[1] as HTMLDivElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, totalPages.innerText);
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);

        const children: HTMLTableCellElement[] = [...mangaDocument.querySelector(".ptt").children[0].children[0].children as HTMLCollectionOf<HTMLTableCellElement>];
        children.pop();
        children.shift(); // the first and last element are < and > (which are not needed)
        const responses: Document[] = [ mangaDocument ];
        if (children.length > 1) {
            const lastIndex: number = children.length - 1;
            const lastChild: HTMLTableCellElement = children[lastIndex];
            const anchor: HTMLAnchorElement = lastChild.children[0] as HTMLAnchorElement;
            const lastHref: string = anchor.href;
            const SEPARATOR: string = "?p=";
            const pageFormat: string = lastHref.split(SEPARATOR)[0] + SEPARATOR;
            const lastPage: number = parseInt(lastHref.split(SEPARATOR)[1]);

            const promises: Promise<Document>[] = [];
            for (let index = 1; index < lastPage + 1; index++) {
                const pagePromise: Promise<Document> = Utilities.getResponseDocument(pageFormat + index);
                promises.push(pagePromise);
            }
            responses.push(...await Promise.all(promises)); // parallel requests)
        }

        const thumbnails: HTMLElement[] = [];
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

    protected getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement {
        return levelThreeAnchor.children[0] as HTMLImageElement;
    }

    protected getPageNumber(levelTwoThumbnail: HTMLImageElement): string {
        return levelTwoThumbnail.alt;
    }

    protected async getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement> {
        const nl: string = imageDocument.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        const nlDocument: Document = await Utilities.getResponseDocument(imageDocument.baseURI + "?nl=" + nl);
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
