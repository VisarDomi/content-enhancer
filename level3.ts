let level2ScrollPosition: number;
let nextImageHref: string;
let breakLoop: boolean; // don't send any more requests if you go back to level 2

async function loadL3(element: HTMLElement): Promise<void> {
    // scroll to the top - order matters
    level2ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 3
    const l2ContainerId: string = element.getAttribute("data-l2-id");
    const l2Container: HTMLDivElement = document.getElementById(l2ContainerId) as HTMLDivElement;
    const l3Href: string = element.getAttribute("data-href");
    const l3ContainerId: string = "l3" + l3Href;
    const l3Container: HTMLDivElement = document.createElement("div");
    l3Container.id = l3ContainerId;
    document.body.appendChild(l3Container);
    l2Container.style.display = "none"; // hide level 2
    createGoToL2(l2Container, l3Container, "goToL2");

    // now it's time to load the images TODO: use OOP
    if (originalHref.includes(NHENTAI)) {
        nextImageHref = l3Href;
        breakLoop = false;
        await loadNhImage(l3Container);
    } else if (originalHref.includes(ASURASCANS)) {
        const images: HTMLImageElement[] = await getAsImages(l3Href);
        breakLoop = false;
        await loadAsImage(images, l3Container);
    }
}

function createGoToL2(l2Container: HTMLDivElement, l3Container: HTMLDivElement, functionName: string): void {
    // the back button
    const goToL2: HTMLDivElement = document.createElement("div");
    goToL2.className = "go-back";
    goToL2.setAttribute("onclick", functionName + "('" + l2Container.id + "', '" + l3Container.id + "')");
    l3Container.appendChild(goToL2);
}

function goToL2(l2ContainerId: string, l3ContainerId: string): void {
    let show: string;
    if (originalHref.includes(NHENTAI)) { // TODO: use OOP
        show = "block";
    } else if (originalHref.includes(ASURASCANS)) {
        show = "flex";
    }
    document.getElementById(l2ContainerId).style.display = show; // show level 2
    document.getElementById(l3ContainerId).remove(); // destroy level 3

    // break loop - stop requesting new images TODO: use OOP
    breakLoop = true;

    // scroll to level 2 scroll position
    window.scrollTo({top: level2ScrollPosition});
}

async function loadNhImage(l3Container: HTMLDivElement): Promise<void> {
    if (nextImageHref !== "" && !breakLoop) {
        // get the next image
        const imageDocument: Document = await getResponseDocument(nextImageHref);

        // append the image to the container
        const image: HTMLImageElement = imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
        const l3Image: HTMLImageElement = new Image();
        l3Image.src = image.src;
        l3Container.appendChild(l3Image);

        // set the next image to be loaded TODO: use OOP
        const nextImage = imageDocument.querySelector(".next") as HTMLAnchorElement;
        nextImageHref = nextImage === null ? "" : nextImage.href;

        // load the next image
        l3Image.onload = async () => {
            await loadNhImage(l3Container);
        }
        l3Image.onerror = async () => {
            await onImageLoadError(l3Image);
        }
    } else {
        // a load more button for asurascans
    }
}

async function getAsImages(href: string): Promise<HTMLImageElement[]> {
    const chapter: Document = await getResponseDocument(href);
    const images: HTMLImageElement[] = [];
    const viewports: number[] = [];
    const readerAreaChildren: HTMLCollectionOf<Element> = chapter.getElementById("readerarea").children;
    for (let i: number = 0; i < readerAreaChildren.length; i++) {
        // find all the indexes of the children that have the class ai-viewport-2
        if (readerAreaChildren[i].getAttribute("class")?.includes("ai-viewport-2")) {
            viewports.push(i);
        }
    }
    viewports.pop(); // remove the last image (it's the credits image)
    for (const viewport of viewports) {
        // the index of the p tags are always 2 more than the index of the viewports
        // the p tag contains only the image
        const image: HTMLImageElement = readerAreaChildren[viewport + 2].children[0] as HTMLImageElement;
        image.setAttribute("data-href", href);
        images.push(image)
    }
    return images;
}

async function loadAsImage(images: HTMLImageElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
    if (index < images.length && !breakLoop) {
        const image: HTMLImageElement = images[index];
        const newImage: HTMLImageElement = new Image();
        newImage.setAttribute("style", "height:auto;width:100%");
        let imageSrc: string = image.getAttribute("src");
        if (imageSrc === null) {
            imageSrc = image.getAttribute("data-cfsrc");
        }
        newImage.src = imageSrc;
        newImage.onload = async () => {
            await loadAsImage(images, container, ++index);
        }
        container.append(newImage);
    } else if (index === images.length) {
        const loadNextChapter: HTMLButtonElement = document.createElement("button");
        loadNextChapter.className = "load-next-chapter";
        loadNextChapter.innerText = "Load Next Chapter";
        container.appendChild(loadNextChapter);
        loadNextChapter.onclick = async () => {
            const nextChapterHref: string = getNextChapterHref(images);
            const newImages: HTMLImageElement[] = await getAsImages(nextChapterHref);
            if (newImages.length > 0) {
                loadNextChapter.remove();
                await loadAsImage(newImages, container);
            } else {
                loadNextChapter.innerText = "No more new chapters";
            }
        }
    }
}

function getNextChapterHref(images: HTMLImageElement[]): string {
    const href: string = images[0].getAttribute("data-href");
    const parts: string[] = href.split("-");
    const CHAPTER: string = "chapter";
    const indexOfChapter: number = parts.indexOf(CHAPTER);
    const end: string = parts[indexOfChapter + 1];
    const chapterNumber: string = end.substring(0, end.length - 1);
    let nextChapterNumber: number;
    if (end.includes(".5")) { // we are on a half chapter, skip this and get the next one
        nextChapterNumber = parseInt(chapterNumber.split(".")[0]) + 1;
    } else {
        nextChapterNumber = parseInt(chapterNumber) + 1;
    }
    let nextChapterHref: string = "";
    for (let i: number = 0; i < indexOfChapter; i++) {
        nextChapterHref += parts[i] + "-";
    }
    nextChapterHref += CHAPTER + "-" + nextChapterNumber + "/";
    return nextChapterHref;
}
