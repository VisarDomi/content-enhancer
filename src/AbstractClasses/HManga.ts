abstract class HManga extends Manga {
    protected nextLevelTwoHref: string = null;

    // level one
    protected getLastReadTwoInnerText(lastReadItemName: string): string {
        return "Page " + lastReadItemName;
    }

    protected getLastAvailableOneInnerText(): string {
        return "Total pages:";
    }

    // level two
    protected setNextLevelTwoHref(mangaDocument: Document): void {
        this.nextLevelTwoHref = null;
    }

    protected async loadManga(levelTwoContainer: HTMLDivElement): Promise<void> {
        if (this.nextLevelTwoHref === null) {
            this.nextLevelTwoHref = levelTwoContainer.getAttribute(HManga.DATA_LEVEL_TWO_HREF);
        }
        const mangaDocument: Document = await Utilities.getResponseDocument(this.nextLevelTwoHref);
        this.setNextLevelTwoHref(mangaDocument);

        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers: HTMLDivElement[] = [];

        this.removeExtraDiv();

        const galleryThumbnailsList: HTMLElement[] = this.getMangaCollection(mangaDocument);
        for (const galleryThumbnailElement of galleryThumbnailsList) {
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelTwoThumbnail: HTMLImageElement = this.getLevelTwoThumbnail(levelThreeAnchor);

            const thumbnailContainer: HTMLDivElement = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER) as HTMLDivElement;
            const levelThreeHref: string = levelThreeAnchor.href;
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                // instead of loading level three, open a new tab, and the script should activate with only level 3 logic
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            }

            const galleryThumbnail: HTMLImageElement = new Image();
            galleryThumbnail.setAttribute(Content.DATA_SRC, levelTwoThumbnail.src);
            thumbnailContainer.append(galleryThumbnail);

            // add the last read information next to the button
            const lastReadContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "latest-container") as HTMLDivElement;
            const lastRead: HTMLSpanElement = Utilities.createTagWithClassName("span", "last-read-gallery") as HTMLSpanElement;
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);

            const pageNumber: HTMLSpanElement = Utilities.createTagWithClassName("span", "gallery-page") as HTMLSpanElement;
            pageNumber.innerText = this.getPageNumber(levelTwoThumbnail);
            lastReadContainer.appendChild(pageNumber);

            thumbnailContainer.appendChild(lastReadContainer);
            levelTwoThumbnailContainers.push(thumbnailContainer);
        }

        await this.loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
    }

    protected removeExtraDiv(): void {}

    protected abstract getLevelTwoThumbnail(levelThreeAnchor: HTMLAnchorElement): HTMLImageElement;

    protected abstract getPageNumber(levelTwoThumbnail: HTMLImageElement): string;

    // level three
    protected async loadImages(levelThreeContainer: HTMLDivElement): Promise<void> {
        const levelThreeHref: string = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null && !this.breakLoop) {
            const imageDocument: Document = await Utilities.getResponseDocument(levelThreeHref);

            // append the image to the container
            const levelThreeImage: HTMLImageElement = await this.getLevelThreeImage(imageDocument);
            const image: HTMLImageElement = new Image();
            image.src = levelThreeImage.src;
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            levelThreeContainer.appendChild(image);

            this.setNextAnchor(imageDocument, levelThreeContainer);

            // load the image
            image.onload = async () => {
                await this.loadImages(levelThreeContainer);
            }
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            }

            this.observeImage(image);
        }
    }

    protected observeImage(image: HTMLImageElement): void {
        // observe the image
        const setInfo = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                    const levelThreeHref: string = entryTarget.getAttribute(Content.DATA_LEVEL_THREE_HREF);
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

    protected abstract getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement>;

    protected abstract setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void;
}
