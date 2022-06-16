let breakLoop: boolean;

const OBSERVE_IMAGE: string = "observe-image";
const L3_CONTAINER_ID: string = "level-three-container";

async function loadLevelThree(elementContainer: HTMLDivElement, levelTwoScrollPosition: number, infoClicked = false): Promise<void> {
    breakLoop = false;
    window.scrollTo({top: 0});

    // create level 3
    const levelTwoContainer: HTMLDivElement = document.getElementById(L2_CONTAINER_ID) as HTMLDivElement;
    const levelThreeHref: string = elementContainer.getAttribute(DATA_LEVEL_THREE_HREF);
    const levelThreeContainer: HTMLDivElement = createTagWithId("div", L3_CONTAINER_ID) as HTMLDivElement;
    levelThreeContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
    document.querySelector("body").appendChild(levelThreeContainer);
    levelTwoContainer.style.display = NONE; // hide level 2

    // create the back button
    const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-two") as HTMLDivElement;
    backButton.className = "go-back";
    backButton.onclick = () => {
        // stop requests
        breakLoop = true;

        levelTwoContainer.style.display = FLEX; // show level 2
        levelThreeContainer.remove(); // destroy level 3
        window.scrollTo({top: levelTwoScrollPosition});
    };
    levelThreeContainer.appendChild(backButton);

    // display info
    const span: HTMLSpanElement = createTagWithClassName("span", "info-content") as HTMLSpanElement;
    span.innerText = levelThreeHref;
    const info: HTMLDivElement = createTagWithClassName("div", "info") as HTMLDivElement;
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
    if (ORIGINAL_HREF.includes(NHENTAI)) {
        await loadHMangaImage(levelThreeContainer);
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const images: HTMLImageElement[] = await getNhMangaImages(levelThreeHref);
        await loadNhMangaImage(images, levelThreeContainer);
    }
}


async function loadHMangaImage(levelThreeContainer: HTMLDivElement): Promise<void> {
    const levelThreeHref: string = levelThreeContainer.getAttribute(DATA_LEVEL_THREE_HREF);
    if (levelThreeHref !== null && !breakLoop) {
        const imageDocument: Document = await getResponseDocument(levelThreeHref);

        // append the image to the container
        const levelThreeImage: HTMLImageElement = imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
        const image: HTMLImageElement = new Image();
        image.src = levelThreeImage.src;
        image.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        levelThreeContainer.appendChild(image);

        // get the next image document href
        const nextAnchor = imageDocument.querySelector(".next") as HTMLAnchorElement;
        if (nextAnchor.href === EMPTY_STRING) { // there's always a .next, but .next.href can be empty
            levelThreeContainer.removeAttribute(DATA_LEVEL_THREE_HREF);
        } else {
            levelThreeContainer.setAttribute(DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }

        // load the image
        image.onload = async () => {
            await loadHMangaImage(levelThreeContainer);
        }
        image.onerror = async () => {
            await onImageLoadError(image);
        }

        observeHMangaImage(image);
    }
}

function observeHMangaImage(image: HTMLImageElement) {
    // observe the image
    const setInfo = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                const levelThreeHref: string = entryTarget.getAttribute(DATA_LEVEL_THREE_HREF);
                localStorage.setItem(levelThreeHref, Date.now() + "");
                updateLastRead(document.getElementById(levelThreeHref));
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


async function getNhMangaImages(levelThreeHref: string, retry: boolean = true): Promise<HTMLImageElement[]> {
    const images: HTMLImageElement[] = [];
    const chapter: Document = await getResponseDocument(levelThreeHref, retry);
    if (chapter !== null) {
        const viewports: number[] = [];
        const readerAreaChildren: HTMLCollectionOf<HTMLElement> = chapter.getElementById("readerarea").children as HTMLCollectionOf<HTMLElement>;
        for (let i: number = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(CLASS)?.includes("ai-viewport-2")) {
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
                    const dataCfsrc = levelThreeImage.getAttribute(DATA_CFSRC);
                    if (dataCfsrc !== null) {
                        const image: HTMLImageElement = new Image();
                        image.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
                        image.setAttribute(DATA_SRC, levelThreeImage.getAttribute(DATA_CFSRC));
                        images.push(image);
                    }
                }
            }
        }
    }

    if (images.length > 0) {
        const image: HTMLImageElement = images.pop();
        image.className = OBSERVE_IMAGE;
        images.push(image);
    }

    return images;
}

async function loadNhMangaImage(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement, index: number = 0): Promise<void> {
    if (index < images.length && !breakLoop) {
        const image: HTMLImageElement = images[index];
        levelThreeContainer.append(image);
        image.src = image.getAttribute(DATA_SRC);
        image.onload = async () => {
            await loadNhMangaImage(images, levelThreeContainer, ++index);
        }
        image.onerror = async () => {
            await onImageLoadError(image);
        }
        observeNhMangaImage(image);

    } else if (index === images.length) {
        loadNextChapter(images, levelThreeContainer);
    }
}

function observeNhMangaImage(image: HTMLImageElement) {
    // set the info of the current image
    const setInfo = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const observedImage: HTMLImageElement = entry.target as HTMLImageElement;
                const infoContent: HTMLSpanElement = document.querySelector(".info-content") as HTMLSpanElement;
                const levelThreeHref = observedImage.getAttribute(DATA_LEVEL_THREE_HREF);
                infoContent.innerText = levelThreeHref;
                localStorage.setItem(levelThreeHref, Date.now() + "");
                updateLastRead(document.getElementById(levelThreeHref));
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

function loadNextChapter(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement) {
    // load next chapter
    const nextChapter = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const image: HTMLImageElement = entry.target as HTMLImageElement;
                observer.unobserve(image);
                image.removeAttribute(CLASS);
                const nextChapterHref: string = getNextChapterHref(images);
                const nextChapterImages: HTMLImageElement[] = await getNhMangaImages(nextChapterHref, false);
                if (nextChapterImages.length > 0) {
                    await loadNhMangaImage(nextChapterImages, levelThreeContainer);
                }
            }
        })
    }
    const nextChapterOptions: {} = {
        root: null,
        rootMargin: LOOK_AHEAD
    }
    const nextChapterObserver: IntersectionObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
    const image: HTMLImageElement = document.querySelector(PERIOD + OBSERVE_IMAGE) as HTMLImageElement;
    nextChapterObserver.observe(image);
}

function getNextChapterHref(images: HTMLImageElement[]): string {
    const href: string = images[0].getAttribute(DATA_LEVEL_THREE_HREF);
    const parts: string[] = href.split(HYPHEN);
    const chapterString: string = "chapter";
    const indexOfChapter: number = parts.indexOf(chapterString);
    const end: string = parts[indexOfChapter + 1];
    const chapterNumber: string = end.substring(0, end.length - 1);
    let nextChapterNumber: number;
    if (end.includes(PERIOD)) { // we are on a half chapter, skip this and get the next one
        nextChapterNumber = parseInt(chapterNumber.split(PERIOD)[0]) + 1;
    } else {
        nextChapterNumber = parseInt(chapterNumber) + 1;
    }
    let nextChapterHref: string = EMPTY_STRING;
    for (let i: number = 0; i < indexOfChapter; i++) {
        nextChapterHref += parts[i] + HYPHEN;
    }
    nextChapterHref += chapterString + HYPHEN + nextChapterNumber + "/";
    return nextChapterHref;
}
