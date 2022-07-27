abstract class Manga extends Content {
    // level one
    protected async updateLevelOne(levelTwoHref: string, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): Promise<void> {
        lastAvailableOne.innerText = this.getLastAvailableOneInnerText();
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(levelTwoHref);
        lastReadOne.innerText = "Never read before";
        lastReadTwo.innerText = "New";
        try {
            const levelThreeHrefs: string[] = JSON.parse(localStorage.getItem(Content.LEVEL_THREE_HREFS + levelTwoHref)) as string[];
            const readCollection: { name: string, lastRead: number }[] = [];
            for (const levelThreeHref of levelThreeHrefs) {
                const lastRead: number = parseInt(localStorage.getItem(levelThreeHref));
                if (lastRead) {
                    readCollection.push({
                        name: localStorage.getItem(Content.ITEM_NAME + levelThreeHref),
                        lastRead
                    })
                }
            }
            const lastReadItem: { name: string, lastRead: number } = readCollection.reduce(Utilities.getLastReadChapter);
            if (lastReadItem) {
                lastReadOne.innerText = "Read: " + Utilities.getTimeAgo(lastReadItem.lastRead + "");
                lastReadTwo.innerText = this.getLastReadTwoInnerText(lastReadItem.name);
            }
        } catch (ignored) {
        }
    }

    protected abstract getMangaCollection(levelTwoHref: string): Promise<HTMLElement[]>;

    protected abstract getLevelThreeAnchor(item: HTMLElement): HTMLAnchorElement;

    protected abstract getItemName(levelThreeAnchor: HTMLAnchorElement): string;

    protected abstract getLastReadTwoInnerText(lastReadItemName: string): string;

    protected abstract getLastAvailableOneInnerText(): string;

    protected getLastAvailableTwoInnerText(levelTwoHref: string): string {
        return localStorage.getItem(Content.LAST_AVAILABLE + levelTwoHref);
    }

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

    protected observeImage(image: HTMLImageElement): void {
        // set the info of the current image
        const setInfo = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const observedImage: HTMLImageElement = entry.target as HTMLImageElement;
                    const infoContent: HTMLSpanElement = document.querySelector(".info-content") as HTMLSpanElement;
                    const levelThreeHref = observedImage.getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    infoContent.innerText = levelThreeHref;
                    localStorage.setItem(levelThreeHref, Date.now() + "");
                    Utilities.updateLastRead(document.getElementById(levelThreeHref));
                }
            })
        }
        const infoOptions: {} = {
            root: null,
            rootMargin: "0px"
        }
        const infoObserver: IntersectionObserver = new IntersectionObserver(setInfo, infoOptions);
        infoObserver.observe(image);
    }
}
