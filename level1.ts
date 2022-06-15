// settings
const LOOK_AHEAD = "1000%"; // look ahead 10 screens

// logic
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_HREF = "data-href";
const DATA_DURATION = "data-duration";
const DATA_NEXT_HREF = "data-next-href";
const ORIGINAL_HREF: string = location.href;

let currentChapterHref: string;

// string names
const L1_CONTAINER_ID: string = "level-one-container";
const L2_CONTAINER_ID: string = "level-two-container";
const L3_CONTAINER_ID: string = "level-three-container";
const THUMBNAIL_CONTAINER: string = "thumbnail-container";
const OBSERVE_THUMBNAIL = "observe-thumbnail";
const OBSERVE_IMAGE = "observe-image";
const EPH_NUM = "eph-num";
const THUMBS = "thumbs";
const LAST_READ_1 = "last-read-one";
const LAST_READ_2 = "last-read-two";
const LAST_AVAILABLE_1 = "last-available-one";
const LAST_AVAILABLE_2 = "last-available-two";
const EMPTY_STRING = "";
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

async function createLevelOne(): Promise<void> {
    // TODO: send spaced requests to load information about total and read chapters
    const searchResultsDocument = await getResponseDocument(ORIGINAL_HREF);
    setNextSearchResultsHref(searchResultsDocument); // we'll use this information in an observer
    const levelOneThumbnailContainers: HTMLDivElement[] = createLevelOneThumbnailContainers(searchResultsDocument);
    await loadThumbnailContainer(levelOneThumbnailContainers, document.getElementById(L1_CONTAINER_ID) as HTMLDivElement);
}

function setNextSearchResultsHref(currentDocument: Document): void {
    let nextSearchResultsHref = null;
    let anchor: HTMLAnchorElement = null;
    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        anchor = currentDocument.querySelector(".prevnext") as HTMLAnchorElement;
    } else if (ORIGINAL_HREF.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next") as HTMLAnchorElement;
    } else if (ORIGINAL_HREF.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next") as HTMLAnchorElement;
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r") as HTMLAnchorElement;
    }
    if (anchor !== null) {
        nextSearchResultsHref = anchor.href;
    }

    const levelOneContainer: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;
    if (nextSearchResultsHref === null) {
        levelOneContainer.removeAttribute(DATA_NEXT_HREF);
    } else {
        levelOneContainer.setAttribute(DATA_NEXT_HREF, nextSearchResultsHref);
    }
}

function getSearchResultsThumbnails(responseDocument: Document): HTMLElement[] {
    const thumbnailCollection: HTMLElement[] = [];
    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".thumb-popu") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    } else if (ORIGINAL_HREF.includes(KISSJAV)) {
        const selectedElements: HTMLCollectionOf<HTMLLIElement> = responseDocument.querySelector(".videos").children as HTMLCollectionOf<HTMLLIElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    } else if (ORIGINAL_HREF.includes(NHENTAI)) {
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = responseDocument.querySelector(".index-container").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".imgu") as NodeListOf<HTMLAnchorElement>;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    }

    return thumbnailCollection;
}

function createThumbnailContainer(levelOneThumbnail: HTMLImageElement, levelTwoAnchor: HTMLAnchorElement): HTMLDivElement {
    const thumbnailContainer: HTMLDivElement = createTagWithClassName("div", THUMBNAIL_CONTAINER) as HTMLDivElement;
    thumbnailContainer.id = levelTwoAnchor.href;

    const thumbnail: HTMLImageElement = new Image();
    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) { // TODO: add last watched information
        const duration: HTMLDivElement = createTagWithClassName("div", "duration") as HTMLDivElement;
        duration.innerText = levelOneThumbnail.getAttribute(DATA_DURATION);
        thumbnailContainer.appendChild(duration);
    } else if (ORIGINAL_HREF.includes(NHENTAI) || ORIGINAL_HREF.includes(ASURASCANS)) {
        const latestContainer: HTMLDivElement = createTagWithClassName("div", "latest-container") as HTMLDivElement;
        const lastRead: HTMLDivElement = createTagWithClassName("div", "last-read-element") as HTMLDivElement;
        const lastAvailable: HTMLDivElement = createTagWithClassName("div", "last-available-element") as HTMLDivElement;
        const lastReadOne: HTMLDivElement = createTagWithId("div", LAST_READ_1 + levelTwoAnchor.href) as HTMLDivElement;
        lastReadOne.innerText = LOADING___;
        const lastReadTwo: HTMLDivElement = createTagWithId("div", LAST_READ_2 + levelTwoAnchor.href) as HTMLDivElement;
        lastReadTwo.innerText = LOADING___;
        const lastAvailableOne: HTMLDivElement = createTagWithId("div", LAST_AVAILABLE_1 + levelTwoAnchor.href) as HTMLDivElement;
        lastAvailableOne.innerText = LOADING___;
        const lastAvailableTwo: HTMLDivElement = createTagWithId("div", LAST_AVAILABLE_2 + levelTwoAnchor.href) as HTMLDivElement;
        lastAvailableTwo.innerText = LOADING___;

        lastRead.appendChild(lastReadOne);
        lastRead.appendChild(lastReadTwo);
        lastAvailable.appendChild(lastAvailableOne);
        lastAvailable.appendChild(lastAvailableTwo);
        latestContainer.appendChild(lastRead);
        latestContainer.appendChild(lastAvailable);
        thumbnailContainer.appendChild(latestContainer);
    }

    thumbnail.setAttribute(DATA_SRC, levelOneThumbnail.src);
    thumbnailContainer.appendChild(thumbnail);

    return thumbnailContainer;
}

function pushThumbnailContainer(searchResultsThumbnail: HTMLElement, levelOneThumbnailContainers: HTMLDivElement[]) {
    let shouldPushThumbnail: boolean = true;
    let levelTwoAnchor: HTMLAnchorElement;
    let levelOneThumbnail: HTMLImageElement;

    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        levelTwoAnchor = searchResultsThumbnail as HTMLAnchorElement;
        const thumbOverlayChildren: HTMLCollectionOf<HTMLElement> = levelTwoAnchor.children[0].children as HTMLCollectionOf<HTMLElement>;
        levelOneThumbnail = thumbOverlayChildren[0] as HTMLImageElement;
        const duration: HTMLDivElement = thumbOverlayChildren[thumbOverlayChildren.length - 1] as HTMLImageElement;
        levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerText.trim());
    } else if (ORIGINAL_HREF.includes(KISSJAV)) {
        const cardImageChildren: HTMLCollectionOf<HTMLElement> = searchResultsThumbnail.children[0].children[0].children as HTMLCollectionOf<HTMLElement>;
        levelTwoAnchor = cardImageChildren[0].children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoAnchor?.children[0] as HTMLImageElement;
        if (levelOneThumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        } else if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
            const duration: HTMLDivElement = cardImageChildren[1] as HTMLDivElement;
            const parts = duration.innerText.split("HD");
            levelOneThumbnail.setAttribute(DATA_DURATION, parts[parts.length - 1].trim());
        }
    } else if (ORIGINAL_HREF.includes(NHENTAI)) {
        levelTwoAnchor = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoAnchor.children[0] as HTMLImageElement;
        if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
        }
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        levelTwoAnchor = searchResultsThumbnail.children[0] as HTMLAnchorElement;
        levelOneThumbnail = levelTwoAnchor.children[0] as HTMLImageElement;
        if (levelOneThumbnail.getAttribute(DATA_CFSRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_CFSRC);
        }
    }

    if (shouldPushThumbnail) {
        const thumbnailContainer = createThumbnailContainer(levelOneThumbnail, levelTwoAnchor);
        levelOneThumbnailContainers.push(thumbnailContainer);
    }
}

function createLevelOneThumbnailContainers(searchResultsDocument: Document): HTMLDivElement[] {
    const levelOneThumbnailContainers: HTMLDivElement[] = [];
    const searchResultsThumbnails: HTMLElement[] = getSearchResultsThumbnails(searchResultsDocument);
    for (const searchResultsThumbnail of searchResultsThumbnails) {
        pushThumbnailContainer(searchResultsThumbnail, levelOneThumbnailContainers);
    }

    return levelOneThumbnailContainers;
}

function observeLevelOneThumbnails() {
    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
                const levelOneContainer: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;
                const href: string = levelOneContainer.getAttribute(DATA_NEXT_HREF);
                if (href !== null) {
                    const searchResultsDocument: Document = await getResponseDocument(href);
                    setNextSearchResultsHref(searchResultsDocument);
                    const levelOneThumbnailContainers: HTMLDivElement[] = createLevelOneThumbnailContainers(searchResultsDocument);
                    await loadThumbnailContainer(levelOneThumbnailContainers, levelOneContainer);
                }
            }
        })
    }
    const options: {} = {
        root: null,
        rootMargin: LOOK_AHEAD
    }
    const observer: IntersectionObserver = new IntersectionObserver(callback, options);
    const target: HTMLImageElement = document.querySelector("." + OBSERVE_THUMBNAIL) as HTMLImageElement;
    observer.observe(target);
}

async function loadThumbnailContainer(thumbnailContainers: HTMLDivElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
    const thumbnailContainersLength = thumbnailContainers.length;
    if (index < thumbnailContainersLength) {
        const thumbnailContainer = thumbnailContainers[index];
        const thumbnail: HTMLImageElement = thumbnailContainer.querySelector("img");
        thumbnail.src = thumbnail.getAttribute(DATA_SRC);
        thumbnail.onload = async () => {
            await loadThumbnailContainer(thumbnailContainers, container, ++index);
        }
        thumbnail.onerror = async () => {
            await onImageLoadError(thumbnail);
        }
        if (index === thumbnailContainersLength - 1) {
            thumbnail.className = OBSERVE_THUMBNAIL;
        }
        container.appendChild(thumbnailContainer);
    } else if (index === thumbnailContainersLength && container.id === L1_CONTAINER_ID) { // load new pages using the Intersection API - functional programming
        observeLevelOneThumbnails();

        for (const levelOneThumbnailContainer of thumbnailContainers) {
            await updateThumbnailInformation(levelOneThumbnailContainer);
        }
    }
}

async function updateThumbnailInformation(levelOneThumbnailContainer: HTMLDivElement): Promise<void> {
    const levelTwoHref: string = levelOneThumbnailContainer.id;
    const mangaDocument: Document = await getResponseDocument(levelTwoHref);
    const lastReadOne: HTMLDivElement = document.getElementById(LAST_READ_1 + levelTwoHref) as HTMLDivElement;
    const lastReadTwo: HTMLDivElement = document.getElementById(LAST_READ_2 + levelTwoHref) as HTMLDivElement;
    const lastAvailableOne: HTMLDivElement = document.getElementById(LAST_AVAILABLE_1 + levelTwoHref) as HTMLDivElement;
    const lastAvailableTwo: HTMLDivElement = document.getElementById(LAST_AVAILABLE_2 + levelTwoHref) as HTMLDivElement;

    if (ORIGINAL_HREF.includes(NHENTAI)) {
        const galleryThumbnailsList: HTMLDivElement[] = [];
        const galleryThumbnailCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector("." + THUMBS).children as HTMLCollectionOf<HTMLDivElement>;
        galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        updateLevelOneHManga(galleryThumbnailsList, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const chapters: HTMLDivElement[] = [];
        const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll("." + EPH_NUM) as NodeListOf<HTMLDivElement>;
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }
}

async function getResponseDocument(href: string, retry: boolean = true): Promise<Document> {
    if (href === null) {
        alert("href is null, check the code");
        return null;
    }
    const response: Response = await getResponse(href, retry);
    let returnedDocument: Document = null;
    if (response !== null) {
        const text: string = await response.text();
        returnedDocument = new DOMParser().parseFromString(text, "text/html");
    }

    return returnedDocument;
}

function randomNumber(start: number, end: number): number {
    return Math.floor(start + Math.random() * (end - start));
}

async function getResponse(href: string, retry: boolean, failedHref: { href: string, waitTime: number } = {
    href: EMPTY_STRING,
    waitTime: 1000
}): Promise<Response> {
    const response: Response = await fetch(href);
    let returnedResponse: Response = null;
    const statusOk: number = 200;
    if (response.status === statusOk) { // the base case, the response was successful
        returnedResponse = response;
    } else if (retry) {
        failedHref["waitTime"] += randomNumber(0, 1000); // the base wait time is between one and two seconds
        if (failedHref["href"] === href) { // the request has previously failed
            failedHref["waitTime"] *= randomNumber(2, 3); // double the wait time (on average) for each failed attempt
        }
        failedHref["href"] = href; // save the failed request
        await waitFor(failedHref["waitTime"]);
        returnedResponse = await getResponse(href, true, failedHref);
    }

    return returnedResponse;
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function onImageLoadError(image: HTMLImageElement): Promise<void> {
    // reload the image in 5 seconds
    await waitFor(randomNumber(5000, 10000));
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

function updateLevelOneHManga(galleryThumbnailList: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
    lastAvailableOne.innerText = hyphenateChapterName("Last gallery page:");
    lastAvailableTwo.innerText = hyphenateChapterName("Page " + galleryThumbnailList.length);

    // TODO: first save the information, then get back to this
    const readGalleryThumbnails: { galleryThumbnailHref: string, lastRead: number }[] = [];
    for (const galleryThumbnailElement of galleryThumbnailList) {
        const levelThreeHref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelTwoThumbnail: HTMLImageElement = levelThreeHref.children[0] as HTMLImageElement;
    }
}

function updateLevelOneNhManga(chapters: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
    lastAvailableOne.innerText = hyphenateChapterName("Last available:");

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
            lastAvailableTwo.innerText = hyphenateChapterName(chapterName);
        }
    }

    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadChapter: { chapterName: string, lastRead: number } = readChapters.reduce(getLastReadChapter);
        lastReadOne.innerText = hyphenateChapterName("Read: " + getTimeAgo(lastReadChapter.lastRead + ""));
        lastReadTwo.innerText = hyphenateChapterName(lastReadChapter.chapterName);
    } else {
        lastReadOne.innerText = hyphenateChapterName("Never read before");
        lastReadTwo.innerText = hyphenateChapterName("New");
    }
}

function hyphenateChapterName(chapterName: string): string {
    let hyphenatedChapterName: string = "";
    const maxWordLength = 9;
    for (const word of chapterName.split(" ")) {
        if (word.length > maxWordLength) {
            hyphenatedChapterName += word.substring(0, maxWordLength) + "- " + word.substring(maxWordLength) + " ";
        } else {
            hyphenatedChapterName += word + " ";
        }
    }

    return hyphenatedChapterName;
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
