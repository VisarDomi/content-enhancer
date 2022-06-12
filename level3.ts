let level2ScrollPosition: number;
let nextImageHref: string;
let breakLoop: boolean; // don't send any more requests if you go back to level 2

async function loadL3(element: HTMLElement): Promise<void> {
    // don't request more images if we go back to level 2
    breakLoop = false;

    // scroll to the top - order matters
    level2ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 3
    const l2ContainerId: string = element.getAttribute(DATA_L2_ID);
    const l2Container: HTMLDivElement = document.getElementById(l2ContainerId) as HTMLDivElement;
    const l3Href: string = element.getAttribute(DATA_HREF);
    const l3ContainerId: string = "l3" + l3Href;
    const l3Container: HTMLDivElement = document.createElement(DIV);
    l3Container.id = l3ContainerId;
    document.body.appendChild(l3Container);
    l2Container.style.display = NONE; // hide level 2
    createGoToL2(l2Container, l3Container, "goToL2");

    // now it's time to load the images TODO: use OOP
    if (originalHref.includes(NHENTAI)) {
        nextImageHref = l3Href;
        await loadNhImage(l3Container);
    } else if (originalHref.includes(ASURASCANS)) {
        const images: HTMLImageElement[] = await getAsImages(l3Href);
        observeLastImage(images, IMAGE);
        await loadAsImage(images, l3Container);
    }
}

function createGoToL2(l2Container: HTMLDivElement, l3Container: HTMLDivElement, functionName: string): void {
    // the back button
    const goToL2: HTMLDivElement = document.createElement(DIV);
    goToL2.className = GO_BACK;
    goToL2.setAttribute(ONCLICK, functionName + "('" + l2Container.id + "', '" + l3Container.id + "')");
    l3Container.appendChild(goToL2);
}

function goToL2(l2ContainerId: string, l3ContainerId: string): void {
    let show: string;
    if (originalHref.includes(NHENTAI)) { // TODO: use OOP
        show = BLOCK;
    } else if (originalHref.includes(ASURASCANS)) {
        show = "flex";
    }
    document.getElementById(l2ContainerId).style.display = show; // show level 2
    document.getElementById(l3ContainerId).remove(); // destroy level 3

    // break loop - stop requesting new images TODO: use OOP
    breakLoop = true;
    // set doNotRetry to false again
    doNotRetry = false;

    // scroll to level 2 scroll position
    window.scrollTo({top: level2ScrollPosition});
}

async function loadNhImage(l3Container: HTMLDivElement): Promise<void> {
    if (nextImageHref !== EMPTY_STRING && !breakLoop) {
        // get the next image
        const imageDocument: Document = await getResponseDocument(nextImageHref);

        // append the image to the container
        const image: HTMLImageElement = imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
        const l3Image: HTMLImageElement = new Image();
        l3Image.src = image.src;
        l3Container.appendChild(l3Image);

        // set the next image to be loaded TODO: use OOP
        const nextImage = imageDocument.querySelector(".next") as HTMLAnchorElement;
        nextImageHref = nextImage === null ? EMPTY_STRING : nextImage.href;

        // load the next image
        l3Image.onload = async () => {
            await loadNhImage(l3Container);
        }
        l3Image.onerror = async () => {
            await onImageLoadError(l3Image);
        }
    }
}

async function getAsImages(href: string): Promise<HTMLImageElement[]> {
    const images: HTMLImageElement[] = [];
    const chapter: Document = await getResponseDocument(href);
    if (chapter !== null) {
        const viewports: number[] = [];
        const readerAreaChildren: HTMLCollectionOf<Element> = chapter.getElementById("readerarea").children;
        for (let i: number = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(CLASS)?.includes("ai-viewport-2")) {
                viewports.push(i);
            }
        }
        viewports.pop(); // remove the last image (it's the credits image)
        for (const viewport of viewports) {
            // the index of the p tags are always 2 more than the index of the viewports
            // the p tag contains only the image
            const image: HTMLImageElement = readerAreaChildren[viewport + 2].children[0] as HTMLImageElement;
            const newImage: HTMLImageElement = new Image();
            newImage.setAttribute(DATA_HREF, href);
            newImage.setAttribute(DATA_SRC, image.getAttribute(DATA_CFSRC))
            images.push(newImage)
        }
    }
    return images;
}

async function loadAsImage(images: HTMLImageElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
    if (index < images.length && !breakLoop) {
        const image: HTMLImageElement = images[index];
        container.append(image);
        image.src = image.getAttribute(DATA_SRC);
        image.onload = async () => {
            await loadAsImage(images, container, ++index);
        }
    } else if (index === images.length) {
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(entryTarget);
                    entryTarget.removeAttribute(CLASS);
                    const nextChapterHref: string = getNextChapterHref(images);
                    doNotRetry = true;
                    const nextChapterImages: HTMLImageElement[] = await getAsImages(nextChapterHref);
                    if (nextChapterImages.length > 0) {
                        observeLastImage(nextChapterImages, IMAGE);
                        await loadAsImage(nextChapterImages, container);
                    }
                }
            })
        }
        const options: {} = {
            root: null,
            rootMargin: (index * 100/2) + "%" // load when half is reached
        }
        const observer: IntersectionObserver = new IntersectionObserver(callback, options);
        const target: HTMLImageElement = document.querySelector("." + IMAGE) as HTMLImageElement;
        observer.observe(target);
    }
}

function getNextChapterHref(images: HTMLImageElement[]): string {
    const href: string = images[0].getAttribute(DATA_HREF);
    const SEPARATOR = "-";
    const parts: string[] = href.split(SEPARATOR);
    const CHAPTER: string = "chapter";
    const indexOfChapter: number = parts.indexOf(CHAPTER);
    const end: string = parts[indexOfChapter + 1];
    const chapterNumber: string = end.substring(0, end.length - 1);
    let nextChapterNumber: number;
    if (end.includes(".")) { // we are on a half chapter, skip this and get the next one
        nextChapterNumber = parseInt(chapterNumber.split(".")[0]) + 1;
    } else {
        nextChapterNumber = parseInt(chapterNumber) + 1;
    }
    let nextChapterHref: string = EMPTY_STRING;
    for (let i: number = 0; i < indexOfChapter; i++) {
        nextChapterHref += parts[i] + SEPARATOR;
    }
    nextChapterHref += CHAPTER + SEPARATOR + nextChapterNumber + "/";
    return nextChapterHref;
}
