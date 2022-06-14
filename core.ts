// settings
const LOOK_AHEAD = "1000%"; // look ahead 10 screens

// logic
let retry: boolean = true; // do we retry a request every 5 seconds?
let nextSearchResultsHref: string;
let originalHref: string;
let currentChapterHref: string;

// string names
const L1_CONTAINER_ID: string = "l1-container";
const L2_CONTAINER_ID: string = "l2-container";
const L3_CONTAINER_ID: string = "l3-container";
const THUMBNAIL = "observeThumbnail";
const IMAGE = "observeImage";
const EPH_NUM = "eph-num";
const LAST_READ_1 = "lastRead1";
const LAST_READ_2 = "lastRead2";
const LAST_AVAILABLE_2 = "last-available-2";
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_HREF = "data-href";
const DATA_DURATION = "data-duration";
const EMPTY_STRING = "";
const ONCLICK = "onclick";
const CLASS = "class";
const BLOCK = "block";
const FLEX = "flex";
const NONE = "none";

// websites
const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";
const ASURASCANS: string = "asurascans";

function setNextSearchResultsHref(currentDocument: Document): void {
    let anchor: HTMLAnchorElement = null;
    if (originalHref.includes(TOKYOMOTION)) {
        anchor = currentDocument.querySelector(".prevnext") as HTMLAnchorElement;
    } else if (originalHref.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next") as HTMLAnchorElement;
    } else if (originalHref.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next") as HTMLAnchorElement;
    } else if (originalHref.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r") as HTMLAnchorElement;
    }
    nextSearchResultsHref = anchor === null ? EMPTY_STRING : anchor.href;
}

function getSearchResultsThumbnails(responseDocument: Document): HTMLImageElement[] {
    const searchResultsThumbnails: HTMLImageElement[] = [];
    const thumbnailList: HTMLElement[] = [];
    if (originalHref.includes(TOKYOMOTION)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".thumb-popu") as NodeListOf<HTMLAnchorElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(KISSJAV)) {
        const selectedElements: HTMLCollectionOf<HTMLLIElement> = responseDocument.querySelector(".videos").children as HTMLCollectionOf<HTMLLIElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(NHENTAI)) {
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = responseDocument.querySelector(".index-container").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(ASURASCANS)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".imgu") as NodeListOf<HTMLAnchorElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    for (const thumbnail of thumbnailList) {
        let l2Href: HTMLAnchorElement;
        let l1Thumbnail: HTMLImageElement;

        if (originalHref.includes(TOKYOMOTION)) {
            l2Href = thumbnail as HTMLAnchorElement;
            const thumbOverlayChildren: HTMLCollectionOf<HTMLElement> = l2Href.children[0].children as HTMLCollectionOf<HTMLElement>;
            l1Thumbnail = thumbOverlayChildren[0] as HTMLImageElement;
            const duration: HTMLDivElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLImageElement;
            l1Thumbnail.setAttribute(DATA_DURATION, duration.innerText.trim());
        } else if (originalHref.includes(KISSJAV)) {
            const cardImageChildren: HTMLCollectionOf<HTMLElement> = thumbnail.children[0].children[0].children as HTMLCollectionOf<HTMLElement>;
            l2Href = cardImageChildren[0].children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href?.children[0] as HTMLImageElement;
            if (l1Thumbnail === undefined) {
                continue; // don't do anything, it's an ad
            }
            if (l1Thumbnail.getAttribute(DATA_SRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_SRC);
            }
            const duration: HTMLDivElement = cardImageChildren[1] as HTMLDivElement;
            l1Thumbnail.setAttribute(DATA_DURATION, duration.innerHTML.split("/span>")[1]);
        } else if (originalHref.includes(NHENTAI)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
            if (l1Thumbnail.getAttribute(DATA_SRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_SRC);
            }
        } else if (originalHref.includes(ASURASCANS)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
            if (l1Thumbnail.getAttribute(DATA_CFSRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_CFSRC);
            }
        }

        pushThumbnail(l1Thumbnail, l2Href, "loadL2", searchResultsThumbnails, "l1-thumbnail");
    }

    return searchResultsThumbnails;
}

function pushThumbnail(levelThumbnail: HTMLImageElement, levelHref: HTMLAnchorElement, functionName: string, thumbnails: HTMLImageElement[], className: string): void {
    // we got all the needed data
    const thumbnail: HTMLImageElement = new Image();
    thumbnail.setAttribute(DATA_HREF, levelHref.href);
    thumbnail.setAttribute(ONCLICK, functionName + "(this)"); // we do it this way to split the code into several files
    thumbnail.setAttribute(DATA_SRC, levelThumbnail.src);
    thumbnail.className = className;

    const duration: string = levelThumbnail.getAttribute(DATA_DURATION);
    if (duration !== null) {
        thumbnail.setAttribute(DATA_DURATION, duration)
    }

    thumbnails.push(thumbnail);
}

async function getResponseDocument(href: string): Promise<Document> {
    const response: Response = await getResponse(href);
    if (response !== null) {
        const text: string = await response.text();
        return new DOMParser().parseFromString(text, "text/html");
    } else {
        return null;
    }
}

async function getResponse(href: string): Promise<Response> {
    const response: Response = await fetch(href);
    if (response.status === 200) { // the base case, the response was successful
        return response;
    } else if (!retry) {
        return null; // do not retry
    } else { // wait 5 seconds before retrying
        await waitFor(5000);
        return await getResponse(href);
    }
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function onImageLoadError(image: HTMLImageElement): Promise<void> {
    // reload the image in 5 seconds
    await waitFor(5000);
    let imageSrc: string = image.src;
    const TIME = "?time=";
    const timeIndex: number = imageSrc.indexOf(TIME);
    const time: string = TIME + Date.now();
    if (timeIndex !== -1) {
        imageSrc = imageSrc.substring(0, timeIndex) + time;
    } else {
        imageSrc += time;
    }
    image.src = imageSrc;
}

function appendToContainer(thumbnail: HTMLImageElement, container: HTMLDivElement): void {
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) { // TODO: add last watched information
        const duration: HTMLDivElement = document.createElement("div");
        duration.innerText = thumbnail.getAttribute(DATA_DURATION);
        duration.className = "duration";
        const thumbnailContainer: HTMLDivElement = document.createElement("div");
        thumbnailContainer.className = "thumbnail-container";
        thumbnailContainer.appendChild(duration); // order matters
        thumbnailContainer.appendChild(thumbnail);
        container.appendChild(thumbnailContainer);
    } else if (originalHref.includes(NHENTAI)) { // TODO: add last read information
        container.appendChild(thumbnail);
    } else if (originalHref.includes(ASURASCANS)) {
        const l2Href = thumbnail.getAttribute(DATA_HREF);

        const latestContainer: HTMLDivElement = document.createElement("div");
        latestContainer.className = "latest-container";
        const lastRead: HTMLDivElement = document.createElement("div");
        lastRead.className = "last-read-element";
        latestContainer.appendChild(lastRead);
        const lastAvailable: HTMLDivElement = document.createElement("div");
        lastAvailable.className = "last-available-element";
        latestContainer.appendChild(lastAvailable);

        const lastRead1: HTMLDivElement = document.createElement("div");
        lastRead1.id = LAST_READ_1 + l2Href;
        lastRead1.innerText = "Loading";
        lastRead.appendChild(lastRead1);
        const lastRead2: HTMLDivElement = document.createElement("div");
        lastRead2.id = LAST_READ_2 + l2Href;
        lastRead2.innerText = "Loading";
        lastRead.appendChild(lastRead2);
        const lastAvailable1: HTMLDivElement = document.createElement("div");
        lastAvailable1.innerText = "Last available:";
        lastAvailable.appendChild(lastAvailable1);
        const lastAvailable2: HTMLDivElement = document.createElement("div");
        lastAvailable2.id = LAST_AVAILABLE_2 + l2Href;
        lastAvailable2.innerText = "Loading";
        lastAvailable.appendChild(lastAvailable2);

        // let's send a request asynchronously
        const mangaDocumentPromise: Promise<Document> = getResponseDocument(l2Href);
        mangaDocumentPromise.then(mangaDocument => {
            const chapters: HTMLDivElement[] = [];
            const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll("." + EPH_NUM) as NodeListOf<HTMLDivElement>;
            chapters.splice(0, 0, ...Array.from(nodeChapters));
            updateLastReadChapter(chapters, lastRead1, lastRead2, lastAvailable2);
        })

        const thumbnailContainer: HTMLDivElement = document.createElement("div");
        thumbnailContainer.className = "thumbnail-container";
        thumbnailContainer.appendChild(latestContainer);
        thumbnailContainer.appendChild(thumbnail);
        container.append(thumbnailContainer);
    }
}

function updateLastReadChapter(chapters: HTMLDivElement[], lastRead1: HTMLDivElement, lastRead2: HTMLDivElement, lastAvailable2: HTMLDivElement) {
    const readChapters: { chapterName: string, lastRead: number, chapterHref: string }[] = [];
    let lastReadFound: boolean = false;
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
        const chapterHref: string = anchor.href;
        const lastRead: string = localStorage.getItem(chapterHref);
        const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
        const chapterName = span.innerText;
        if (lastRead !== null) {
            lastReadFound = true;
            const last: number = parseInt(lastRead);
            readChapters.push({
                chapterName,
                lastRead: last,
                chapterHref
            })
        }
        if (i === 0) {
            lastAvailable2.innerText = chapterName;
        }
    }

    if (lastReadFound) {
        // I caved in and got some help for this reduce function
        const lastReadChapter: { chapterName: string, lastRead: number } = readChapters.reduce((previous, current) => {
            return (previous.lastRead > current.lastRead) ? previous : current;
        })
        lastRead1.innerText = "Read: " + getTimeAgo(lastReadChapter.lastRead + "");
        lastRead2.innerText = lastReadChapter.chapterName;
    } else {
        lastRead1.innerText = "Never read before";
        lastRead2.innerText = "New";
    }
}

function observeThumbnails(): void {
    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
                await loadL1();
            }
        })
    }
    const options: {} = {
        root: null,
        rootMargin: LOOK_AHEAD
    }
    const observer: IntersectionObserver = new IntersectionObserver(callback, options);
    const target: HTMLImageElement = document.querySelector("." + THUMBNAIL) as HTMLImageElement;
    observer.observe(target);
}

async function loadThumbnail(thumbnails: HTMLImageElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
    if (index < thumbnails.length) {
        const thumbnail = thumbnails[index];
        thumbnail.src = thumbnail.getAttribute(DATA_SRC);
        thumbnail.onload = async () => {
            await loadThumbnail(thumbnails, container, ++index);
        }
        thumbnail.onerror = async () => {
            await onImageLoadError(thumbnail);
        }
        appendToContainer(thumbnail, container);
    } else if (index === thumbnails.length && container.id === L1_CONTAINER_ID) { // load new pages using the Intersection API - functional programming
        observeThumbnails();
    }
}

function observeLastImage(images: HTMLImageElement[], className: string): void {
    // start loading the thumbnails
    const image: HTMLImageElement = images.pop();
    image.className = className;
    images.push(image);
}

function createBackButton(container: HTMLDivElement, functionName: string, className: string): void {
    const backButton: HTMLDivElement = document.createElement("div");
    backButton.className = className;
    backButton.setAttribute(ONCLICK, functionName + "(this)");
    container.appendChild(backButton);
}

function getTimeAgo(unixTime: string): string {
    const now: number = Date.now();
    const before: number = parseInt(unixTime);
    let difference: number = (now - before) / 1000;
    let timeAgo: string = Math.floor(difference) + " seconds ago";
    timeAgo = getTime(timeAgo, difference, 60, " minute ago", " minutes ago");
    timeAgo = getTime(timeAgo, difference, 60 * 60, " hour ago", " hours ago");
    timeAgo = getTime(timeAgo, difference, 60 * 60 * 24, " day ago", " days ago");
    timeAgo = getTime(timeAgo, difference, 60 * 60 * 24 * 7, " week ago", " weeks ago");
    timeAgo = getTime(timeAgo, difference, 60 * 60 * 24 * 7 * 4, " month ago", " months ago");
    timeAgo = getTime(timeAgo, difference, 60 * 60 * 24 * 7 * 4 * 12, " year ago", " years ago");
    return timeAgo;
}

function getTime(timeAgo: string, difference: number, factor: number, singular: string, plural: string): string {
    if (difference > factor) {
        const time: number = Math.floor(difference / factor);
        if (time === 1) {
            timeAgo = time + singular;
        } else {
            timeAgo = Math.floor(difference / factor) + plural;
        }
    }
    return timeAgo;
}

(async () => {
    originalHref = location.href;
    setNextSearchResultsHref(document);

    // collect the thumbnails before the html element is removed
    let searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(document);

    // set up the html
    const contentEnhancers: NodeListOf<HTMLScriptElement> = document.querySelectorAll(".content-enhancer") as NodeListOf<HTMLScriptElement>;
    document.body.parentElement.remove(); // destroy everything
    const html: HTMLHtmlElement = document.createElement("html");
    const body: HTMLBodyElement = document.createElement("body");
    const head: HTMLHeadElement = document.createElement("head");
    for (const contentEnhancer of contentEnhancers) {
        head.appendChild(contentEnhancer);
    }
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    // level 1
    const l1Container: HTMLDivElement = document.createElement("div");
    l1Container.id = L1_CONTAINER_ID;
    body.appendChild(l1Container);

    observeLastImage(searchResultsThumbnails, THUMBNAIL);
    await loadThumbnail(searchResultsThumbnails, l1Container);
})();
