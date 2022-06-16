const LOOK_AHEAD: string = "1000%"; // look ahead 10 screens

const ORIGINAL_HREF: string = location.href;
const DATA_SRC: string = "data-src";
const DATA_CFSRC: string = "data-cfsrc";
const DATA_LEVEL_TWO_HREF: string = "data-level-two-href";
const DATA_LEVEL_THREE_HREF: string = "data-level-three-href";
const DATA_DURATION: string = "data-duration";
const DATA_NEXT_HREF: string = "data-next-href";
const L1_CONTAINER_ID: string = "level-one-container";
const LEVEL_ONE_THUMBNAIL_CONTAINER: string = "level-one-thumbnail-container";
const OBSERVE_THUMBNAIL: string = "observe-thumbnail";
const EPH_NUM: string = "eph-num";
const THUMBS: string = "thumbs";
const LAST_WATCHED_1: string = "last-watched-one";
const LAST_WATCHED_2: string = "last-watched-two";
const LAST_AVAILABLE_1: string = "last-available-one";
const LAST_AVAILABLE_2: string = "last-available-two";
const EMPTY_STRING: string = "";
const SPACE: string = " ";
const HYPHEN: string = "-";
const PERIOD: string = ".";
const CLASS: string = "class";
const FLEX: string = "flex";
const NONE: string = "none";
const LOADING___: string = "Loading...";
const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";
const ASURASCANS: string = "asurascans";

async function createLevelOne(): Promise<void> {
    const searchResultsDocument = await getResponseDocument(ORIGINAL_HREF);
    setNextSearchResultsHref(searchResultsDocument); // we'll use this information in an observer
    const levelOneThumbnailContainers: HTMLDivElement[] = createLevelOneThumbnailContainers(searchResultsDocument);
    await loadThumbnailContainer(levelOneThumbnailContainers, document.getElementById(L1_CONTAINER_ID) as HTMLDivElement);
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

function randomNumber(start: number, end: number): number {
    return Math.floor(start + Math.random() * (end - start));
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
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


function createLevelOneThumbnailContainers(searchResultsDocument: Document): HTMLDivElement[] {
    const levelOneThumbnailContainers: HTMLDivElement[] = [];
    const searchResultsThumbnails: HTMLElement[] = getSearchResultsThumbnails(searchResultsDocument);
    for (const searchResultsThumbnail of searchResultsThumbnails) {
        pushThumbnailContainer(searchResultsThumbnail, levelOneThumbnailContainers);
    }

    return levelOneThumbnailContainers;
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

function createThumbnailContainer(levelOneThumbnail: HTMLImageElement, levelTwoAnchor: HTMLAnchorElement): HTMLDivElement {
    const thumbnailContainer: HTMLDivElement = createTagWithClassName("div", LEVEL_ONE_THUMBNAIL_CONTAINER) as HTMLDivElement;
    thumbnailContainer.setAttribute(DATA_LEVEL_TWO_HREF, levelTwoAnchor.href);

    const thumbnail: HTMLImageElement = new Image();
    const latestContainer: HTMLDivElement = createTagWithClassName("div", "latest-container") as HTMLDivElement;
    const lastWatched: HTMLDivElement = createTagWithClassName("div", "last-watched-element") as HTMLDivElement;
    const lastAvailable: HTMLDivElement = createTagWithClassName("div", "last-available-element") as HTMLDivElement;
    const lastWatchedOne: HTMLDivElement = createTagWithId("div", LAST_WATCHED_1 + levelTwoAnchor.href) as HTMLDivElement;
    lastWatchedOne.innerText = LOADING___;
    const lastWatchedTwo: HTMLDivElement = createTagWithId("div", LAST_WATCHED_2 + levelTwoAnchor.href) as HTMLDivElement;
    lastWatchedTwo.innerText = LOADING___;
    const lastAvailableOne: HTMLDivElement = createTagWithId("div", LAST_AVAILABLE_1 + levelTwoAnchor.href) as HTMLDivElement;
    lastAvailableOne.innerText = LOADING___;
    const lastAvailableTwo: HTMLDivElement = createTagWithId("div", LAST_AVAILABLE_2 + levelTwoAnchor.href) as HTMLDivElement;
    lastAvailableTwo.innerText = LOADING___;

    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        lastAvailableTwo.setAttribute(DATA_DURATION, levelOneThumbnail.getAttribute(DATA_DURATION));
    }

    lastWatched.appendChild(lastWatchedOne);
    lastWatched.appendChild(lastWatchedTwo);
    lastAvailable.appendChild(lastAvailableOne);
    lastAvailable.appendChild(lastAvailableTwo);
    latestContainer.appendChild(lastWatched);
    latestContainer.appendChild(lastAvailable);
    thumbnailContainer.appendChild(latestContainer);

    thumbnail.setAttribute(DATA_SRC, levelOneThumbnail.src);
    thumbnailContainer.appendChild(thumbnail);
    thumbnailContainer.onclick = async () => {
        await loadLevelTwo(thumbnailContainer, window.scrollY);
    }

    return thumbnailContainer;
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
        if (index === thumbnailContainersLength - 1 && container.id === L1_CONTAINER_ID) {
            thumbnail.className = OBSERVE_THUMBNAIL;
        }
        container.appendChild(thumbnailContainer);
    } else if (index === thumbnailContainersLength) {
        if (container.id === L1_CONTAINER_ID) {
            observeThumbnail(container);
            for (const levelOneThumbnailContainer of thumbnailContainers) {
                await updateLevelOneThumbnailContainer(levelOneThumbnailContainer);
            }
        }
    }
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

function observeThumbnail(levelOneContainer: HTMLDivElement) {
    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
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
    const target: HTMLImageElement = document.querySelector(PERIOD + OBSERVE_THUMBNAIL) as HTMLImageElement;
    observer.observe(target);
}

async function updateLevelOneThumbnailContainer(levelOneThumbnailContainer: HTMLDivElement): Promise<void> {
    const levelTwoHref: string = levelOneThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const lastWatchedOne: HTMLDivElement = document.getElementById(LAST_WATCHED_1 + levelTwoHref) as HTMLDivElement;
    const lastWatchedTwo: HTMLDivElement = document.getElementById(LAST_WATCHED_2 + levelTwoHref) as HTMLDivElement;
    const lastAvailableOne: HTMLDivElement = document.getElementById(LAST_AVAILABLE_1 + levelTwoHref) as HTMLDivElement;
    const lastAvailableTwo: HTMLDivElement = document.getElementById(LAST_AVAILABLE_2 + levelTwoHref) as HTMLDivElement;

    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        updateLevelOneVideo(levelTwoHref, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo);
    } else if (ORIGINAL_HREF.includes(NHENTAI)) {
        const thumbnails: HTMLDivElement[] = [];
        const hMangaDocument: Document = await getResponseDocument(levelTwoHref);
        const galleryThumbnailCollection: HTMLCollectionOf<HTMLDivElement> = hMangaDocument.querySelector(PERIOD + THUMBS).children as HTMLCollectionOf<HTMLDivElement>;
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        updateLevelOneHManga(thumbnails, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo);
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const chapters: HTMLDivElement[] = [];
        const nhMangaDocument: Document = await getResponseDocument(levelTwoHref);
        const nodeChapters: NodeListOf<HTMLDivElement> = nhMangaDocument.querySelectorAll(PERIOD + EPH_NUM) as NodeListOf<HTMLDivElement>;
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        updateLevelOneNhManga(chapters, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo);
    }
}

function updateLevelOneVideo(levelTwoHref: string, lastWatchedOne: HTMLDivElement, lastWatchedTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
    lastAvailableOne.innerText = "Duration:";
    lastAvailableTwo.innerText = lastAvailableTwo.getAttribute(DATA_DURATION);
    lastWatchedOne.innerText = "Never watched before";
    lastWatchedTwo.innerText = "New";

    try {
        const video: { lastWatched: number, currentTime: number } = JSON.parse(localStorage.getItem(levelTwoHref));
        lastWatchedOne.innerText = "Watched: " + getTimeAgo(video.lastWatched + "");
        lastWatchedTwo.innerText = getCurrentTime(video.currentTime);
    } catch (ignored) {
    }
}

function getCurrentTime(time: number): string {
    let currentTime: string;
    const secondsPerMinute: number = 60;
    const minutesPerHour: number = 60;
    if (time < 10) {
        currentTime = "00:0" + parseInt(time + "");
    } else if (time < secondsPerMinute) {
        currentTime = "00:" + parseInt(time + "");
    } else if (time < ((secondsPerMinute * minutesPerHour) / 10)) { // less than 10 minutes
        const minutes: number = parseInt((time / secondsPerMinute) + "");
        const seconds: number = parseInt(time % secondsPerMinute + "");
        currentTime = "0" + minutes + ":" + seconds;
    } else if (time < (secondsPerMinute * minutesPerHour)) {
        const minutes: number = parseInt((time / secondsPerMinute) + "");
        const seconds: number = parseInt(time % secondsPerMinute + "");
        currentTime = minutes + ":" + seconds;
    } else {
        const hours: number = parseInt((time / (secondsPerMinute * minutesPerHour)) + "");
        const minutes: number = parseInt((time / secondsPerMinute) + "") % minutesPerHour;
        const seconds: number = parseInt(time % secondsPerMinute + "");
        currentTime = hours + ":" + minutes + ":" + seconds;
    }
    return currentTime;
}

function updateLevelOneHManga(thumbnails: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
    lastAvailableOne.innerText = "Total pages:";
    lastAvailableTwo.innerText = "Page " + thumbnails.length;

    const readThumbnails: { name: string, lastRead: number }[] = [];
    let lastReadFound: boolean = false;
    for (const galleryThumbnailElement of thumbnails) {
        const levelThreeAnchor: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelThreeHref: string = levelThreeAnchor.href;
        const lastRead: string = localStorage.getItem(levelThreeHref);
        if (lastRead !== null) {
            lastReadFound = true;
            const parts: string[] = levelThreeHref.split("/");
            const name: string = parts[parts.length - 2]; // the penultimate part
            const last: number = parseInt(lastRead);
            readThumbnails.push({
                name: name,
                lastRead: last
            })
        }
    }

    let lastReadOneInnerText: string;
    let lastReadTwoInnerText: string;
    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadThumbnail: { name: string, lastRead: number } = readThumbnails.reduce(getLastReadChapter);
        lastReadOneInnerText = "Read: " + getTimeAgo(lastReadThumbnail.lastRead + "");
        lastReadTwoInnerText = "Page " + lastReadThumbnail.name;
    } else {
        lastReadOneInnerText = "Never read before";
        lastReadTwoInnerText = "New";
    }
    lastReadOne.innerText = lastReadOneInnerText;
    lastReadTwo.innerText = lastReadTwoInnerText;
}

function updateLevelOneNhManga(chapters: HTMLDivElement[], lastReadOne: HTMLDivElement, lastReadTwo: HTMLDivElement, lastAvailableOne: HTMLDivElement, lastAvailableTwo: HTMLDivElement): void {
    lastAvailableOne.innerText = "Last available:";

    const readChapters: { name: string, lastRead: number }[] = [];
    let lastReadFound: boolean = false;
    for (let i = 0; i < chapters.length; i++) {
        const levelThreeAnchor: HTMLAnchorElement = chapters[i].children[0] as HTMLAnchorElement;
        const span: HTMLSpanElement = levelThreeAnchor.children[0] as HTMLSpanElement;
        const chapterName: string = span.innerText;
        const lastRead: string = localStorage.getItem(levelThreeAnchor.href);
        if (lastRead !== null) {
            lastReadFound = true;
            const last: number = parseInt(lastRead);
            readChapters.push({
                name: chapterName,
                lastRead: last
            })
        }
        if (i === 0) {
            lastAvailableTwo.innerText = hyphenateLongWord(chapterName);
        }
    }

    let lastReadOneInnerText: string;
    let lastReadTwoInnerText: string;
    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadChapter: { name: string, lastRead: number } = readChapters.reduce(getLastReadChapter);
        lastReadOneInnerText = "Read: " + getTimeAgo(lastReadChapter.lastRead + "");
        lastReadTwoInnerText = lastReadChapter.name;
    } else {
        lastReadOneInnerText = "Never read before";
        lastReadTwoInnerText = "New";
    }
    lastReadOne.innerText = lastReadOneInnerText;
    lastReadTwo.innerText = hyphenateLongWord(lastReadTwoInnerText);

}

function hyphenateLongWord(chapterName: string): string {
    let hyphenatedChapterName: string = EMPTY_STRING;
    const maxWordLength = 9;
    for (const word of chapterName.split(SPACE)) {
        if (word.length > maxWordLength + 1) {
            hyphenatedChapterName += word.substring(0, maxWordLength) + HYPHEN + SPACE + word.substring(maxWordLength) + SPACE;
        } else {
            hyphenatedChapterName += word + SPACE;
        }
    }

    return hyphenatedChapterName;
}

function getLastReadChapter(previous: { name: string, lastRead: number }, current: { name: string, lastRead: number }): { name: string, lastRead: number } {
    let returnedChapter: { name: string, lastRead: number };
    if (previous.lastRead > current.lastRead) {
        returnedChapter = previous;
    } else {
        returnedChapter = current;
    }

    return returnedChapter;
}

function getTimeAgo(unixTime: string): string {
    const now: number = Date.now();
    const before: number = parseInt(unixTime);
    const difference: number = (now - before) / 1000; // unix time is in milliseconds

    const secondsPerSeconds: number = 1;
    const secondsPerMinute: number = 60;
    const minutesPerHour: number = 60;
    const hoursPerWeek: number = 24;
    const daysPerWeek: number = 7;
    const weeksPerMonth: number = 4;
    const monthsPerYear: number = 12;

    let timeAgo: string = null;
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerSeconds, " second ago", " seconds ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute, " minute ago", " minutes ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour, " hour ago", " hours ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek, " day ago", " days ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek, " week ago", " weeks ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth, " month ago", " months ago");
    timeAgo = modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth * monthsPerYear, " year ago", " years ago");
    return timeAgo;
}

function modifyTimeAgo(timeAgo: string, difference: number, factor: number, singular: string, plural: string): string {
    let returnedTimeAgo: string = timeAgo;
    if (difference > factor || factor === 1) {
        const time: number = Math.floor(difference / factor);
        if (time === 1) {
            returnedTimeAgo = time + singular;
        } else {
            returnedTimeAgo = Math.floor(difference / factor) + plural;
        }
    }
    return returnedTimeAgo;
}
