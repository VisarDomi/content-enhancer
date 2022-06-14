// settings
const LOOK_AHEAD = "1000%"; // look ahead 10 screens

// logic
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_HREF = "data-href";
const DATA_DURATION = "data-duration";
const DATA_NEXT_HREF = "data-next-href";
const originalHref: string = location.href;

let currentChapterHref: string;

// string names
const L1_CONTAINER_ID: string = "l1-container";
const L2_CONTAINER_ID: string = "l2-container";
const L3_CONTAINER_ID: string = "l3-container";
const THUMBNAIL_CONTAINER: string = "thumbnail-container";
const THUMBNAIL = "observeThumbnail";
const IMAGE = "observeImage";
const EPH_NUM = "eph-num";
const LAST_READ_1 = "lastRead1";
const LAST_READ_2 = "lastRead2";
const LAST_AVAILABLE_2 = "last-available-2";
const EMPTY_STRING = "";
const ONCLICK = "onclick";
const CLASS = "class";
const BLOCK = "block";
const FLEX = "flex";
const NONE = "none";
const LOADING___ = "Loading...";

// websites
const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";
const ASURASCANS: string = "asurascans";

function getNextSearchResultsHref(currentDocument: Document): string {
    let nextSearchResultsHref = EMPTY_STRING;
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
    if (anchor !== null) {
        nextSearchResultsHref = anchor.href;
    }

    return nextSearchResultsHref;
}

function getThumbnailList(responseDocument: Document) {
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
    return thumbnailList;
}

function setSearchResultsThumbnails(thumbnail: HTMLElement, searchResultsThumbnails: HTMLImageElement[]) {
    let shouldPushThumbnail: boolean = true;
    let levelTwoHref: HTMLAnchorElement;
    let levelOneThumbnail: HTMLImageElement;

    if (originalHref.includes(TOKYOMOTION)) {
        levelTwoHref = thumbnail as HTMLAnchorElement;
        const thumbOverlayChildren: HTMLCollectionOf<HTMLElement> = levelTwoHref.children[0].children as HTMLCollectionOf<HTMLElement>;
        levelOneThumbnail = thumbOverlayChildren[0] as HTMLImageElement;
        const duration: HTMLDivElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLImageElement;
        levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerText.trim());
    } else if (originalHref.includes(KISSJAV)) {
        const cardImageChildren: HTMLCollectionOf<HTMLElement> = thumbnail.children[0].children[0].children as HTMLCollectionOf<HTMLElement>;
        levelTwoHref = cardImageChildren[0].children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoHref?.children[0] as HTMLImageElement;
        if (levelOneThumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        } else if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
            const duration: HTMLDivElement = cardImageChildren[1] as HTMLDivElement;
            levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerHTML.split("/span>")[1]);
        }
    } else if (originalHref.includes(NHENTAI)) {
        levelTwoHref = thumbnail.children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoHref.children[0] as HTMLImageElement;
        if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
        }
    } else if (originalHref.includes(ASURASCANS)) {
        levelTwoHref = thumbnail.children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoHref.children[0] as HTMLImageElement;
        if (levelOneThumbnail.getAttribute(DATA_CFSRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_CFSRC);
        }
    }

    if (shouldPushThumbnail) {
        pushThumbnail(levelOneThumbnail, levelTwoHref, "loadLevelTwo", searchResultsThumbnails, "l1-thumbnail");
    }
}

function getSearchResultsThumbnails(responseDocument: Document, nextSearchResultsHref: string): HTMLImageElement[] {
    const searchResultsThumbnails: HTMLImageElement[] = [];
    const thumbnailList = getThumbnailList(responseDocument);
    for (const thumbnail of thumbnailList) {
        thumbnail.setAttribute(DATA_NEXT_HREF, nextSearchResultsHref);
        setSearchResultsThumbnails(thumbnail, searchResultsThumbnails);
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

    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        const duration: string = levelThumbnail.getAttribute(DATA_DURATION);
        thumbnail.setAttribute(DATA_DURATION, duration);
    }

    thumbnails.push(thumbnail);
}

async function getResponseDocument(href: string, retry: boolean = true): Promise<Document> {
    const response: Response = await getResponse(href, retry);
    let returnedDocument: Document = null;
    if (response !== null) {
        const text: string = await response.text();
        returnedDocument = new DOMParser().parseFromString(text, "text/html");
    }

    return returnedDocument;
}

async function waitRandomly(minMilliseconds: number, maxMilliseconds: number): Promise<void> {
    await waitFor(Math.floor(minMilliseconds + Math.random() * (maxMilliseconds - minMilliseconds + 1)));
}

async function getResponse(href: string, retry: boolean): Promise<Response> {
    if (originalHref.includes(NHENTAI)) {
        await waitRandomly(0, 10000);
    }
    const response: Response = await fetch(href);
    let returnedResponse: Response = null;
    const statusOk: number = 200;
    if (response.status === statusOk) { // the base case, the response was successful
        returnedResponse = response;
    } else if (!retry) {
        // do not retry
    } else {
        // wait between 1 and 5 seconds
        await waitRandomly(5000, 10000);
        returnedResponse = await getResponse(href, true);
    }

    return returnedResponse;
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function onImageLoadError(image: HTMLImageElement): Promise<void> {
    // reload the image in 5 seconds
    await waitRandomly(5000, 10000);
    let imageSrc: string = image.src;
    const timePart = "?time=";
    const timeIndex: number = imageSrc.indexOf(timePart);
    const time: string = timePart + Date.now();
    if (timeIndex === -1) {
        imageSrc += time;
    } else {
        imageSrc = imageSrc.substring(0, timeIndex) + time;
    }
    image.src = imageSrc;
}

function updateLevelOneHManga(galleryThumbnailList: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableTwo: HTMLDivElement) {
    lastAvailableTwo.innerText = "Page " + galleryThumbnailList.length;
    // TODO: first save the information, then get back to this
    const readGalleryThumbnails: { galleryThumbnailHref: string, lastRead: number }[] = [];
    for (const galleryThumbnailElement of galleryThumbnailList) {
        const levelThreeHref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelTwoThumbnail: HTMLImageElement = levelThreeHref.children[0] as HTMLImageElement;
    }
}

function updateLevelOneNhManga(chapters: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableTwo: HTMLDivElement) {
    const readChapters: { chapterName: string, lastRead: number }[] = [];
    let lastReadFound: boolean = false;
    for (let i = 0; i < chapters.length; i++) {
        const chapter: HTMLDivElement = chapters[i];
        const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
        const chapterHref: string = anchor.href;
        const lastRead: string = localStorage.getItem(chapterHref);
        const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
        const chapterName: string = span.innerText;
        if (lastRead !== null) {
            lastReadFound = true;
            const last: number = parseInt(lastRead);
            readChapters.push({
                chapterName,
                lastRead: last
            })
        }
        if (i === 0) {
            lastAvailableTwo.innerText = chapterName;
        }
    }

    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadChapter: { chapterName: string, lastRead: number } = readChapters.reduce(getLastReadChapter);
        lastReadOne.innerText = "Read: " + getTimeAgo(lastReadChapter.lastRead + "");
        lastReadTwo.innerText = lastReadChapter.chapterName;
    } else {
        lastReadOne.innerText = "Never read before";
        lastReadTwo.innerText = "New";
    }
}

function getLastReadChapter(previous: { chapterName: string, lastRead: number }, current: { chapterName: string, lastRead: number }): { chapterName: string, lastRead: number } {
    let returnedChapter: { chapterName: string, lastRead: number };
    if (previous.lastRead > current.lastRead) {
        returnedChapter = previous;
    } else {
        returnedChapter = current;
    }

    return returnedChapter;
}

function observeTargets() {
    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
                const href: string = entryTarget.getAttribute(DATA_NEXT_HREF);
                if (href !== EMPTY_STRING) {
                    const levelOneContainer: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;
                    const searchResultsDocument: Document = await getResponseDocument(href);
                    const nextSearchResultsHref: string = getNextSearchResultsHref(searchResultsDocument);
                    const searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(searchResultsDocument, nextSearchResultsHref);
                    observeLastImage(searchResultsThumbnails, THUMBNAIL);
                    await loadThumbnail(searchResultsThumbnails, levelOneContainer);
                }
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

function updateThumbnailInformation(lastAvailableOne: HTMLDivElement, levelTwoHref: string, lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableTwo: HTMLDivElement) {
    if (originalHref.includes(NHENTAI)) {
        lastAvailableOne.innerText = "Last gallery page:";
        const documentPromise: Promise<Document> = getResponseDocument(levelTwoHref);
        documentPromise.then(mangaDocument => {
            const galleryThumbnailsList: HTMLDivElement[] = [];
            const galleryThumbnailCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(".thumbs").children as HTMLCollectionOf<HTMLDivElement>;
            galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailCollection));
            updateLevelOneHManga(galleryThumbnailsList, lastReadOne, lastReadTwo, lastAvailableTwo);
        })
    } else if (originalHref.includes(ASURASCANS)) {
        lastAvailableOne.innerText = "Last available:";
        const documentPromise: Promise<Document> = getResponseDocument(levelTwoHref);
        documentPromise.then(mangaDocument => {
            const chapters: HTMLDivElement[] = [];
            const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll("." + EPH_NUM) as NodeListOf<HTMLDivElement>;
            chapters.splice(0, 0, ...Array.from(nodeChapters));
            updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableTwo);
        })
    }
}

function createTagWithClassName(tagName: string, className: string): HTMLElement {
    const createdElement: HTMLElement = document.createElement(tagName);
    createdElement.className = className;

    return createdElement;
}

function createTagWithId(tagName: string, id: string): HTMLElement {
    const createdElement: HTMLElement = document.createElement(tagName);
    createdElement.id = id;

    return createdElement;
}

function appendThumbnail(thumbnail: HTMLImageElement, container: HTMLDivElement) {
    const levelTwoHref = thumbnail.getAttribute(DATA_HREF);
    const thumbnailContainer: HTMLDivElement = createTagWithClassName("div", THUMBNAIL_CONTAINER) as HTMLDivElement;
    thumbnailContainer.appendChild(thumbnail);
    container.append(thumbnailContainer);
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) { // TODO: add last watched information
        const duration: HTMLDivElement = createTagWithClassName("div", "duration") as HTMLDivElement;
        duration.innerText = thumbnail.getAttribute(DATA_DURATION);
        thumbnailContainer.appendChild(duration);
    } else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        const latestContainer: HTMLDivElement = createTagWithClassName("div", "latest-container") as HTMLDivElement;
        const lastRead: HTMLDivElement = createTagWithClassName("div", "last-read-element") as HTMLDivElement;
        const lastAvailable: HTMLDivElement = createTagWithClassName("div", "last-available-element") as HTMLDivElement;
        const lastReadOne: HTMLDivElement = createTagWithId("div", LAST_READ_1 + levelTwoHref) as HTMLDivElement;
        lastReadOne.innerText = LOADING___;
        const lastReadTwo: HTMLDivElement = createTagWithId("div", LAST_READ_2 + levelTwoHref) as HTMLDivElement;
        lastReadTwo.innerText = LOADING___;
        const lastAvailableOne: HTMLDivElement = document.createElement("div");
        const lastAvailableTwo: HTMLDivElement = createTagWithId("div", LAST_AVAILABLE_2 + levelTwoHref) as HTMLDivElement;
        lastAvailableTwo.innerText = LOADING___;

        updateThumbnailInformation(lastAvailableOne, levelTwoHref, lastReadOne, lastReadTwo, lastAvailableTwo);

        lastRead.appendChild(lastReadOne);
        lastRead.appendChild(lastReadTwo);
        lastAvailable.appendChild(lastAvailableOne);
        lastAvailable.appendChild(lastAvailableTwo);
        latestContainer.appendChild(lastRead);
        latestContainer.appendChild(lastAvailable);
        thumbnailContainer.appendChild(latestContainer);
    }
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
        appendThumbnail(thumbnail, container);
    } else if (index === thumbnails.length && container.id === L1_CONTAINER_ID) { // load new pages using the Intersection API - functional programming
        observeTargets();
    }
}

function observeLastImage(images: HTMLImageElement[], className: string): void {
    // start loading the thumbnails
    const image: HTMLImageElement = images.pop();
    image.className = className;
    images.push(image);
}

function createBackButton(container: HTMLDivElement, functionName: string, className: string): void {
    const backButton: HTMLDivElement = createTagWithClassName("div", className) as HTMLDivElement;
    backButton.setAttribute(ONCLICK, functionName + "(this)");
    container.appendChild(backButton);
}

function getTimeAgo(unixTime: string): string {
    const now: number = Date.now();
    const before: number = parseInt(unixTime);
    let difference: number = (now - before) / 1000; // unix time is in milliseconds
    let timeAgo: string = Math.floor(difference) + " seconds ago";
    const secondsPerMinute: number = 60;
    const minutesPerHour: number = 60;
    const hoursPerWeek: number = 24;
    const daysPerWeek: number = 7;
    const weeksPerMonth: number = 4;
    const monthsPerYear: number = 12;
    timeAgo = getTime(timeAgo, difference, secondsPerMinute, " minute ago", " minutes ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour, " hour ago", " hours ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek, " day ago", " days ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek, " week ago", " weeks ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth, " month ago", " months ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth * monthsPerYear, " year ago", " years ago");
    return timeAgo;
}

function getTime(timeAgo: string, difference: number, factor: number, singular: string, plural: string): string {
    let returnedTimeAgo: string = timeAgo;
    if (difference > factor) {
        const time: number = Math.floor(difference / factor);
        if (time === 1) {
            returnedTimeAgo = time + singular;
        } else {
            returnedTimeAgo = Math.floor(difference / factor) + plural;
        }
    }
    return returnedTimeAgo;
}
