class MangaHub extends NhManga {
    // level one
    protected getNextSearchResultsAnchor(): HTMLAnchorElement {
        return this.searchResultsDocument.querySelector(".next").children[0] as HTMLAnchorElement;
    }

    protected getSearchResultsThumbnails(): HTMLElement[] {
        const thumbnailCollection: HTMLElement[] = [];
        const selectedElements: NodeListOf<HTMLDivElement> = this.searchResultsDocument.querySelectorAll(".media") as NodeListOf<HTMLDivElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));

        return thumbnailCollection;
    }

    protected appendThumbnailContainer(searchResultsThumbnail: HTMLElement): void {
        const levelTwoAnchor: HTMLAnchorElement = searchResultsThumbnail.children[0].children[0] as HTMLAnchorElement;
        const thumbnail: HTMLImageElement = levelTwoAnchor.children[0] as HTMLImageElement;

        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }

    protected saveLastAvailableTwo(levelTwoAnchor: HTMLAnchorElement): void {
        const anchor: HTMLAnchorElement = levelTwoAnchor.parentElement.parentElement.children[1].children[1].children[0] as HTMLAnchorElement;
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, anchor.innerText);
    }

    // level two
    protected async getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters: NodeListOf<HTMLLIElement> = mangaDocument.querySelectorAll(".list-group-item") as NodeListOf<HTMLLIElement>;
        const chapters: HTMLElement[] = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));

        return chapters;
    }

    protected getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement {
        return item.children[0] as HTMLAnchorElement;
    }

    protected getItemName(levelThreeAnchor: HTMLAnchorElement): string {
        const chapterTitle: HTMLSpanElement = levelThreeAnchor.children[0].children[0] as HTMLSpanElement;
        return chapterTitle.innerText;
    }

    // level three
    protected async pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): Promise<void> {
        const imageElement: HTMLImageElement = chapter.querySelector("#mangareader").children[0].children[1].children[1] as HTMLImageElement;
        const baseFormat: string = imageElement.src.split("1.jpg")[0];

        const levelThreeContainer: HTMLDivElement = document.getElementById(Content.L3_CONTAINER_ID) as HTMLDivElement;
        const TEMPORARY: string = "temporary";
        const tempContainer: HTMLDivElement = Utilities.createTagWithId("div", TEMPORARY) as HTMLDivElement;
        levelThreeContainer.appendChild(tempContainer);

        const tempImages: { i: number, src: string, loading: boolean }[] = [];
        for (let i: number = 1; i < 100; i++) { // 1000 requests are too much (don't spam the server)
            const src: string = baseFormat + i + ".jpg";
            const image: HTMLImageElement = new Image();
            image.src = src;
            const pushedImage: { i: number, src: string, loading: boolean } = { i, src, loading: true };
            tempImages.push(pushedImage);
            tempContainer.appendChild(image);
            image.onload = () => {
                tempImages[tempImages.indexOf(pushedImage)].loading = false;
            }
            image.onerror = () => {
                tempImages.splice(tempImages.indexOf(pushedImage), 1);
            }
        }
        let stillLoading: boolean = true;
        while (stillLoading) { // polling - a better structure is to use notification events
            await Utilities.waitFor(100);
            const filtered: { i: number, src: string, loading: boolean }[] = tempImages.filter(item => item.loading);
            if (filtered.length === 0) {
                stillLoading = false; // break out of the loop if all the items are loaded
            }
        }
        tempContainer.remove();

        // now the list of tempImages can be pushed
        for (const tempImage of tempImages) {
            const image: HTMLImageElement = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, tempImage.src);
            images.push(image);
        }
    }
}
