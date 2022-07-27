abstract class HManga extends Manga {
    // level one
    protected getLastReadTwoInnerText(lastReadItemName: string): string {
        return "Page " + lastReadItemName;
    }

    protected getLastAvailableOneInnerText(): string {
        return "Total pages:";
    }

    // level two
    protected async loadManga(levelTwoContainer: HTMLDivElement): Promise<void> {
        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers: HTMLDivElement[] = [];

        this.removeExtraDiv();

        const levelTwoHref: string = levelTwoContainer.getAttribute(HManga.DATA_LEVEL_TWO_HREF);
        const galleryThumbnailsList: HTMLElement[] = await this.getMangaCollection(levelTwoHref);
        const levelThreeHrefs: string[] = [];
        for (const galleryThumbnailElement of galleryThumbnailsList) {
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelThreeHref: string = levelThreeAnchor.href;

            // save to localStorage
            levelThreeHrefs.push(levelThreeHref);
            localStorage.setItem(Content.ITEM_NAME + levelThreeHref, this.getItemName(levelThreeAnchor));

            // add the thumbnail container
            const thumbnailContainer: HTMLDivElement = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER) as HTMLDivElement;
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            }

            const galleryThumbnail: HTMLImageElement = new Image();
            const levelTwoThumbnail: HTMLImageElement = this.getLevelTwoThumbnail(levelThreeAnchor);
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
        localStorage.setItem(Content.HREFS + levelTwoHref, JSON.stringify(levelThreeHrefs));

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

    protected abstract getLevelThreeImage(imageDocument: Document): Promise<HTMLImageElement>;

    protected abstract setNextAnchor(imageDocument: Document, levelThreeContainer: HTMLDivElement): void;
}
