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


(() => {
    const css = `/* level 1 */
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

.clicked {
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

.thumbnail-container {
    position: relative;
}

.latest-container {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
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

.l2-thumbnail {
    width: 50%;
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
    const levelOne = `// settings
const LOOK_AHEAD = "1000%"; // look ahead 10 screens
// logic
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_HREF = "data-href";
const DATA_DURATION = "data-duration";
const DATA_NEXT_HREF = "data-next-href";
const originalHref = location.href;
let currentChapterHref;
// string names
const L1_CONTAINER_ID = "l1-container";
const L2_CONTAINER_ID = "l2-container";
const L3_CONTAINER_ID = "l3-container";
const THUMBNAIL_CONTAINER = "thumbnail-container";
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
const TOKYOMOTION = "tokyomotion";
const KISSJAV = "kissjav";
const NHENTAI = "nhentai";
const ASURASCANS = "asurascans";
function getNextSearchResultsHref(currentDocument) {
    let nextSearchResultsHref = EMPTY_STRING;
    let anchor = null;
    if (originalHref.includes(TOKYOMOTION)) {
        anchor = currentDocument.querySelector(".prevnext");
    }
    else if (originalHref.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next");
    }
    else if (originalHref.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next");
    }
    else if (originalHref.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r");
    }
    if (anchor !== null) {
        nextSearchResultsHref = anchor.href;
    }
    return nextSearchResultsHref;
}
function getThumbnailList(responseDocument) {
    const thumbnailList = [];
    if (originalHref.includes(TOKYOMOTION)) {
        const selectedElements = responseDocument.querySelectorAll(".thumb-popu");
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (originalHref.includes(KISSJAV)) {
        const selectedElements = responseDocument.querySelector(".videos").children;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (originalHref.includes(NHENTAI)) {
        const selectedElements = responseDocument.querySelector(".index-container").children;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    else if (originalHref.includes(ASURASCANS)) {
        const selectedElements = responseDocument.querySelectorAll(".imgu");
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    return thumbnailList;
}
function setSearchResultsThumbnails(thumbnail, searchResultsThumbnails) {
    let shouldPushThumbnail = true;
    let levelTwoHref;
    let levelOneThumbnail;
    if (originalHref.includes(TOKYOMOTION)) {
        levelTwoHref = thumbnail;
        const thumbOverlayChildren = levelTwoHref.children[0].children;
        levelOneThumbnail = thumbOverlayChildren[0];
        const duration = thumbOverlayChildren[thumbOverlayChildren.length - 1];
        levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerText.trim());
    }
    else if (originalHref.includes(KISSJAV)) {
        const cardImageChildren = thumbnail.children[0].children[0].children;
        levelTwoHref = cardImageChildren[0].children[0];
        levelOneThumbnail = levelTwoHref?.children[0];
        if (levelOneThumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        }
        else if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
            const duration = cardImageChildren[1];
            levelOneThumbnail.setAttribute(DATA_DURATION, duration.innerHTML.split("/span>")[1]);
        }
    }
    else if (originalHref.includes(NHENTAI)) {
        levelTwoHref = thumbnail.children[0];
        levelOneThumbnail = levelTwoHref.children[0];
        if (levelOneThumbnail.getAttribute(DATA_SRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_SRC);
        }
    }
    else if (originalHref.includes(ASURASCANS)) {
        levelTwoHref = thumbnail.children[0];
        levelOneThumbnail = levelTwoHref.children[0];
        if (levelOneThumbnail.getAttribute(DATA_CFSRC) !== null) {
            levelOneThumbnail.src = levelOneThumbnail.getAttribute(DATA_CFSRC);
        }
    }
    if (shouldPushThumbnail) {
        pushThumbnail(levelOneThumbnail, levelTwoHref, "loadLevelTwo", searchResultsThumbnails, "l1-thumbnail");
    }
}
function getSearchResultsThumbnails(responseDocument, nextSearchResultsHref) {
    const searchResultsThumbnails = [];
    const thumbnailList = getThumbnailList(responseDocument);
    for (const thumbnail of thumbnailList) {
        thumbnail.setAttribute(DATA_NEXT_HREF, nextSearchResultsHref);
        setSearchResultsThumbnails(thumbnail, searchResultsThumbnails);
    }
    return searchResultsThumbnails;
}
function pushThumbnail(levelThumbnail, levelHref, functionName, thumbnails, className) {
    // we got all the needed data
    const thumbnail = new Image();
    thumbnail.setAttribute(DATA_HREF, levelHref.href);
    thumbnail.setAttribute(ONCLICK, functionName + "(this)"); // we do it this way to split the code into several files
    thumbnail.setAttribute(DATA_SRC, levelThumbnail.src);
    thumbnail.className = className;
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        const duration = levelThumbnail.getAttribute(DATA_DURATION);
        thumbnail.setAttribute(DATA_DURATION, duration);
    }
    thumbnails.push(thumbnail);
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
async function waitRandomly(minMilliseconds, maxMilliseconds) {
    await waitFor(Math.floor(minMilliseconds + Math.random() * (maxMilliseconds - minMilliseconds + 1)));
}
async function getResponse(href, retry) {
    if (originalHref.includes(NHENTAI)) {
        await waitRandomly(0, 10000);
    }
    const response = await fetch(href);
    let returnedResponse = null;
    const statusOk = 200;
    if (response.status === statusOk) { // the base case, the response was successful
        returnedResponse = response;
    }
    else if (!retry) {
        // do not retry
    }
    else {
        // wait between 1 and 5 seconds
        await waitRandomly(5000, 10000);
        returnedResponse = await getResponse(href, true);
    }
    return returnedResponse;
}
async function waitFor(milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}
async function onImageLoadError(image) {
    // reload the image in 5 seconds
    await waitRandomly(5000, 10000);
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
function updateLevelOneHManga(galleryThumbnailList, lastReadOne, lastReadTwo, lastAvailableTwo) {
    lastAvailableTwo.innerText = "Page " + galleryThumbnailList.length;
    // TODO: first save the information, then get back to this
    const readGalleryThumbnails = [];
    for (const galleryThumbnailElement of galleryThumbnailList) {
        const levelThreeHref = galleryThumbnailElement.children[0];
        const levelTwoThumbnail = levelThreeHref.children[0];
    }
}
function updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableTwo) {
    const readChapters = [];
    let lastReadFound = false;
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const anchor = chapter.children[0];
        const chapterHref = anchor.href;
        const lastRead = localStorage.getItem(chapterHref);
        const span = anchor.children[0];
        const chapterName = span.innerText;
        if (lastRead !== null) {
            lastReadFound = true;
            const last = parseInt(lastRead);
            readChapters.push({
                chapterName,
                lastRead: last
            });
        }
        if (i === 0) {
            lastAvailableTwo.innerText = chapterName;
        }
    }
    if (lastReadFound) {
        // I caved in and got some help for this reduce function. It returns the object that has the greatest lastRead
        const lastReadChapter = readChapters.reduce(getLastReadChapter);
        lastReadOne.innerText = "Read: " + getTimeAgo(lastReadChapter.lastRead + "");
        lastReadTwo.innerText = lastReadChapter.chapterName;
    }
    else {
        lastReadOne.innerText = "Never read before";
        lastReadTwo.innerText = "New";
    }
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
function observeTargets() {
    const callback = (entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const entryTarget = entry.target;
                observer.unobserve(entryTarget);
                entryTarget.removeAttribute(CLASS);
                const href = entryTarget.getAttribute(DATA_NEXT_HREF);
                if (href !== EMPTY_STRING) {
                    const levelOneContainer = document.getElementById(L1_CONTAINER_ID);
                    const searchResultsDocument = await getResponseDocument(href);
                    const nextSearchResultsHref = getNextSearchResultsHref(searchResultsDocument);
                    const searchResultsThumbnails = getSearchResultsThumbnails(searchResultsDocument, nextSearchResultsHref);
                    observeLastImage(searchResultsThumbnails, THUMBNAIL);
                    await loadThumbnail(searchResultsThumbnails, levelOneContainer);
                }
            }
        });
    };
    const options = {
        root: null,
        rootMargin: LOOK_AHEAD
    };
    const observer = new IntersectionObserver(callback, options);
    const target = document.querySelector("." + THUMBNAIL);
    observer.observe(target);
}
function updateThumbnailInformation(lastAvailableOne, levelTwoHref, lastReadOne, lastReadTwo, lastAvailableTwo) {
    if (originalHref.includes(NHENTAI)) {
        lastAvailableOne.innerText = "Last gallery page:";
        const documentPromise = getResponseDocument(levelTwoHref);
        documentPromise.then(mangaDocument => {
            const galleryThumbnailsList = [];
            const galleryThumbnailCollection = mangaDocument.querySelector(".thumbs").children;
            galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailCollection));
            updateLevelOneHManga(galleryThumbnailsList, lastReadOne, lastReadTwo, lastAvailableTwo);
        });
    }
    else if (originalHref.includes(ASURASCANS)) {
        lastAvailableOne.innerText = "Last available:";
        const documentPromise = getResponseDocument(levelTwoHref);
        documentPromise.then(mangaDocument => {
            const chapters = [];
            const nodeChapters = mangaDocument.querySelectorAll("." + EPH_NUM);
            chapters.splice(0, 0, ...Array.from(nodeChapters));
            updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableTwo);
        });
    }
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
function appendThumbnail(thumbnail, container) {
    const levelTwoHref = thumbnail.getAttribute(DATA_HREF);
    const thumbnailContainer = createTagWithClassName("div", THUMBNAIL_CONTAINER);
    thumbnailContainer.appendChild(thumbnail);
    container.append(thumbnailContainer);
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) { // TODO: add last watched information
        const duration = createTagWithClassName("div", "duration");
        duration.innerText = thumbnail.getAttribute(DATA_DURATION);
        thumbnailContainer.appendChild(duration);
    }
    else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        const latestContainer = createTagWithClassName("div", "latest-container");
        const lastRead = createTagWithClassName("div", "last-read-element");
        const lastAvailable = createTagWithClassName("div", "last-available-element");
        const lastReadOne = createTagWithId("div", LAST_READ_1 + levelTwoHref);
        lastReadOne.innerText = LOADING___;
        const lastReadTwo = createTagWithId("div", LAST_READ_2 + levelTwoHref);
        lastReadTwo.innerText = LOADING___;
        const lastAvailableOne = document.createElement("div");
        const lastAvailableTwo = createTagWithId("div", LAST_AVAILABLE_2 + levelTwoHref);
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
async function loadThumbnail(thumbnails, container, index = 0) {
    if (index < thumbnails.length) {
        const thumbnail = thumbnails[index];
        thumbnail.src = thumbnail.getAttribute(DATA_SRC);
        thumbnail.onload = async () => {
            await loadThumbnail(thumbnails, container, ++index);
        };
        thumbnail.onerror = async () => {
            await onImageLoadError(thumbnail);
        };
        appendThumbnail(thumbnail, container);
    }
    else if (index === thumbnails.length && container.id === L1_CONTAINER_ID) { // load new pages using the Intersection API - functional programming
        observeTargets();
    }
}
function observeLastImage(images, className) {
    // start loading the thumbnails
    const image = images.pop();
    image.className = className;
    images.push(image);
}
function createBackButton(container, functionName, className) {
    const backButton = createTagWithClassName("div", className);
    backButton.setAttribute(ONCLICK, functionName + "(this)");
    container.appendChild(backButton);
}
function getTimeAgo(unixTime) {
    const now = Date.now();
    const before = parseInt(unixTime);
    let difference = (now - before) / 1000; // unix time is in milliseconds
    let timeAgo = Math.floor(difference) + " seconds ago";
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
//# sourceMappingURL=level1.js.map`;
    const levelTwo = `let level1ScrollPosition;
const chapters = [];
const galleryThumbnailsList = [];
const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";
function getLevelTwoVideo(searchResultsThumbnail, background) {
    // the video
    const levelTwoVideo = document.createElement("video");
    levelTwoVideo.controls = true;
    levelTwoVideo.preload = "auto";
    levelTwoVideo.playsInline = true;
    levelTwoVideo.muted = true;
    levelTwoVideo.onloadedmetadata = async () => {
        levelTwoVideo.onloadedmetadata = null; // activate this function just once
        // manually autoplay
        await waitFor(100);
        await levelTwoVideo.play();
        await waitFor(100);
        levelTwoVideo.pause();
        // the video is loaded
        searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADED);
        background.className = THUMBNAIL_CONTAINER + " " + LOADED;
    };
    levelTwoVideo.onerror = async () => {
        await waitRandomly(5000, 10000);
        levelTwoVideo.load();
    };
    return levelTwoVideo;
}
async function setBestSource(levelTwoHref, levelTwoVideo, levelTwoContainer) {
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
        if (originalHref.includes(TOKYOMOTION) && source.src.includes("/hd/")) {
            bestSource = source.src;
        }
        else if (originalHref.includes(KISSJAV) && source.src.includes("720p")) {
            bestSource = source.src;
        }
    }
    if (bestSource === null) {
        bestSource = sources[0].src;
    }
    // order matters (first get the source, then append)
    levelTwoSource.src = bestSource;
    levelTwoVideo.appendChild(levelTwoSource);
    levelTwoContainer.appendChild(levelTwoVideo);
}
async function loadVideo(searchResultsThumbnail) {
    const levelTwoHref = searchResultsThumbnail.getAttribute(DATA_HREF);
    const levelTwoContainerId = levelTwoHref;
    const background = searchResultsThumbnail.parentElement;
    const videoLoaded = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        // save the position
        level1ScrollPosition = window.scrollY;
        window.scrollTo({ top: 0 });
        // remove the load status
        searchResultsThumbnail.removeAttribute(DATA_LOAD_STATUS);
        background.className = THUMBNAIL_CONTAINER;
        // hide the thumbnails and show the video container
        document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
        document.getElementById(levelTwoContainerId).style.display = BLOCK; // show level 2
    }
    else if (videoLoading) {
        // alert("wait for the video to load");
    }
    else {
        // after the first click, the video's load status is loading
        searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnail.className = "clicked"; // TODO: use localstorage to remember watched videos
        background.className = THUMBNAIL_CONTAINER + " " + LOADING;
        // create level 2
        const levelTwoContainer = createTagWithId("div", levelTwoContainerId);
        levelTwoContainer.style.display = NONE;
        document.querySelector("body").appendChild(levelTwoContainer);
        const levelTwoVideo = getLevelTwoVideo(searchResultsThumbnail, background);
        await setBestSource(levelTwoHref, levelTwoVideo, levelTwoContainer);
        // the go back button
        createBackButton(levelTwoContainer, "goToLevelOne", "go-back-video");
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
async function loadHManga(levelTwoContainer, mangaDocument) {
    levelTwoContainer.style.flexDirection = "row";
    levelTwoContainer.style.flexWrap = "wrap";
    const galleryThumbnails = [];
    const galleryThumbnailsCollection = mangaDocument.querySelector(".thumbs").children;
    galleryThumbnailsList.splice(0, galleryThumbnailsList.length, ...Array.from(galleryThumbnailsCollection)); // replace the array
    for (const galleryThumbnailElement of galleryThumbnailsList) {
        const levelThreeHref = galleryThumbnailElement.children[0];
        const levelTwoThumbnail = levelThreeHref.children[0];
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(DATA_SRC);
        pushThumbnail(levelTwoThumbnail, levelThreeHref, "loadLevelThree", galleryThumbnails, "l2-thumbnail");
    }
    await loadThumbnail(galleryThumbnails, levelTwoContainer);
}
function loadNhManga(levelTwoContainer, mangaDocument) {
    levelTwoContainer.style.flexDirection = "column";
    const nodeChapters = mangaDocument.querySelectorAll("." + EPH_NUM);
    chapters.splice(0, chapters.length, ...Array.from(nodeChapters)); // replace the array
    for (const chapter of chapters) {
        const anchor = chapter.children[0];
        currentChapterHref = anchor.href;
        // add the chapter button
        const chapterContainer = createTagWithClassName("div", "chapter-container");
        const chapterButton = createTagWithClassName("button", "chapter-button");
        const span = anchor.children[0];
        chapterButton.innerText = span.innerText;
        chapterButton.setAttribute(DATA_HREF, currentChapterHref);
        chapterButton.onclick = async () => {
            await loadLevelThree(chapterButton);
        };
        chapterContainer.appendChild(chapterButton);
        // add the last read information next to the button
        const lastReadContainer = createTagWithClassName("div", "last-read-container");
        const lastRead = createTagWithClassName("span", "last-read");
        lastRead.id = currentChapterHref;
        const lastReadString = localStorage.getItem(currentChapterHref);
        if (lastReadString === null) {
            lastRead.innerText = "Never read";
        }
        else {
            lastRead.innerText = getTimeAgo(lastReadString);
        }
        lastReadContainer.appendChild(lastRead);
        chapterContainer.appendChild(lastReadContainer);
        levelTwoContainer.appendChild(chapterContainer);
    }
}
async function loadManga(searchResultsThumbnail) {
    // scroll to the top - order matters
    level1ScrollPosition = window.scrollY;
    window.scrollTo({ top: 0 });
    // create level 2
    const levelTwoHref = searchResultsThumbnail.getAttribute(DATA_HREF);
    const levelTwoContainer = createTagWithId("div", L2_CONTAINER_ID);
    levelTwoContainer.setAttribute(DATA_HREF, levelTwoHref);
    levelTwoContainer.style.display = FLEX;
    document.querySelector("body").appendChild(levelTwoContainer);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    createBackButton(levelTwoContainer, "goToLevelOne", "go-back-manga");
    // get the gallery thumbnails
    const mangaDocument = await getResponseDocument(levelTwoHref);
    if (originalHref.includes(NHENTAI)) {
        await loadHManga(levelTwoContainer, mangaDocument);
    }
    else if (originalHref.includes(ASURASCANS)) {
        loadNhManga(levelTwoContainer, mangaDocument);
    }
}
async function loadLevelTwo(searchResultsThumbnail) {
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnail);
    }
    else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnail);
    }
}
function goToLevelOne(backButton) {
    const levelTwoContainer = backButton.parentElement;
    document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
    levelTwoContainer.remove(); // destroy level 2
    const levelTwoHref = levelTwoContainer.getAttribute(DATA_HREF);
    const lastReadOne = document.getElementById(LAST_READ_1 + levelTwoHref);
    const lastReadTwo = document.getElementById(LAST_READ_2 + levelTwoHref);
    const lastAvailableTwo = document.getElementById(LAST_AVAILABLE_2 + levelTwoHref);
    if (originalHref.includes(NHENTAI)) {
        updateLevelOneHManga(galleryThumbnailsList, lastReadOne, lastReadTwo, lastAvailableTwo);
    }
    else if (originalHref.includes(ASURASCANS)) {
        updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableTwo);
    }
    // scroll to the first level position
    window.scrollTo({ top: level1ScrollPosition });
}
//# sourceMappingURL=level2.js.map`;
    const levelThree = `let level2ScrollPosition;
let nextImageHref;
let infoClicked;
let breakLoop; // don't send any more requests if you go back a level
async function loadLevelThree(element) {
    breakLoop = false;
    // scroll to the top - order matters
    level2ScrollPosition = window.scrollY;
    window.scrollTo({ top: 0 });
    // create level 3
    const levelTwoContainer = document.getElementById(L2_CONTAINER_ID);
    const levelThreeHref = element.getAttribute(DATA_HREF);
    const levelThreeContainer = createTagWithId("div", L3_CONTAINER_ID);
    document.querySelector("body").appendChild(levelThreeContainer);
    levelTwoContainer.style.display = NONE; // hide level 2
    createBackButton(levelThreeContainer, "goToLevelTwo", "go-back");
    const info = createTagWithClassName("div", "info");
    const clicker = createTagWithClassName("div", "clicker");
    infoClicked = false;
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
    if (originalHref.includes(NHENTAI)) {
        nextImageHref = levelThreeHref;
        await loadHMangaImage(levelThreeContainer);
    }
    else if (originalHref.includes(ASURASCANS)) {
        const images = await getAsImages(levelThreeHref);
        observeLastImage(images, IMAGE);
        await loadNhMangaImage(images, levelThreeContainer);
    }
}
function goToLevelTwo(backButton) {
    document.getElementById(L2_CONTAINER_ID).style.display = FLEX; // show level 2
    document.getElementById(backButton.parentElement.id).remove(); // destroy level 3
    // stop requests
    breakLoop = true;
    // update level 2 chapter information
    const lastRead = document.getElementById(currentChapterHref);
    lastRead.innerText = getTimeAgo(Date.now() + "");
    // scroll to level 2 scroll position
    window.scrollTo({ top: level2ScrollPosition });
}
async function loadHMangaImage(levelThreeContainer) {
    if (nextImageHref !== EMPTY_STRING && !breakLoop) {
        // get the next image
        const imageDocument = await getResponseDocument(nextImageHref);
        // append the image to the container
        const image = imageDocument.getElementById("image-container").children[0].children[0];
        const levelThreeImage = new Image();
        levelThreeImage.src = image.src;
        levelThreeContainer.appendChild(levelThreeImage);
        // set the next image to be loaded
        const nextImage = imageDocument.querySelector(".next");
        if (nextImage === null) {
            nextImageHref = EMPTY_STRING;
        }
        else {
            nextImageHref = nextImage.href;
        }
        // load the next image
        levelThreeImage.onload = async () => {
            await loadHMangaImage(levelThreeContainer);
        };
        levelThreeImage.onerror = async () => {
            await onImageLoadError(levelThreeImage);
        };
    }
    else {
        // save the info of the current image
        const setInfo = (entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const entryTarget = entry.target;
                    localStorage.setItem(entryTarget.src, Date.now() + "");
                }
            });
        };
        const infoOptions = {
            root: null,
            rootMargin: "0px"
        };
        const infoObserver = new IntersectionObserver(setInfo, infoOptions);
        const targets = levelThreeContainer.querySelectorAll("img");
        targets.forEach(target => {
            infoObserver.observe(target);
        });
    }
}
async function getAsImages(href, retry = true) {
    const images = [];
    const chapter = await getResponseDocument(href, retry);
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
            const image = readerAreaChildren[viewport + 2].children[0];
            const newImage = new Image();
            newImage.setAttribute(DATA_HREF, href);
            newImage.setAttribute(DATA_SRC, image.getAttribute(DATA_CFSRC));
            images.push(newImage);
        }
    }
    return images;
}
function getNextChapterHref(images) {
    const href = images[0].getAttribute(DATA_HREF);
    const separatorString = "-";
    const parts = href.split(separatorString);
    const chapterString = "chapter";
    const indexOfChapter = parts.indexOf(chapterString);
    const end = parts[indexOfChapter + 1];
    const chapterNumber = end.substring(0, end.length - 1);
    let nextChapterNumber;
    if (end.includes(".")) { // we are on a half chapter, skip this and get the next one
        nextChapterNumber = parseInt(chapterNumber.split(".")[0]) + 1;
    }
    else {
        nextChapterNumber = parseInt(chapterNumber) + 1;
    }
    let nextChapterHref = EMPTY_STRING;
    for (let i = 0; i < indexOfChapter; i++) {
        nextChapterHref += parts[i] + separatorString;
    }
    nextChapterHref += chapterString + separatorString + nextChapterNumber + "/";
    return nextChapterHref;
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
    }
    else if (index === images.length) {
        // load next chapter
        const nextChapter = (entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const entryTarget = entry.target;
                    observer.unobserve(entryTarget);
                    entryTarget.removeAttribute(CLASS);
                    const nextChapterHref = getNextChapterHref(images);
                    const nextChapterImages = await getAsImages(nextChapterHref, false);
                    if (nextChapterImages.length > 0) {
                        observeLastImage(nextChapterImages, IMAGE);
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
        const target = document.querySelector("." + IMAGE);
        nextChapterObserver.observe(target);
        // set the info of the current image
        const setInfo = (entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const entryTarget = entry.target;
                    const infoContent = document.querySelector(".info-content");
                    currentChapterHref = entryTarget.getAttribute(DATA_HREF);
                    infoContent.innerText = currentChapterHref;
                    localStorage.setItem(currentChapterHref, Date.now() + "");
                }
            });
        };
        const infoOptions = {
            root: null,
            rootMargin: "0px"
        };
        const infoObserver = new IntersectionObserver(setInfo, infoOptions);
        const targets = levelThreeContainer.querySelectorAll("img");
        targets.forEach(target => {
            infoObserver.observe(target);
        });
    }
}
//# sourceMappingURL=level3.js.map`;
    const startUp = `(async () => {
    const nextSearchResultsHref = getNextSearchResultsHref(document);
    // collect the thumbnails before the html element is removed
    const searchResultsThumbnails = getSearchResultsThumbnails(document, nextSearchResultsHref);
    // set up the html
    const contentEnhancers = document.querySelectorAll(".content-enhancer");
    document.querySelector("body").parentElement.remove(); // destroy everything
    const html = document.createElement("html");
    const body = document.createElement("body");
    const head = document.createElement("head");
    for (const contentEnhancer of contentEnhancers) {
        head.appendChild(contentEnhancer);
    }
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);
    // level 1
    const levelOneContainer = createTagWithId("div", L1_CONTAINER_ID);
    body.appendChild(levelOneContainer);
    observeLastImage(searchResultsThumbnails, THUMBNAIL);
    await loadThumbnail(searchResultsThumbnails, levelOneContainer);
})();
//# sourceMappingURL=startUp.js.map`;
    function createTag(innerHTML, tagName) {
        const tag = document.createElement(tagName);
        tag.className = "content-enhancer";
        tag.innerHTML = innerHTML;
        return tag;
    }
    const head = document.head;
    const cssTag = createTag(css, "style");
    head.appendChild(cssTag);
    const SCRIPT = "script";
    const levelOneTag = createTag(levelOne, SCRIPT);
    head.appendChild(levelOneTag);
    const levelTwoTag = createTag(levelTwo, SCRIPT);
    head.appendChild(levelTwoTag);
    const levelThreeTag = createTag(levelThree, SCRIPT);
    head.appendChild(levelThreeTag);
    // order matters, we call the main function at the very end
    const startUpTag = createTag(startUp, SCRIPT);
    head.appendChild(startUpTag);
})();
//# sourceMappingURL=content-enhancer.js.map
