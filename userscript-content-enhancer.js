// ==UserScript==
// @name         Content Enhancer
// @namespace    visardomi4@gmail.com
// @version      0.1
// @description  Enhance the content
// @author       Visar Domi
// @match        https://www.asurascans.com/*
// @match        https://nhentai.net/*
// @match        https://www.tokyomotion.net/*
// @match        https://kissjav.li/*
// @grant        none
// ==/UserScript==

const CSS = `/* level 1 */
body {
    margin: 0;
    background-color: black;
}

img, video {
    display: block;
    width: 100%;
}

video {
    margin: 100px 0;
}

.loading {
    background-color: hsl(30, 75%, 50%);
}

.loaded {
    background-color: hsl(120, 75%, 50%);
}

.loading > img, .loaded > img {
    opacity: 0.5;
}

.duration {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    font-family: sans-serif;
    color: white;
    z-index: 1;
    padding: 5px;
    bottom: 0;
}

.level-one-thumbnail-container {
    position: relative;
}

.latest-container {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: end;
    width: 100%;
    font-family: sans-serif;
    color: white;
}

.last-read-element, .last-available-element {
    background-color: rgba(0, 0, 0, 0.5);
    width: 50%;
}

.last-read-element > div:nth-child(2), .last-available-element > div:nth-child(2) {
    font-size: 2rem;
}

/* level 2 */
.go-back-video {
    width: 100%;
    height: 100vh;
    background-color: hsl(0, 50%, 25%);
}

.refresh {
    margin: 200px 0;
}

.go-back-manga, .go-back {
    width: 100%;
    height: 30vh;
    background-color: hsl(0, 50%, 25%);
}

.refresh, .chapter-button {
    font-size: 1.2rem;
    line-height: 3;
    text-align: center;
    width: 100%;
}

.chapter-container {
    display: flex;
    font-size: 1.2rem;
    font-family: sans-serif;
    color: white;
    align-items: center;
}

.last-read-container {
    width: 100%;
}

.last-read {
    margin-left: 10px;
}

.level-two-thumbnail-container {
    position: relative;
    width: 50%;
}

.last-read-gallery, .gallery-page {
    background-color: rgba(0, 0, 0, 0.5);
}

.last-read-gallery {
    margin-right: auto;
}

.gallery-page {
    margin-left: auto;
    font-size: 2rem;
}

/* level 3 */
.go-back {
    position: fixed;
    left: 0;
    top: 0;
    animation: fadeout 1s linear 0s 1 normal forwards running;
}

@keyframes fadeout {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.clicker {
    background-color: rgba(0, 0, 0, 0.0);
    z-index: 1;
}

.clicker, .info, .info-clicked {
    position: fixed;
    left: 0;
    top: 30%;
    height: 30%;
    width: 100%;
}

.info {
    display: none;
}

.info-clicked {
    display: flex;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
}

.info-content {
    font-size: 1.1rem;
    font-family: sans-serif;
    color: white;
    line-height: 2;
    margin: 20px;
}
`;

const LOOK_AHEAD = "1000%"; // look ahead 10 screens
const ORIGINAL_HREF = location.href;
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_LEVEL_TWO_HREF = "data-level-two-href";
const DATA_LEVEL_THREE_HREF = "data-level-three-href";
const DATA_DURATION = "data-duration";
const DATA_NEXT_HREF = "data-next-href";
const L1_CONTAINER_ID = "level-one-container";
const L2_CONTAINER_ID = "level-two-container";
const LEVEL_ONE_THUMBNAIL_CONTAINER = "level-one-thumbnail-container";
const OBSERVE_THUMBNAIL = "observe-thumbnail";
const EPH_NUM = "eph-num";
const THUMBS = "thumbs";
const LAST_READ_1 = "last-read-one";
const LAST_READ_2 = "last-read-two";
const LAST_AVAILABLE_1 = "last-available-one";
const LAST_AVAILABLE_2 = "last-available-two";
const EMPTY_STRING = "";
const SPACE = " ";
const HYPHEN = "-";
const PERIOD = ".";
const CLASS = "class";
const FLEX = "flex";
const NONE = "none";
const LOADING___ = "Loading...";
const TOKYOMOTION = "tokyomotion";
const KISSJAV = "kissjav";
const NHENTAI = "nhentai";
const ASURASCANS = "asurascans";
async function createLevelOne() {
    // TODO: send spaced requests to load information about total and read chapters
    const searchResultsDocument = await getResponseDocument(ORIGINAL_HREF);
    setNextSearchResultsHref(searchResultsDocument); // we'll use this information in an observer
    const levelOneThumbnailContainers = createLevelOneThumbnailContainers(searchResultsDocument);
    await loadThumbnailContainer(levelOneThumbnailContainers, document.getElementById(L1_CONTAINER_ID));
}
async function getResponseDocument(href, retry = true) {
    const response = await getResponse(href, retry);
    let returnedDocument = null;
    if (response !== null) {
        const text = await response.text();
        returnedDocument = new DOMParser().parseFromString(text, "text/html");
    }
    return returnedDocument;
}
async function getResponse(href, retry, failedHref = {
    href: EMPTY_STRING,
    waitTime: 1000
}) {
    const response = await fetch(href);
    let returnedResponse = null;
    const statusOk = 200;
    if (response.status === statusOk) { // the base case, the response was successful
        returnedResponse = response;
    }
    else if (retry) {
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
function randomNumber(start, end) {
    return Math.floor(start + Math.random() * (end - start));
}
async function waitFor(milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}
function setNextSearchResultsHref(currentDocument) {
    let nextSearchResultsHref = null;
    let anchor = null;
    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        anchor = currentDocument.querySelector(".prevnext");
    }
    else if (ORIGINAL_HREF.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next");
    }
    else if (ORIGINAL_HREF.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next");
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r");
    }
    if (anchor !== null) {
        nextSearchResultsHref = anchor.href;
    }
    const levelOneContainer = document.getElementById(L1_CONTAINER_ID);
    if (nextSearchResultsHref === null) {
        levelOneContainer.removeAttribute(DATA_NEXT_HREF);
    }
    else {
        levelOneContainer.setAttribute(DATA_NEXT_HREF, nextSearchResultsHref);
    }
}
function createLevelOneThumbnailContainers(searchResultsDocument) {
    const levelOneThumbnailContainers = [];
    const searchResultsThumbnails = getSearchResultsThumbnails(searchResultsDocument);
    for (const searchResultsThumbnail of searchResultsThumbnails) {
        pushThumbnailContainer(searchResultsThumbnail, levelOneThumbnailContainers);
    }
    return levelOneThumbnailContainers;
}
function getSearchResultsThumbnails(responseDocument) {
    const thumbnailCollection = [];
    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        const selectedElements = responseDocument.querySelectorAll(".thumb-popu");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (ORIGINAL_HREF.includes(KISSJAV)) {
        const selectedElements = responseDocument.querySelector(".videos").children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (ORIGINAL_HREF.includes(NHENTAI)) {
        const selectedElements = responseDocument.querySelector(".index-container").children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const selectedElements = responseDocument.querySelectorAll(".imgu");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
    }
    return thumbnailCollection;
}
function pushThumbnailContainer(searchResultsThumbnail, levelOneThumbnailContainers) {
    let shouldPushThumbnail = true;
    let levelTwoAnchor;
    let levelOneThumbnail;
    if (ORIGINAL_HREF.includes(TOKYOMOTION)) {
        levelTwoAnchor = searchResultsThumbnail;
        const thumbOverlayChildren = levelTwoAnchor.children[0].children;
        levelOneThumbnail = thumbOverlayChildren[0];
        const duration = thumbOverlayChildren[thumbOverlayChildren.length - 1];
        levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerText.trim());
    }
    else if (ORIGINAL_HREF.includes(KISSJAV)) {
        const cardImageChildren = searchResultsThumbnail.children[0].children[0].children;
        levelTwoAnchor = cardImageChildren[0].children[0];
        levelOneThumbnail = levelTwoAnchor?.children[0];
        if (levelOneThumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        }
        else if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
            const duration = cardImageChildren[1];
            const parts = duration.innerText.split("HD");
            levelOneThumbnail.setAttribute(DATA_DURATION, parts[parts.length - 1].trim());
        }
    }
    else if (ORIGINAL_HREF.includes(NHENTAI)) {
        levelTwoAnchor = searchResultsThumbnail.children[0];
        levelOneThumbnail = levelTwoAnchor.children[0];
        if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
        }
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        levelTwoAnchor = searchResultsThumbnail.children[0];
        levelOneThumbnail = levelTwoAnchor.children[0];
        if (levelOneThumbnail.getAttribute(DATA_CFSRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_CFSRC);
        }
    }
    if (shouldPushThumbnail) {
        const thumbnailContainer = createThumbnailContainer(levelOneThumbnail, levelTwoAnchor);
        levelOneThumbnailContainers.push(thumbnailContainer);
    }
}
function createThumbnailContainer(levelOneThumbnail, levelTwoAnchor) {
    const thumbnailContainer = createTagWithClassName("div", LEVEL_ONE_THUMBNAIL_CONTAINER);
    thumbnailContainer.setAttribute(DATA_LEVEL_TWO_HREF, levelTwoAnchor.href);
    const thumbnail = new Image();
    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) { // TODO: add last watched information
        const duration = createTagWithClassName("div", "duration");
        duration.innerText = levelOneThumbnail.getAttribute(DATA_DURATION);
        thumbnailContainer.appendChild(duration);
    }
    else if (ORIGINAL_HREF.includes(NHENTAI) || ORIGINAL_HREF.includes(ASURASCANS)) {
        const latestContainer = createTagWithClassName("div", "latest-container");
        const lastRead = createTagWithClassName("div", "last-read-element");
        const lastAvailable = createTagWithClassName("div", "last-available-element");
        const lastReadOne = createTagWithId("div", LAST_READ_1 + levelTwoAnchor.href);
        lastReadOne.innerText = LOADING___;
        const lastReadTwo = createTagWithId("div", LAST_READ_2 + levelTwoAnchor.href);
        lastReadTwo.innerText = LOADING___;
        const lastAvailableOne = createTagWithId("div", LAST_AVAILABLE_1 + levelTwoAnchor.href);
        lastAvailableOne.innerText = LOADING___;
        const lastAvailableTwo = createTagWithId("div", LAST_AVAILABLE_2 + levelTwoAnchor.href);
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
    thumbnailContainer.onclick = async () => {
        await loadLevelTwo(thumbnailContainer, window.scrollY);
    };
    return thumbnailContainer;
}
function createTagWithClassName(tagName, className) {
    const createdElement = document.createElement(tagName);
    createdElement.className = className;
    return createdElement;
}
function createTagWithId(tagName, id) {
    const createdElement = document.createElement(tagName);
    createdElement.id = id;
    return createdElement;
}
async function loadThumbnailContainer(thumbnailContainers, container, index = 0) {
    const thumbnailContainersLength = thumbnailContainers.length;
    if (index < thumbnailContainersLength) {
        const thumbnailContainer = thumbnailContainers[index];
        const thumbnail = thumbnailContainer.querySelector("img");
        thumbnail.src = thumbnail.getAttribute(DATA_SRC);
        thumbnail.onload = async () => {
            await loadThumbnailContainer(thumbnailContainers, container, ++index);
        };
        thumbnail.onerror = async () => {
            await onImageLoadError(thumbnail);
        };
        if (index === thumbnailContainersLength - 1 && container.id === L1_CONTAINER_ID) {
            thumbnail.className = OBSERVE_THUMBNAIL;
        }
        container.appendChild(thumbnailContainer);
    }
    else if (index === thumbnailContainersLength) {
        if (container.id === L1_CONTAINER_ID) {
            observeThumbnail(container);
            for (const levelOneThumbnailContainer of thumbnailContainers) {
                await updateLevelOneThumbnailContainer(levelOneThumbnailContainer);
            }
        }
        else if (container.id === L2_CONTAINER_ID) { // TODO: the thumbnails of h manga
            // for (const levelTwoThumbnailContainer of thumbnailContainers) {
            //     await updateLevelTwoThumbnailContainer(levelTwoThumbnailContainer);
            // }
        }
    }
}
async function onImageLoadError(image) {
    // reload the image in 5 seconds
    await waitFor(randomNumber(5000, 10000));
    let imageSrc = image.src;
    const timePart = "?time=";
    const timeIndex = imageSrc.indexOf(timePart);
    const time = timePart + Date.now();
    if (timeIndex === -1) {
        imageSrc += time;
    }
    else {
        imageSrc = imageSrc.substring(0, timeIndex) + time;
    }
    image.src = imageSrc;
}
function observeThumbnail(levelOneContainer) {
    const callback = (entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const entryTarget = entry.target;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
                const href = levelOneContainer.getAttribute(DATA_NEXT_HREF);
                if (href !== null) {
                    const searchResultsDocument = await getResponseDocument(href);
                    setNextSearchResultsHref(searchResultsDocument);
                    const levelOneThumbnailContainers = createLevelOneThumbnailContainers(searchResultsDocument);
                    await loadThumbnailContainer(levelOneThumbnailContainers, levelOneContainer);
                }
            }
        });
    };
    const options = {
        root: null,
        rootMargin: LOOK_AHEAD
    };
    const observer = new IntersectionObserver(callback, options);
    const target = document.querySelector(PERIOD + OBSERVE_THUMBNAIL);
    observer.observe(target);
}
async function updateLevelOneThumbnailContainer(levelOneThumbnailContainer) {
    const levelTwoHref = levelOneThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const mangaDocument = await getResponseDocument(levelTwoHref);
    const lastReadOne = document.getElementById(LAST_READ_1 + levelTwoHref);
    const lastReadTwo = document.getElementById(LAST_READ_2 + levelTwoHref);
    const lastAvailableOne = document.getElementById(LAST_AVAILABLE_1 + levelTwoHref);
    const lastAvailableTwo = document.getElementById(LAST_AVAILABLE_2 + levelTwoHref);
    if (ORIGINAL_HREF.includes(NHENTAI)) {
        const thumbnails = [];
        const galleryThumbnailCollection = mangaDocument.querySelector(PERIOD + THUMBS).children;
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        updateLevelOneHManga(thumbnails, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const chapters = [];
        const nodeChapters = mangaDocument.querySelectorAll(PERIOD + EPH_NUM);
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }
}
function updateLevelOneHManga(thumbnails, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
    lastAvailableOne.innerText = hyphenateLongWord("Last gallery page:");
    lastAvailableTwo.innerText = hyphenateLongWord("Page " + thumbnails.length);
    // TODO: first save the information, then get back to this
    const readThumbnails = [];
    let lastReadFound = false;
    for (const galleryThumbnailElement of thumbnails) {
        const levelThreeAnchor = galleryThumbnailElement.children[0];
        const levelThreeHref = levelThreeAnchor.href;
        const lastRead = localStorage.getItem(levelThreeHref);
        if (lastRead !== null) {
            lastReadFound = true;
            const parts = levelThreeHref.split("/");
            const name = parts[parts.length - 2]; // the penultimate part
            const last = parseInt(lastRead);
            readThumbnails.push({
                name: name,
                lastRead: last
            });
        }
    }
    let lastReadOneInnerText;
    let lastReadTwoInnerText;
    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadThumbnail = readThumbnails.reduce(getLastReadChapter);
        lastReadOneInnerText = "Read: " + getTimeAgo(lastReadThumbnail.lastRead + "");
        lastReadTwoInnerText = "Page " + lastReadThumbnail.name;
    }
    else {
        lastReadOneInnerText = "Never read before";
        lastReadTwoInnerText = "New";
    }
    lastReadOne.innerText = hyphenateLongWord(lastReadOneInnerText);
    lastReadTwo.innerText = hyphenateLongWord(lastReadTwoInnerText);
}
function updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
    lastAvailableOne.innerText = hyphenateLongWord("Last available:");
    const readChapters = [];
    let lastReadFound = false;
    for (let i = 0; i < chapters.length; i++) {
        const levelThreeAnchor = chapters[i].children[0];
        const span = levelThreeAnchor.children[0];
        const chapterName = span.innerText;
        const lastRead = localStorage.getItem(levelThreeAnchor.href);
        if (lastRead !== null) {
            lastReadFound = true;
            const last = parseInt(lastRead);
            readChapters.push({
                name: chapterName,
                lastRead: last
            });
        }
        if (i === 0) {
            lastAvailableTwo.innerText = hyphenateLongWord(chapterName);
        }
    }
    let lastReadOneInnerText;
    let lastReadTwoInnerText;
    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadChapter = readChapters.reduce(getLastReadChapter);
        lastReadOneInnerText = "Read: " + getTimeAgo(lastReadChapter.lastRead + "");
        lastReadTwoInnerText = lastReadChapter.name;
    }
    else {
        lastReadOneInnerText = "Never read before";
        lastReadTwoInnerText = "New";
    }
    lastReadOne.innerText = hyphenateLongWord(lastReadOneInnerText);
    lastReadTwo.innerText = hyphenateLongWord(lastReadTwoInnerText);
}
function hyphenateLongWord(chapterName) {
    let hyphenatedChapterName = EMPTY_STRING;
    const maxWordLength = 9;
    for (const word of chapterName.split(SPACE)) {
        if (word.length > maxWordLength + 1) {
            hyphenatedChapterName += word.substring(0, maxWordLength) + HYPHEN + SPACE + word.substring(maxWordLength) + SPACE;
        }
        else {
            hyphenatedChapterName += word + SPACE;
        }
    }
    return hyphenatedChapterName;
}
function getLastReadChapter(previous, current) {
    let returnedChapter;
    if (previous.lastRead > current.lastRead) {
        returnedChapter = previous;
    }
    else {
        returnedChapter = current;
    }
    return returnedChapter;
}
function getTimeAgo(unixTime) {
    const now = Date.now();
    const before = parseInt(unixTime);
    let difference = (now - before) / 1000; // unix time is in milliseconds
    let timeAgo = Math.ceil(difference) + " seconds ago";
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerWeek = 24;
    const daysPerWeek = 7;
    const weeksPerMonth = 4;
    const monthsPerYear = 12;
    timeAgo = getTime(timeAgo, difference, secondsPerMinute, " minute ago", " minutes ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour, " hour ago", " hours ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek, " day ago", " days ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek, " week ago", " weeks ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth, " month ago", " months ago");
    timeAgo = getTime(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth * monthsPerYear, " year ago", " years ago");
    return timeAgo;
}
function getTime(timeAgo, difference, factor, singular, plural) {
    let returnedTimeAgo = timeAgo;
    if (difference > factor) {
        const time = Math.floor(difference / factor);
        if (time === 1) {
            returnedTimeAgo = time + singular;
        }
        else {
            returnedTimeAgo = Math.floor(difference / factor) + plural;
        }
    }
    return returnedTimeAgo;
}
//# sourceMappingURL=level1.js.map
const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";
const LEVEL_TWO_THUMBNAIL_CONTAINER = "level-two-thumbnail-container";
const BLOCK = "block";
async function loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnailContainer, levelOneScrollPosition);
    }
    else if (ORIGINAL_HREF.includes(NHENTAI) || ORIGINAL_HREF.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnailContainer, levelOneScrollPosition);
    }
}
async function loadVideo(searchResultsThumbnailContainer, levelOneScrollPosition) {
    const levelTwoHref = searchResultsThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const levelOneContainer = document.getElementById(L1_CONTAINER_ID);
    const videoLoaded = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        window.scrollTo({ top: 0 });
        searchResultsThumbnailContainer.removeAttribute(DATA_LOAD_STATUS); // remove the load status
        levelOneContainer.style.display = NONE; // hide level 1
        document.getElementById(levelTwoHref).style.display = BLOCK; // show level 2
    }
    else if (!videoLoading) {
        // after the first click, the video's load status is loading
        searchResultsThumbnailContainer.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnailContainer.className = LEVEL_ONE_THUMBNAIL_CONTAINER + SPACE + LOADING; // TODO: use localstorage to remember watched videos
        // create level 2
        const levelTwoContainer = createTagWithId("div", levelTwoHref);
        levelTwoContainer.style.display = NONE;
        document.querySelector("body").appendChild(levelTwoContainer);
        const levelTwoVideo = createLevelTwoVideo(searchResultsThumbnailContainer);
        const bestSource = await getBestSource(levelTwoHref);
        levelTwoVideo.appendChild(bestSource);
        levelTwoContainer.appendChild(levelTwoVideo);
        // the go back button
        const backButton = createTagWithId("div", "go-to-level-one");
        backButton.className = "go-back-video";
        backButton.onclick = () => {
            levelOneContainer.style.display = BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            searchResultsThumbnailContainer.className = LEVEL_ONE_THUMBNAIL_CONTAINER;
            window.scrollTo({ top: levelOneScrollPosition });
        };
        levelTwoContainer.appendChild(backButton);
        // refresh should be at the end of the page
        const refresh = createTagWithClassName("button", "refresh");
        refresh.type = "button";
        refresh.onclick = () => {
            levelTwoVideo.scrollIntoView();
            levelTwoVideo.load();
        };
        refresh.innerText = "Reload the video";
        levelTwoContainer.appendChild(refresh);
    }
}
function createLevelTwoVideo(searchResultsThumbnailContainer) {
    // the video
    const levelTwoVideo = document.createElement("video");
    levelTwoVideo.controls = true;
    levelTwoVideo.preload = "auto";
    levelTwoVideo.playsInline = true;
    levelTwoVideo.muted = true;
    levelTwoVideo.onloadedmetadata = async () => {
        levelTwoVideo.onloadedmetadata = null;
        // manually autoplay
        await waitFor(100);
        await levelTwoVideo.play();
        await waitFor(100);
        levelTwoVideo.pause();
        // the video is loaded
        searchResultsThumbnailContainer.setAttribute(DATA_LOAD_STATUS, LOADED);
        searchResultsThumbnailContainer.className = LEVEL_ONE_THUMBNAIL_CONTAINER + SPACE + LOADED;
    };
    levelTwoVideo.onerror = async () => {
        await waitFor(randomNumber(5000, 10000));
        levelTwoVideo.load();
    };
    return levelTwoVideo;
}
async function getBestSource(levelTwoHref) {
    // the source
    const levelTwoSource = document.createElement("source");
    const videoDocument = await getResponseDocument(levelTwoHref);
    let video;
    if (levelTwoHref.includes(TOKYOMOTION)) {
        video = videoDocument.getElementById("vjsplayer");
    }
    else if (levelTwoHref.includes(KISSJAV)) {
        video = videoDocument.getElementById("player-fluid");
    }
    const sources = video.querySelectorAll("source");
    // select the best source
    let bestSource = null;
    for (const source of sources) {
        if (ORIGINAL_HREF.includes(TOKYOMOTION) && source.src.includes("/hd/")) {
            bestSource = source.src;
        }
        else if (ORIGINAL_HREF.includes(KISSJAV) && source.src.includes("720p")) {
            bestSource = source.src;
        }
    }
    if (bestSource === null) {
        bestSource = sources[0].src;
    }
    // order matters (first get the source, then append)
    levelTwoSource.src = bestSource;
    return levelTwoSource;
}
async function loadManga(searchResultsThumbnailContainer, levelOneScrollPosition) {
    window.scrollTo({ top: 0 });
    // create level 2
    const levelTwoHref = searchResultsThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const levelTwoContainer = createTagWithId("div", L2_CONTAINER_ID);
    levelTwoContainer.setAttribute(DATA_LEVEL_TWO_HREF, levelTwoHref); // TODO: delete?
    levelTwoContainer.style.display = FLEX;
    document.querySelector("body").appendChild(levelTwoContainer);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    const backButton = createTagWithId("div", "go-to-level-one");
    backButton.className = "go-back-manga";
    backButton.onclick = () => {
        // update level one chapter information
        const levelThreeHref = levelTwoContainer.getAttribute(DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null) {
            const lastRead = document.getElementById(levelThreeHref);
            let lastReadTwoInnerText;
            if (ORIGINAL_HREF.includes(NHENTAI)) {
                const parts = levelThreeHref.split("/");
                lastReadTwoInnerText = "Page " + parts[parts.length - 2]; // the penultimate part
            }
            else if (ORIGINAL_HREF.includes(ASURASCANS)) {
                const chapterButton = lastRead.parentElement.parentElement.getElementsByTagName("button")[0];
                lastReadTwoInnerText = chapterButton.innerText;
            }
            const lastReadOne = document.getElementById(LAST_READ_1 + levelTwoHref);
            lastReadOne.innerText = hyphenateLongWord(getTimeAgo(Date.now() + ""));
            const lastReadTwo = document.getElementById(LAST_READ_2 + levelTwoHref);
            lastReadTwo.innerText = hyphenateLongWord(lastReadTwoInnerText);
            levelTwoContainer.removeAttribute(DATA_LEVEL_THREE_HREF);
        }
        document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
        levelTwoContainer.remove(); // destroy level 2
        window.scrollTo({ top: levelOneScrollPosition });
    };
    levelTwoContainer.appendChild(backButton);
    // get the gallery thumbnails
    const mangaDocument = await getResponseDocument(levelTwoHref);
    if (ORIGINAL_HREF.includes(NHENTAI)) {
        await loadHManga(levelTwoContainer, mangaDocument);
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        loadNhManga(levelTwoContainer, mangaDocument);
    }
}
async function loadHManga(levelTwoContainer, mangaDocument) {
    levelTwoContainer.style.flexDirection = "row";
    levelTwoContainer.style.flexWrap = "wrap";
    const levelTwoThumbnailContainers = [];
    removeExtraDiv();
    const galleryThumbnailsCollection = mangaDocument.querySelector(PERIOD + THUMBS).children;
    const galleryThumbnailsList = [];
    galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailsCollection));
    for (let i = 0; i < galleryThumbnailsList.length; i++) {
        const galleryThumbnailElement = galleryThumbnailsList[i];
        const levelThreeAnchor = galleryThumbnailElement.children[0];
        const levelTwoThumbnail = levelThreeAnchor.children[0];
        const thumbnailContainer = createTagWithClassName("div", LEVEL_TWO_THUMBNAIL_CONTAINER);
        const levelThreeHref = levelThreeAnchor.href;
        thumbnailContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        thumbnailContainer.onclick = async () => {
            await loadLevelThree(thumbnailContainer, window.scrollY);
        };
        const galleryThumbnail = new Image();
        galleryThumbnail.setAttribute(DATA_SRC, levelTwoThumbnail.getAttribute(DATA_SRC));
        thumbnailContainer.append(galleryThumbnail);
        // add the last read information next to the button
        const lastReadContainer = createTagWithClassName("div", "latest-container");
        const lastRead = createTagWithClassName("span", "last-read-gallery");
        appendLastRead(lastRead, levelThreeHref, lastReadContainer);
        const pageNumber = createTagWithClassName("span", "gallery-page");
        pageNumber.innerText = (i + 1) + "";
        lastReadContainer.appendChild(pageNumber);
        thumbnailContainer.appendChild(lastReadContainer);
        levelTwoThumbnailContainers.push(thumbnailContainer);
    }
    await loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
}
function removeExtraDiv() {
    // remove a div that gets added from other scripts:
    const removePotential = document.body.children[1];
    if (removePotential.getAttribute("style").length === 80) {
        removePotential.remove();
    }
}
function appendLastRead(lastRead, levelThreeHref, lastReadContainer) {
    lastRead.id = levelThreeHref;
    const lastReadString = localStorage.getItem(levelThreeHref);
    let lastReadInnerText;
    if (lastReadString === null) {
        lastReadInnerText = "Never read";
    }
    else {
        lastReadInnerText = getTimeAgo(lastReadString);
    }
    lastRead.innerText = hyphenateLongWord(lastReadInnerText);
    lastReadContainer.appendChild(lastRead);
}
function loadNhManga(levelTwoContainer, mangaDocument) {
    levelTwoContainer.style.flexDirection = "column";
    const nodeChapters = mangaDocument.querySelectorAll(PERIOD + EPH_NUM);
    const chapters = [];
    chapters.splice(0, 0, ...Array.from(nodeChapters));
    for (const chapter of chapters) {
        const anchor = chapter.children[0];
        const levelThreeHref = anchor.href;
        // add the chapter button
        const chapterContainer = createTagWithClassName("div", "chapter-container");
        chapterContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        chapterContainer.onclick = async () => {
            await loadLevelThree(chapterContainer, window.scrollY);
        };
        const chapterButton = createTagWithClassName("button", "chapter-button");
        const span = anchor.children[0];
        const maxChapterNameLength = 15;
        chapterButton.innerText = span.innerText.substring(0, maxChapterNameLength);
        chapterButton.onclick = async () => {
            // await loadLevelThree(chapterContainer);
        };
        chapterContainer.appendChild(chapterButton);
        // add the last read information next to the button
        const lastReadContainer = createTagWithClassName("div", "last-read-container");
        const lastRead = createTagWithClassName("span", "last-read");
        appendLastRead(lastRead, levelThreeHref, lastReadContainer);
        chapterContainer.appendChild(lastReadContainer);
        levelTwoContainer.appendChild(chapterContainer);
    }
}
//# sourceMappingURL=level2.js.map
let breakLoop;
const OBSERVE_IMAGE = "observe-image";
const L3_CONTAINER_ID = "level-three-container";
async function loadLevelThree(elementContainer, levelTwoScrollPosition, infoClicked = false) {
    breakLoop = false;
    window.scrollTo({ top: 0 });
    // create level 3
    const levelTwoContainer = document.getElementById(L2_CONTAINER_ID);
    const levelThreeHref = elementContainer.getAttribute(DATA_LEVEL_THREE_HREF);
    const levelThreeContainer = createTagWithId("div", L3_CONTAINER_ID);
    levelThreeContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
    document.querySelector("body").appendChild(levelThreeContainer);
    levelTwoContainer.style.display = NONE; // hide level 2
    // create the back button
    const backButton = createTagWithId("div", "go-to-level-two");
    backButton.className = "go-back";
    backButton.onclick = () => {
        // stop requests
        breakLoop = true;
        levelTwoContainer.style.display = FLEX; // show level 2
        levelThreeContainer.remove(); // destroy level 3
        // update level two chapter information
        const lastRead = document.getElementById(levelThreeHref);
        lastRead.innerText = hyphenateLongWord(getTimeAgo(Date.now() + ""));
        levelTwoContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        // scroll to level two scroll position
        window.scrollTo({ top: levelTwoScrollPosition });
    };
    levelThreeContainer.appendChild(backButton);
    // display info
    const info = createTagWithClassName("div", "info");
    const clicker = createTagWithClassName("div", "clicker");
    clicker.onclick = () => {
        infoClicked = !infoClicked; // change the status
        if (infoClicked) {
            info.className = "info-clicked";
        }
        else {
            info.className = "info";
        }
    };
    const span = createTagWithClassName("span", "info-content");
    span.innerText = levelThreeHref;
    info.appendChild(span);
    levelThreeContainer.appendChild(info);
    levelThreeContainer.appendChild(clicker);
    // now it's time to load the images
    if (ORIGINAL_HREF.includes(NHENTAI)) {
        await loadHMangaImage(levelThreeContainer);
    }
    else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        const images = await getNhMangaImages(levelThreeHref);
        await loadNhMangaImage(images, levelThreeContainer);
    }
}
async function loadHMangaImage(levelThreeContainer) {
    const levelThreeHref = levelThreeContainer.getAttribute(DATA_LEVEL_THREE_HREF);
    if (levelThreeHref !== null && !breakLoop) {
        const imageDocument = await getResponseDocument(levelThreeHref);
        // append the image to the container
        const image = imageDocument.getElementById("image-container").children[0].children[0];
        const levelThreeImage = new Image();
        levelThreeImage.src = image.src;
        levelThreeImage.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        levelThreeContainer.appendChild(levelThreeImage);
        // get the next image document href
        const nextAnchor = imageDocument.querySelector(".next");
        if (nextAnchor.href === EMPTY_STRING) { // there's always a .next, but .next.href can be empty
            levelThreeContainer.removeAttribute(DATA_LEVEL_THREE_HREF);
        }
        else {
            levelThreeContainer.setAttribute(DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
        // load the image
        levelThreeImage.onload = async () => {
            await loadHMangaImage(levelThreeContainer);
        };
        levelThreeImage.onerror = async () => {
            await onImageLoadError(levelThreeImage);
        };
        observeHMangaImage(levelThreeImage);
    }
}
function observeHMangaImage(levelThreeImage) {
    // observe the image
    const setInfo = (entries) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const entryTarget = entry.target;
                localStorage.setItem(entryTarget.getAttribute(DATA_LEVEL_THREE_HREF), Date.now() + "");
            }
        });
    };
    const infoOptions = {
        root: null,
        rootMargin: "0px"
    };
    const infoObserver = new IntersectionObserver(setInfo, infoOptions);
    infoObserver.observe(levelThreeImage);
}
async function getNhMangaImages(levelThreeHref, retry = true) {
    const images = [];
    const chapter = await getResponseDocument(levelThreeHref, retry);
    if (chapter !== null) {
        const viewports = [];
        const readerAreaChildren = chapter.getElementById("readerarea").children;
        for (let i = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(CLASS)?.includes("ai-viewport-2")) {
                viewports.push(i);
            }
        }
        viewports.pop(); // remove the last image (it's the credits image)
        for (const viewport of viewports) {
            // the index of the p tags are always 2 more than the index of the viewports
            // the p tag contains only the image
            const levelThreeImage = readerAreaChildren[viewport + 2].children[0];
            const image = new Image();
            image.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(DATA_SRC, levelThreeImage.getAttribute(DATA_CFSRC));
            images.push(image);
        }
    }
    if (images.length > 0) {
        const image = images.pop();
        image.className = OBSERVE_IMAGE;
        images.push(image);
    }
    return images;
}
async function loadNhMangaImage(images, levelThreeContainer, index = 0) {
    if (index < images.length && !breakLoop) {
        const image = images[index];
        levelThreeContainer.append(image);
        image.src = image.getAttribute(DATA_SRC);
        image.onload = async () => {
            await loadNhMangaImage(images, levelThreeContainer, ++index);
        };
        image.onerror = async () => {
            await onImageLoadError(image);
        };
        observeNhMangaImage(image);
    }
    else if (index === images.length) {
        loadNextChapter(images, levelThreeContainer);
    }
}
function observeNhMangaImage(image) {
    // set the info of the current image
    const setInfo = (entries) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const observedImage = entry.target;
                const infoContent = document.querySelector(".info-content");
                const levelThreeHref = observedImage.getAttribute(DATA_LEVEL_THREE_HREF);
                infoContent.innerText = levelThreeHref;
                localStorage.setItem(levelThreeHref, Date.now() + "");
            }
        });
    };
    const infoOptions = {
        root: null,
        rootMargin: "0px"
    };
    const infoObserver = new IntersectionObserver(setInfo, infoOptions);
    infoObserver.observe(image);
}
function loadNextChapter(images, levelThreeContainer) {
    // load next chapter
    const nextChapter = (entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const image = entry.target;
                observer.unobserve(image);
                image.removeAttribute(CLASS);
                const nextChapterHref = getNextChapterHref(images);
                const nextChapterImages = await getNhMangaImages(nextChapterHref, false);
                if (nextChapterImages.length > 0) {
                    await loadNhMangaImage(nextChapterImages, levelThreeContainer);
                }
            }
        });
    };
    const nextChapterOptions = {
        root: null,
        rootMargin: LOOK_AHEAD
    };
    const nextChapterObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
    const image = document.querySelector(PERIOD + OBSERVE_IMAGE);
    nextChapterObserver.observe(image);
}
function getNextChapterHref(images) {
    const href = images[0].getAttribute(DATA_LEVEL_TWO_HREF);
    const parts = href.split(HYPHEN);
    const chapterString = "chapter";
    const indexOfChapter = parts.indexOf(chapterString);
    const end = parts[indexOfChapter + 1];
    const chapterNumber = end.substring(0, end.length - 1);
    let nextChapterNumber;
    if (end.includes(PERIOD)) { // we are on a half chapter, skip this and get the next one
        nextChapterNumber = parseInt(chapterNumber.split(PERIOD)[0]) + 1;
    }
    else {
        nextChapterNumber = parseInt(chapterNumber) + 1;
    }
    let nextChapterHref = EMPTY_STRING;
    for (let i = 0; i < indexOfChapter; i++) {
        nextChapterHref += parts[i] + HYPHEN;
    }
    nextChapterHref += chapterString + HYPHEN + nextChapterNumber + "/";
    return nextChapterHref;
}
//# sourceMappingURL=level3.js.map

document.documentElement.remove();
const html = document.createElement("html");
const body = document.createElement("body");
const head = document.createElement("head");
html.appendChild(head);
html.appendChild(body);
document.appendChild(html);

// create level 1
const levelOneContainer = createTagWithId("div", L1_CONTAINER_ID);
body.appendChild(levelOneContainer);
const styleTag = createTagWithId("style", "content-enhancer-css");
styleTag.innerHTML = CSS;
head.appendChild(styleTag);
createLevelOne()
