abstract class Manga extends Content {
    // level one
    protected async updateLevelOne(levelTwoHref: string, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): Promise<void> {
        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoHref);
        this.updateLevelOneManga(mangaDocument, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }

    protected abstract getMangaCollection(mangaDocument: Document): HTMLElement[];

    protected updateLevelOneManga(mangaDocument: Document, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
        const mangaCollection: HTMLElement[] = this.getMangaCollection(mangaDocument);
        lastReadOne.innerText = "Never read before";
        lastReadTwo.innerText = "New";
        const readCollection: { name: string, lastRead: number }[] = [];
        let lastReadFound: boolean = false;
        for (let i = 0; i < mangaCollection.length; i++) {
            const item = mangaCollection[i];
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(item);
            const name: string = this.getItemName(levelThreeAnchor);
            const lastReadStorage: string = localStorage.getItem(levelThreeAnchor.href);
            if (lastReadStorage !== null) {
                lastReadFound = true;
                const lastRead: number = parseInt(lastReadStorage);
                readCollection.push({
                    name,
                    lastRead
                })
            }
        }

        if (lastReadFound) {
            // I caved in and got some help for this. It returns the object that has the greatest lastRead
            const lastReadItem: { name: string, lastRead: number } = readCollection.reduce(Utilities.getLastReadChapter);
            lastReadOne.innerText = "Read: " + Utilities.getTimeAgo(lastReadItem.lastRead + "");
            lastReadTwo.innerText = this.getLastReadTwoInnerText(lastReadItem.name);
        }

        lastAvailableOne.innerText = this.getLastAvailableOneInnerText();
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(mangaDocument);
    }

    protected abstract getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement;

    protected abstract getItemName(levelThreeAnchor: HTMLAnchorElement): string;

    protected abstract getLastReadTwoInnerText(lastReadItemName: string): string;

    protected abstract getLastAvailableOneInnerText(): string;

    protected abstract getLastAvailableTwoInnerText(mangaCollection: Document): string;

    // level two
    protected async loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
        this.breakLoop = false;

        // create level 2
        const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelTwoContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L2_CONTAINER_ID) as HTMLDivElement;
        levelTwoContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoHref);
        levelTwoContainer.style.display = Content.FLEX;
        document.querySelector("body").appendChild(levelTwoContainer);
        document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.NONE; // hide level 1
        const backButton: HTMLDivElement = Utilities.createTagWithId("div", "go-to-level-one") as HTMLDivElement;
        backButton.className = "go-back-manga";
        backButton.onclick = () => {
            this.breakLoop = true;

            document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            window.scrollTo({top: levelOneScrollPosition});

            const lastWatchedOne: HTMLDivElement = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement as HTMLDivElement); // do this asynchronously
        }
        levelTwoContainer.appendChild(backButton);

        // get the gallery thumbnails
        await this.loadManga(levelTwoContainer);
    }

    protected abstract loadManga(levelTwoContainer: HTMLDivElement): Promise<void>;

    // level three
    protected async loadLevelThree(elementContainer: HTMLDivElement, levelTwoScrollPosition: number, infoClicked = false): Promise<void> {
        this.breakLoop = false;
        window.scrollTo({top: 100});

        // create level 3
        const levelTwoContainer: HTMLDivElement = document.getElementById(Content.L2_CONTAINER_ID) as HTMLDivElement;
        const levelThreeHref: string = elementContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const levelThreeContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L3_CONTAINER_ID) as HTMLDivElement;
        levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
        document.querySelector("body").appendChild(levelThreeContainer);
        levelTwoContainer.style.display = Content.NONE; // hide level 2

        // create the back button
        const backButton: HTMLDivElement = Utilities.createTagWithId("div", "go-to-level-two") as HTMLDivElement;
        backButton.className = "go-back";
        backButton.onclick = () => {
            // stop requests
            this.breakLoop = true;

            levelTwoContainer.style.display = Content.FLEX; // show level 2
            levelThreeContainer.remove(); // destroy level 3
            window.scrollTo({top: levelTwoScrollPosition});
        };
        levelThreeContainer.appendChild(backButton);

        // display info
        const span: HTMLSpanElement = Utilities.createTagWithClassName("span", "info-content") as HTMLSpanElement;
        span.innerText = levelThreeHref;
        const info: HTMLDivElement = Utilities.createTagWithClassName("div", "info") as HTMLDivElement;
        info.onclick = () => {
            infoClicked = !infoClicked; // change the status
            if (infoClicked) {
                info.className = "info-clicked";
                span.className = "info-content-clicked";
            } else {
                info.className = "info";
                span.className = "info-content";
            }
        }
        info.appendChild(span);
        levelThreeContainer.appendChild(info);

        // now it's time to load the images
        await this.loadImages(levelThreeContainer);
    }

    protected abstract loadImages(levelThreeContainer: HTMLDivElement): Promise<void>;

    protected abstract observeImage(image: HTMLImageElement): void;
}
