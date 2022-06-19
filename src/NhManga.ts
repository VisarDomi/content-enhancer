abstract class NhManga extends Manga {
    // level one
    protected getLastReadTwoInnerText(lastReadItemName: string): string {
        return lastReadItemName;
    }

    protected getLastAvailableOneInnerText(): string {
        return "Last available:";
    }

    // level two
    protected async loadManga(levelTwoContainer: HTMLDivElement): Promise<void> {
        levelTwoContainer.style.flexDirection = "column";

        const mangaDocument: Document = await Utilities.getResponseDocument(levelTwoContainer.getAttribute(NhManga.DATA_LEVEL_TWO_HREF));
        const chapters: HTMLElement[] = this.getMangaCollection(mangaDocument);
        for (const chapter of chapters) {
            const levelThreeAnchor: HTMLAnchorElement = this.getLevelThreeAnchor(chapter);
            const levelThreeHref = levelThreeAnchor.href;

            // add the chapter button
            const chapterContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "chapter-container") as HTMLDivElement;
            chapterContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            chapterContainer.onclick = async () => {
                await this.loadLevelThree(chapterContainer, window.scrollY);
            }

            const chapterButton: HTMLButtonElement = Utilities.createTagWithClassName("button", "chapter-button") as HTMLButtonElement;
            const innerText = this.getChapterButtonInnerText(levelThreeAnchor);
            const maxChapterNameLength: number = 15;
            chapterButton.innerText = innerText.substring(0, maxChapterNameLength);
            chapterContainer.appendChild(chapterButton);

            // add the last read information next to the button
            const lastReadContainer: HTMLDivElement = Utilities.createTagWithClassName("div", "last-read-container") as HTMLDivElement;
            const lastRead: HTMLSpanElement = Utilities.createTagWithClassName("span", "last-read") as HTMLSpanElement;
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);

            chapterContainer.appendChild(lastReadContainer);
            levelTwoContainer.appendChild(chapterContainer);
        }
    }

    protected abstract getChapterButtonInnerText(levelThreeAnchor: HTMLAnchorElement): string;

    // level three
    protected async loadImages(levelThreeContainer: HTMLDivElement): Promise<void> {
        const levelThreeHref: string = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const images: HTMLImageElement[] = await this.getMangaImages(levelThreeHref);
        await this.loadMangaImage(images, levelThreeContainer);
    }

    protected async getMangaImages(levelThreeHref: string, retry: boolean = true): Promise<HTMLImageElement[]> {
        const images: HTMLImageElement[] = [];
        const chapter: Document = await Utilities.getResponseDocument(levelThreeHref, retry);
        if (chapter !== null) {
            this.pushImage(chapter, levelThreeHref, images);
        }

        if (images.length > 0) {
            const image: HTMLImageElement = images.pop();
            image.className = Content.OBSERVE_IMAGE;
            images.push(image);
        }

        return images;
    }

    // the image pushed should have a DATA_SRC and DATA_LEVEL_THREE_HREF
    protected abstract pushImage(chapter: Document, levelThreeHref: string, images: HTMLImageElement[]): void;

    protected async loadMangaImage(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement, index: number = 0): Promise<void> {
        if (index < images.length && !this.breakLoop) {
            const image: HTMLImageElement = images[index];
            levelThreeContainer.append(image);
            image.src = image.getAttribute(Content.DATA_SRC);
            image.onload = async () => {
                await this.loadMangaImage(images, levelThreeContainer, ++index);
            }
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            }
            this.observeImage(image);

        } else if (index === images.length) {
            this.loadNextChapter(images, levelThreeContainer);
        }
    }

    protected observeImage(image: HTMLImageElement) {
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

    private loadNextChapter(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement) {
        // load next chapter
        const nextChapter = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const image: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(image);
                    image.removeAttribute(Content.CLASS);
                    const nextChapterHref: string = this.getNextChapterHref(images[0].getAttribute(Content.DATA_LEVEL_THREE_HREF));
                    const nextChapterImages: HTMLImageElement[] = await this.getMangaImages(nextChapterHref, false);
                    if (nextChapterImages.length > 0) {
                        await this.loadMangaImage(nextChapterImages, levelThreeContainer);
                    }
                }
            })
        }
        const nextChapterOptions: {} = {
            root: null,
            rootMargin: this.lookAhead
        }
        const nextChapterObserver: IntersectionObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
        const image: HTMLImageElement = document.querySelector(Utilities.PERIOD + Content.OBSERVE_IMAGE) as HTMLImageElement;
        nextChapterObserver.observe(image);
    }

    protected abstract getNextChapterHref(levelThreeHref: string): string;
}
