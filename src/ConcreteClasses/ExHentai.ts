class ExHentai extends HManga {
    constructor(fullscreen: boolean = false) {
        super(location.href, fullscreen);
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

    protected getLastAvailableTwoInnerText(levelTwoHref: string): string {
        return localStorage.getItem(Content.LAST_AVAILABLE + levelTwoHref);
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
        const levelThreeHref: string = elementContainer.getAttribute(ExHentai.DATA_LEVEL_THREE_HREF);
        const levelTwoContainer: HTMLDivElement = document.getElementById(ExHentai.L2_CONTAINER_ID) as HTMLDivElement;
        const levelTwoHref: string = levelTwoContainer.getAttribute(ExHentai.DATA_LEVEL_TWO_HREF);
        localStorage.setItem(Content.LEVEL_TWO_HREF + levelThreeHref, levelTwoHref);

        const levelThreeHrefs: string[] = JSON.parse(localStorage.getItem(Content.LEVEL_THREE_HREFS + levelTwoHref)) as string[];
        let index: number = levelThreeHrefs.indexOf(levelThreeHref);
        const promises: Promise<Document>[] = [];
        for (index; index < levelThreeHrefs.length; index++) {
            const levelThreeHref: string = levelThreeHrefs[index];
            const promise: Promise<Document> = Utilities.getResponseDocument(levelThreeHref);
            promises.push(promise);
        }

        const responses: Document[] = await Promise.all(promises); // parallel requests everywhere
        const nlPromises: Promise<Document>[] = [];
        for (const response of responses) {
            const nlPromise: Promise<Document> = Utilities.getResponseDocument(this.getNlHref(response));
            nlPromises.push(nlPromise);
        }

        const nlResponses: Document[] = await Promise.all(nlPromises); // parallel requests everywhere

        const srcs: string[] = [];
        for (const nlResponse of nlResponses) {
            const nlImage: HTMLImageElement = nlResponse.getElementById("img") as HTMLImageElement;
            srcs.push(nlImage.src);
        }

        localStorage.setItem(Content.SOURCES + levelTwoHref, JSON.stringify(srcs));
        window.open(levelThreeHref, levelTwoHref);
    }

    private getNlHref(response: Document): string {
        const nl: string = response.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        return response.baseURI + "?nl=" + nl;
    }

    protected async getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement> {
        const nlDocument: Document = await Utilities.getResponseDocument(this.getNlHref(imageDocument));
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
