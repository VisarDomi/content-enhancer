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
// @run-at       document-start
// @grant        none
// ==/UserScript==

class Utilities {
    static async getResponseDocument(href, retry = true) {
        const response = await this.getResponse(href, retry);
        let returnedDocument = null;
        if (response !== null) {
            const text = await response.text();
            returnedDocument = new DOMParser().parseFromString(text, "text/html");
        }
        return returnedDocument;
    }
    static async getResponse(href, retry, failedHref = {
        href: Utilities.EMPTY_STRING,
        waitTime: 1000
    }) {
        const response = await fetch(href);
        let returnedResponse = null;
        const statusOk = 200;
        if (response.status === statusOk) { // the base case, the response was successful
            returnedResponse = response;
        }
        else if (retry) {
            failedHref["waitTime"] += this.randomNumber(0, 1000); // the base wait time is between one and two seconds
            if (failedHref["href"] === href) { // the request has previously failed
                failedHref["waitTime"] *= this.randomNumber(2, 3); // double the wait time (on average) for each failed attempt
            }
            failedHref["href"] = href; // save the failed request
            await this.waitFor(failedHref["waitTime"]);
            returnedResponse = await this.getResponse(href, true, failedHref);
        }
        return returnedResponse;
    }
    static randomNumber(start, end) {
        return Math.floor(start + Math.random() * (end - start));
    }
    static async waitFor(milliseconds) {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    static getLastReadChapter(previous, current) {
        let returnedChapter;
        if (previous.lastRead > current.lastRead) {
            returnedChapter = previous;
        }
        else {
            returnedChapter = current;
        }
        return returnedChapter;
    }
    static async onImageLoadError(image) {
        // reload the image in 5 seconds
        await this.waitFor(this.randomNumber(5000, 10000));
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
    static createTagWithClassName(tagName, className) {
        const createdElement = document.createElement(tagName);
        createdElement.className = className;
        return createdElement;
    }
    static createTagWithId(tagName, id) {
        const createdElement = document.createElement(tagName);
        createdElement.id = id;
        return createdElement;
    }
    static getCurrentTime(time) {
        let currentTime;
        const secondsPerMinute = 60;
        const minutesPerHour = 60;
        if (time < secondsPerMinute) {
            currentTime = "00:" + parseInt(time + "");
        }
        else if (time < (secondsPerMinute * minutesPerHour)) {
            const minutes = parseInt((time / secondsPerMinute) + "");
            const seconds = parseInt(time % secondsPerMinute + "");
            currentTime = minutes + ":" + seconds;
        }
        else {
            const hours = parseInt((time / (secondsPerMinute * minutesPerHour)) + "");
            const minutes = parseInt((time / secondsPerMinute) + "") % minutesPerHour;
            const seconds = parseInt(time % secondsPerMinute + "");
            currentTime = hours + ":" + minutes + ":" + seconds;
        }
        // currentTime is of the format 1:2:3 and should be 01:02:03
        const parts = currentTime.split(":");
        let formattedTime = "";
        for (let i = 0; i < parts.length; i++) {
            let section = parts[i];
            if (section.length === 1) {
                section = "0" + section;
            }
            if (i < parts.length - 1) {
                formattedTime += section + ":";
            }
            else {
                formattedTime += section;
            }
        }
        return formattedTime;
    }
    static hyphenateLongWord(chapterName) {
        let hyphenatedChapterName = Utilities.EMPTY_STRING;
        const maxWordLength = 9;
        for (const word of chapterName.split(Utilities.SPACE)) {
            if (word.length > maxWordLength + 1) {
                hyphenatedChapterName += word.substring(0, maxWordLength) + Utilities.HYPHEN + Utilities.SPACE + word.substring(maxWordLength) + Utilities.SPACE;
            }
            else {
                hyphenatedChapterName += word + Utilities.SPACE;
            }
        }
        return hyphenatedChapterName;
    }
    static getTimeAgo(unixTime) {
        const now = Date.now();
        const before = parseInt(unixTime);
        const difference = (now - before) / 1000; // unix time is in milliseconds
        const secondsPerSeconds = 1;
        const secondsPerMinute = 60;
        const minutesPerHour = 60;
        const hoursPerWeek = 24;
        const daysPerWeek = 7;
        const weeksPerMonth = 4;
        const monthsPerYear = 12;
        let timeAgo = null;
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerSeconds, " second ago", " seconds ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute, " minute ago", " minutes ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour, " hour ago", " hours ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek, " day ago", " days ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek, " week ago", " weeks ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth, " month ago", " months ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth * monthsPerYear, " year ago", " years ago");
        return timeAgo;
    }
    static modifyTimeAgo(timeAgo, difference, factor, singular, plural) {
        let returnedTimeAgo = timeAgo;
        if (difference > factor || factor === 1) {
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
    static updateLastRead(lastRead) {
        const lastReadString = localStorage.getItem(lastRead.id);
        let lastReadInnerText;
        if (lastReadString === null) {
            lastReadInnerText = "Never read";
        }
        else {
            lastReadInnerText = Utilities.getTimeAgo(lastReadString);
        }
        lastRead.innerText = lastReadInnerText;
    }
    static getNextChapterHref(href) {
        const parts = href.split(Utilities.HYPHEN);
        const chapterString = "chapter";
        const indexOfChapter = parts.indexOf(chapterString);
        const end = parts[indexOfChapter + 1];
        const chapterNumber = end.substring(0, end.length - 1);
        let nextChapterNumber;
        if (end.includes(Utilities.PERIOD)) { // we are on a half chapter, skip this and get the next one
            nextChapterNumber = parseInt(chapterNumber.split(Utilities.PERIOD)[0]) + 1;
        }
        else {
            nextChapterNumber = parseInt(chapterNumber) + 1;
        }
        let nextChapterHref = Utilities.EMPTY_STRING;
        for (let i = 0; i < indexOfChapter; i++) {
            nextChapterHref += parts[i] + Utilities.HYPHEN;
        }
        nextChapterHref += chapterString + Utilities.HYPHEN + nextChapterNumber + "/";
        return nextChapterHref;
    }
}
Utilities.EMPTY_STRING = "";
Utilities.SPACE = " ";
Utilities.HYPHEN = "-";
Utilities.PERIOD = ".";
//# sourceMappingURL=Utilities.js.map

const CSS_INNER_HTML = `/* level 1 */
body {
    margin: 0;
    background-color: black;
    padding-top: 100px;
    padding-bottom: 200px;
}

img, video {
    display: block;
    width: 100%;
}

video {
    margin-bottom: 100px;
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

.last-watched-element, .last-available-element {
    background-color: rgba(0, 0, 0, 0.5);
    width: 50%;
}

.last-watched-element > div:nth-child(2), .last-available-element > div:nth-child(2) {
    font-size: 2rem;
}

.last-available-element {
    display: flex;
    flex-direction: column;
    align-items: end;
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

.info, .info-clicked {
    position: fixed;
    left: 0;
    top: 30%;
    height: 30%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.info {
    background-color: rgba(0, 0, 0, 0.0);
}

.info-clicked {
    background-color: rgba(0, 0, 0, 0.7);
}

.info-content {
    display: none;
}

.info-content-clicked {
    display: block;
    font-size: 1.1rem;
    font-family: sans-serif;
    color: white;
    line-height: 2;
    margin: 20px;
}
`;
function loadContent() {
    document.write("<html><head></head><body></body></html>");
    const body = document.querySelector("body");
    const head = document.querySelector("head");
    const levelOneContainer = Utilities.createTagWithId("div", Content.L1_CONTAINER_ID);
    body.appendChild(levelOneContainer);
    const styleTag = Utilities.createTagWithId("style", "content-enhancer-css");
    styleTag.innerHTML = CSS_INNER_HTML;
    head.appendChild(styleTag);
    const content = createContent(location.href);
    content?.load(); // asynchronously
}
function createContent(href) {
    let content = null;
    if (href.includes(Content.TOKYOMOTION)) {
        content = new TokyoMotion(href);
    }
    else if (href.includes(Content.KISSJAV)) {
        content = new KissJav(href);
    }
    else if (href.includes(Content.NHENTAI)) {
        content = new NHentai(href);
    }
    else if (href.includes(Content.ASURASCANS)) {
        content = new AsuraScans(href);
    }
    return content;
}
class Content {
    constructor(href) {
        this.href = href;
    }
    // level one
    async load(href = this.href) {
        this.searchResultsDocument = await Utilities.getResponseDocument(href);
        this.setNextSearchResultsHref();
        this.createThumbnailContainers();
        await this.loadThumbnailContainer(this.thumbnailContainers, document.getElementById(Content.L1_CONTAINER_ID));
    }
    setNextSearchResultsHref() {
        this.nextSearchResultsHref = null;
        const anchor = this.getAnchor();
        if (anchor !== null) {
            this.nextSearchResultsHref = anchor.href;
        }
    }
    createThumbnailContainers() {
        this.thumbnailContainers = [];
        this.searchResultsThumbnails = this.getSearchResultsThumbnails();
        for (const searchResultsThumbnail of this.searchResultsThumbnails) {
            this.appendThumbnailContainer(searchResultsThumbnail);
        }
    }
    pushThumbnail(thumbnail, levelTwoAnchor) {
        const thumbnailContainer = this.createThumbnailContainer(thumbnail, levelTwoAnchor);
        this.thumbnailContainers.push(thumbnailContainer);
    }
    createThumbnailContainer(levelOneThumbnail, levelTwoAnchor) {
        const thumbnailContainer = Utilities.createTagWithClassName("div", Content.LEVEL_ONE_THUMBNAIL_CONTAINER);
        thumbnailContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoAnchor.href);
        const thumbnail = new Image();
        const latestContainer = Utilities.createTagWithClassName("div", "latest-container");
        const lastWatched = Utilities.createTagWithClassName("div", "last-watched-element");
        const lastAvailable = Utilities.createTagWithClassName("div", "last-available-element");
        const lastWatchedOne = Utilities.createTagWithId("div", Content.LAST_WATCHED_1 + levelTwoAnchor.href);
        lastWatchedOne.innerText = Content.LOADING___;
        const lastWatchedTwo = Utilities.createTagWithId("div", Content.LAST_WATCHED_2 + levelTwoAnchor.href);
        lastWatchedTwo.innerText = Content.LOADING___;
        const lastAvailableOne = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_1 + levelTwoAnchor.href);
        lastAvailableOne.innerText = Content.LOADING___;
        const lastAvailableTwo = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_2 + levelTwoAnchor.href);
        lastAvailableTwo.innerText = Content.LOADING___;
        this.saveDuration(levelOneThumbnail, lastAvailableTwo);
        lastWatched.appendChild(lastWatchedOne);
        lastWatched.appendChild(lastWatchedTwo);
        lastAvailable.appendChild(lastAvailableOne);
        lastAvailable.appendChild(lastAvailableTwo);
        latestContainer.appendChild(lastWatched);
        latestContainer.appendChild(lastAvailable);
        thumbnailContainer.appendChild(latestContainer);
        thumbnail.setAttribute(Content.DATA_SRC, levelOneThumbnail.src);
        thumbnailContainer.appendChild(thumbnail);
        thumbnailContainer.onclick = async () => {
            await this.loadLevelTwo(thumbnailContainer, window.scrollY);
        };
        return thumbnailContainer;
    }
    saveDuration(levelOneThumbnail, lastAvailableTwo) {
    }
    async loadThumbnailContainer(thumbnailContainers, container, index = 0) {
        const thumbnailContainersLength = thumbnailContainers.length;
        if (index < thumbnailContainersLength) {
            const thumbnailContainer = thumbnailContainers[index];
            const thumbnail = thumbnailContainer.querySelector("img");
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
            thumbnail.onload = async () => {
                await this.loadThumbnailContainer(thumbnailContainers, container, ++index);
            };
            thumbnail.onerror = async () => {
                await Utilities.onImageLoadError(thumbnail);
            };
            if (index === thumbnailContainersLength - 1 && container.id === Content.L1_CONTAINER_ID) {
                thumbnail.className = Content.OBSERVE_THUMBNAIL;
            }
            container.appendChild(thumbnailContainer);
        }
        else if (index === thumbnailContainersLength && container.id === Content.L1_CONTAINER_ID) {
            this.observeLastThumbnail();
            for (const thumbnailContainer of thumbnailContainers) {
                await this.updateThumbnailContainer(thumbnailContainer);
            }
        }
    }
    observeLastThumbnail() {
        const callback = (entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const thumbnail = entry.target;
                    observer.unobserve(thumbnail);
                    thumbnail.removeAttribute(Content.CLASS);
                    const href = this.nextSearchResultsHref;
                    if (href !== null) {
                        await this.load(href);
                    }
                }
            });
        };
        const options = {
            root: null,
            rootMargin: Content.LOOK_AHEAD
        };
        const observer = new IntersectionObserver(callback, options);
        const thumbnail = document.querySelector(Utilities.PERIOD + Content.OBSERVE_THUMBNAIL);
        observer.observe(thumbnail);
    }
    async updateThumbnailContainer(thumbnailContainer) {
        const levelTwoHref = thumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const lastWatchedOne = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref);
        const lastWatchedTwo = document.getElementById(Content.LAST_WATCHED_2 + levelTwoHref);
        const lastAvailableOne = document.getElementById(Content.LAST_AVAILABLE_1 + levelTwoHref);
        const lastAvailableTwo = document.getElementById(Content.LAST_AVAILABLE_2 + levelTwoHref);
        await this.updateLevelOne(levelTwoHref, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo);
    }
}
Content.TOKYOMOTION = "tokyomotion";
Content.KISSJAV = "kissjav";
Content.NHENTAI = "nhentai";
Content.ASURASCANS = "asurascans";
Content.L1_CONTAINER_ID = "level-one-container";
Content.L2_CONTAINER_ID = "level-two-container";
Content.L3_CONTAINER_ID = "level-three-container";
Content.LOOK_AHEAD = "2000%"; // look ahead 20 screens
Content.DATA_SRC = "data-src";
Content.DATA_CFSRC = "data-cfsrc";
Content.DATA_LEVEL_TWO_HREF = "data-level-two-href";
Content.DATA_LEVEL_THREE_HREF = "data-level-three-href";
Content.DATA_DURATION = "data-duration";
Content.LEVEL_ONE_THUMBNAIL_CONTAINER = "level-one-thumbnail-container";
Content.LEVEL_TWO_THUMBNAIL_CONTAINER = "level-two-thumbnail-container";
Content.OBSERVE_THUMBNAIL = "observe-thumbnail";
Content.OBSERVE_IMAGE = "observe-image";
Content.EPH_NUM = "eph-num";
Content.THUMBS = "thumbs";
Content.LAST_WATCHED_1 = "last-watched-one";
Content.LAST_WATCHED_2 = "last-watched-two";
Content.LAST_AVAILABLE_1 = "last-available-one";
Content.LAST_AVAILABLE_2 = "last-available-two";
Content.CLASS = "class";
Content.FLEX = "flex";
Content.NONE = "none";
Content.LOADING___ = "Loading...";
Content.DATA_LOAD_STATUS = "data-load-status";
Content.LOADED = "loaded";
Content.LOADING = "loading";
Content.BLOCK = "block";
class Video extends Content {
    // level one
    saveDuration(levelOneThumbnail, lastAvailableTwo) {
        lastAvailableTwo.setAttribute(Content.DATA_DURATION, levelOneThumbnail.getAttribute(Content.DATA_DURATION));
    }
    updateLevelOne(levelTwoHref, lastWatchedOne, lastWatchedTwo, lastAvailableOne, lastAvailableTwo) {
        lastAvailableOne.innerText = "Duration:";
        lastAvailableTwo.innerText = lastAvailableTwo.getAttribute(Content.DATA_DURATION);
        lastWatchedOne.innerText = "Never watched before";
        lastWatchedTwo.innerText = "New";
        try {
            const video = JSON.parse(localStorage.getItem(levelTwoHref));
            lastWatchedOne.innerText = "Watched: " + Utilities.getTimeAgo(video.lastWatched + "");
            lastWatchedTwo.innerText = Utilities.getCurrentTime(video.currentTime);
        }
        catch (ignored) {
        }
    }
    // level two
    async loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
        const levelTwoHref = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelOneContainer = document.getElementById(Content.L1_CONTAINER_ID);
        const videoLoaded = (searchResultsThumbnailContainer.getAttribute(Content.DATA_LOAD_STATUS) === Content.LOADED);
        const videoLoading = (searchResultsThumbnailContainer.getAttribute(Content.DATA_LOAD_STATUS) === Content.LOADING);
        if (videoLoaded) {
            window.scrollTo({ top: 100 });
            searchResultsThumbnailContainer.removeAttribute(Content.DATA_LOAD_STATUS); // remove the load status
            levelOneContainer.style.display = Content.NONE; // hide level 1
            document.getElementById(levelTwoHref).style.display = Content.BLOCK; // show level 2
        }
        else if (!videoLoading) {
            // after the first click, the video's load status is loading
            searchResultsThumbnailContainer.setAttribute(Content.DATA_LOAD_STATUS, Content.LOADING);
            searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER + Utilities.SPACE + Content.LOADING;
            // create level 2
            const levelTwoContainer = Utilities.createTagWithId("div", levelTwoHref);
            levelTwoContainer.style.display = Content.NONE;
            document.querySelector("body").appendChild(levelTwoContainer);
            const levelTwoVideo = this.createLevelTwoVideo(searchResultsThumbnailContainer);
            const bestSource = await this.getBestSource(levelTwoHref);
            levelTwoVideo.appendChild(bestSource);
            levelTwoContainer.appendChild(levelTwoVideo);
            // the go back button
            const backButton = Utilities.createTagWithId("div", "go-to-level-one");
            backButton.className = "go-back-video";
            const intervalId = setInterval(() => {
                const video = {
                    lastWatched: Date.now(),
                    currentTime: levelTwoVideo.currentTime
                };
                localStorage.setItem(levelTwoHref, JSON.stringify(video));
            }, 1000);
            backButton.onclick = () => {
                clearInterval(intervalId);
                levelOneContainer.style.display = Content.BLOCK; // show level 1
                levelTwoContainer.remove(); // destroy level 2
                searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER;
                window.scrollTo({ top: levelOneScrollPosition });
                const lastWatchedOne = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref);
                this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement); // do this asynchronously
            };
            levelTwoContainer.appendChild(backButton);
            // refresh should be at the end of the page
            const refresh = Utilities.createTagWithClassName("button", "refresh");
            refresh.type = "button";
            refresh.onclick = () => {
                levelTwoVideo.load();
                levelTwoVideo.scrollIntoView();
            };
            refresh.innerText = "Reload the video";
            levelTwoContainer.appendChild(refresh);
        }
    }
    createLevelTwoVideo(searchResultsThumbnailContainer) {
        const levelTwoVideo = document.createElement("video");
        levelTwoVideo.controls = true;
        levelTwoVideo.preload = "auto";
        levelTwoVideo.playsInline = true;
        levelTwoVideo.muted = true;
        levelTwoVideo.onloadedmetadata = async () => {
            levelTwoVideo.onloadedmetadata = null;
            // manually autoplay
            await Utilities.waitFor(100);
            await levelTwoVideo.play();
            await Utilities.waitFor(100);
            levelTwoVideo.pause();
            // the video is loaded
            searchResultsThumbnailContainer.setAttribute(Content.DATA_LOAD_STATUS, Content.LOADED);
            searchResultsThumbnailContainer.className = Content.LEVEL_ONE_THUMBNAIL_CONTAINER + Utilities.SPACE + Content.LOADED;
        };
        levelTwoVideo.onerror = async () => {
            await Utilities.waitFor(Utilities.randomNumber(5000, 10000));
            levelTwoVideo.load();
        };
        return levelTwoVideo;
    }
    async getBestSource(levelTwoHref) {
        const levelTwoSource = document.createElement("source");
        const videoDocument = await Utilities.getResponseDocument(levelTwoHref);
        const video = this.getVideo(videoDocument);
        const sources = video.querySelectorAll("source");
        // select the best source
        let bestSource = null;
        for (const source of sources) {
            bestSource = this.getSource(source);
        }
        if (bestSource === null) {
            bestSource = sources[0].src;
        }
        // order matters (first get the source, then append)
        levelTwoSource.src = bestSource;
        return levelTwoSource;
    }
}
class Manga extends Content {
    // level one
    async updateLevelOne(levelTwoHref, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const mangaCollection = this.getMangaCollection(mangaDocument);
        this.updateLevelOneManga(mangaCollection, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }
    updateLevelOneManga(mangaCollection, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
        lastReadOne.innerText = "Never watched before";
        lastReadTwo.innerText = "New";
        const readCollection = [];
        let lastReadFound = false;
        for (let i = 0; i < mangaCollection.length; i++) {
            const item = mangaCollection[i];
            const levelThreeAnchor = this.getLevelThreeAnchor(item);
            const name = this.getItemName(levelThreeAnchor);
            const lastReadStorage = localStorage.getItem(levelThreeAnchor.href);
            if (lastReadStorage !== null) {
                lastReadFound = true;
                const lastRead = parseInt(lastReadStorage);
                readCollection.push({
                    name,
                    lastRead
                });
            }
        }
        if (lastReadFound) {
            // I caved in and got some help for this. It returns the object that has the greatest lastRead
            const lastReadItem = readCollection.reduce(Utilities.getLastReadChapter);
            lastReadOne.innerText = "Read: " + Utilities.getTimeAgo(lastReadItem.lastRead + "");
            lastReadTwo.innerText = this.getLastReadTwoInnerText(lastReadItem.name);
        }
        lastAvailableOne.innerText = this.getLastAvailableOneInnerText();
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(mangaCollection);
    }
    // level two
    async loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
        window.scrollTo({ top: 100 });
        // create level 2
        const levelTwoHref = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelTwoContainer = Utilities.createTagWithId("div", Content.L2_CONTAINER_ID);
        levelTwoContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoHref);
        levelTwoContainer.style.display = Content.FLEX;
        document.querySelector("body").appendChild(levelTwoContainer);
        document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.NONE; // hide level 1
        const backButton = Utilities.createTagWithId("div", "go-to-level-one");
        backButton.className = "go-back-manga";
        backButton.onclick = () => {
            document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            window.scrollTo({ top: levelOneScrollPosition });
            const lastWatchedOne = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref);
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement); // do this asynchronously
        };
        levelTwoContainer.appendChild(backButton);
        // get the gallery thumbnails
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        this.loadManga(levelTwoContainer, mangaDocument);
    }
    // level three
    async loadLevelThree(elementContainer, levelTwoScrollPosition, infoClicked = false) {
        this.breakLoop = false;
        window.scrollTo({ top: 100 });
        // create level 3
        const levelTwoContainer = document.getElementById(Content.L2_CONTAINER_ID);
        const levelThreeHref = elementContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const levelThreeContainer = Utilities.createTagWithId("div", Content.L3_CONTAINER_ID);
        levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
        document.querySelector("body").appendChild(levelThreeContainer);
        levelTwoContainer.style.display = Content.NONE; // hide level 2
        // create the back button
        const backButton = Utilities.createTagWithId("div", "go-to-level-two");
        backButton.className = "go-back";
        backButton.onclick = () => {
            // stop requests
            this.breakLoop = true;
            levelTwoContainer.style.display = Content.FLEX; // show level 2
            levelThreeContainer.remove(); // destroy level 3
            window.scrollTo({ top: levelTwoScrollPosition });
        };
        levelThreeContainer.appendChild(backButton);
        // display info
        const span = Utilities.createTagWithClassName("span", "info-content");
        span.innerText = levelThreeHref;
        const info = Utilities.createTagWithClassName("div", "info");
        info.onclick = () => {
            infoClicked = !infoClicked; // change the status
            if (infoClicked) {
                info.className = "info-clicked";
                span.className = "info-content-clicked";
            }
            else {
                info.className = "info";
                span.className = "info-content";
            }
        };
        info.appendChild(span);
        levelThreeContainer.appendChild(info);
        // now it's time to load the images
        await this.loadImages(levelThreeContainer);
    }
}
class HManga extends Manga {
    // level one
    getLastReadTwoInnerText(lastReadItemName) {
        return "Page " + lastReadItemName;
    }
    getLastAvailableOneInnerText() {
        return "Total pages:";
    }
    // level two
    async loadManga(levelTwoContainer, mangaDocument) {
        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers = [];
        this.removeExtraDiv();
        const galleryThumbnailsList = this.getMangaCollection(mangaDocument);
        for (let i = 0; i < galleryThumbnailsList.length; i++) {
            const galleryThumbnailElement = galleryThumbnailsList[i];
            const levelThreeAnchor = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelTwoThumbnail = this.getLevelTwoThumbnail(levelThreeAnchor);
            const thumbnailContainer = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER);
            const levelThreeHref = levelThreeAnchor.href;
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            };
            const galleryThumbnail = new Image();
            galleryThumbnail.setAttribute(Content.DATA_SRC, levelTwoThumbnail.getAttribute(Content.DATA_SRC));
            thumbnailContainer.append(galleryThumbnail);
            // add the last read information next to the button
            const lastReadContainer = Utilities.createTagWithClassName("div", "latest-container");
            const lastRead = Utilities.createTagWithClassName("span", "last-read-gallery");
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);
            const pageNumber = Utilities.createTagWithClassName("span", "gallery-page");
            pageNumber.innerText = (i + 1) + "";
            lastReadContainer.appendChild(pageNumber);
            thumbnailContainer.appendChild(lastReadContainer);
            levelTwoThumbnailContainers.push(thumbnailContainer);
        }
        await this.loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
    }
    // level three
    async loadImages(levelThreeContainer) {
        const levelThreeHref = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null && !this.breakLoop) {
            const imageDocument = await Utilities.getResponseDocument(levelThreeHref);
            // append the image to the container
            const levelThreeImage = this.getLevelThreeImage(imageDocument);
            const image = new Image();
            image.src = levelThreeImage.src;
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            levelThreeContainer.appendChild(image);
            this.setNextAnchor(imageDocument, levelThreeContainer);
            // load the image
            image.onload = async () => {
                await this.loadImages(levelThreeContainer);
            };
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            };
            this.observeImage(image);
        }
    }
    observeImage(image) {
        // observe the image
        const setInfo = (entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const entryTarget = entry.target;
                    const levelThreeHref = entryTarget.getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    localStorage.setItem(levelThreeHref, Date.now() + "");
                    Utilities.updateLastRead(document.getElementById(levelThreeHref));
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
}
class NhManga extends Manga {
    // level one
    getLastReadTwoInnerText(lastReadItemName) {
        return lastReadItemName;
    }
    getLastAvailableOneInnerText() {
        return "Last available:";
    }
    // level two
    loadManga(levelTwoContainer, mangaDocument) {
        levelTwoContainer.style.flexDirection = "column";
        const chapters = this.getMangaCollection(mangaDocument);
        for (const chapter of chapters) {
            const levelThreeAnchor = this.getLevelThreeAnchor(chapter);
            const levelThreeHref = levelThreeAnchor.href;
            // add the chapter button
            const chapterContainer = Utilities.createTagWithClassName("div", "chapter-container");
            chapterContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            chapterContainer.onclick = async () => {
                await this.loadLevelThree(chapterContainer, window.scrollY);
            };
            const chapterButton = Utilities.createTagWithClassName("button", "chapter-button");
            const span = levelThreeAnchor.children[0];
            const maxChapterNameLength = 15;
            chapterButton.innerText = span.innerText.substring(0, maxChapterNameLength);
            chapterContainer.appendChild(chapterButton);
            // add the last read information next to the button
            const lastReadContainer = Utilities.createTagWithClassName("div", "last-read-container");
            const lastRead = Utilities.createTagWithClassName("span", "last-read");
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);
            chapterContainer.appendChild(lastReadContainer);
            levelTwoContainer.appendChild(chapterContainer);
        }
    }
    // level three
    async loadImages(levelThreeContainer) {
        const levelThreeHref = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        const images = await this.getMangaImages(levelThreeHref);
        await this.loadMangaImage(images, levelThreeContainer);
    }
    async getMangaImages(levelThreeHref, retry = true) {
        const images = [];
        const chapter = await Utilities.getResponseDocument(levelThreeHref, retry);
        if (chapter !== null) {
            this.pushImage(chapter, levelThreeHref, images);
        }
        if (images.length > 0) {
            const image = images.pop();
            image.className = Content.OBSERVE_IMAGE;
            images.push(image);
        }
        return images;
    }
    async loadMangaImage(images, levelThreeContainer, index = 0) {
        if (index < images.length && !this.breakLoop) {
            const image = images[index];
            levelThreeContainer.append(image);
            image.src = image.getAttribute(Content.DATA_SRC);
            image.onload = async () => {
                await this.loadMangaImage(images, levelThreeContainer, ++index);
            };
            image.onerror = async () => {
                await Utilities.onImageLoadError(image);
            };
            this.observeImage(image);
        }
        else if (index === images.length) {
            this.loadNextChapter(images, levelThreeContainer);
        }
    }
    observeImage(image) {
        // set the info of the current image
        const setInfo = (entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const observedImage = entry.target;
                    const infoContent = document.querySelector(".info-content");
                    const levelThreeHref = observedImage.getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    infoContent.innerText = levelThreeHref;
                    localStorage.setItem(levelThreeHref, Date.now() + "");
                    Utilities.updateLastRead(document.getElementById(levelThreeHref));
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
    loadNextChapter(images, levelThreeContainer) {
        // load next chapter
        const nextChapter = (entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    observer.unobserve(image);
                    image.removeAttribute(Content.CLASS);
                    const nextChapterHref = Utilities.getNextChapterHref(images[0].getAttribute(Content.DATA_LEVEL_THREE_HREF));
                    const nextChapterImages = await this.getMangaImages(nextChapterHref, false);
                    if (nextChapterImages.length > 0) {
                        await this.loadMangaImage(nextChapterImages, levelThreeContainer);
                    }
                }
            });
        };
        const nextChapterOptions = {
            root: null,
            rootMargin: Content.LOOK_AHEAD
        };
        const nextChapterObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
        const image = document.querySelector(Utilities.PERIOD + Content.OBSERVE_IMAGE);
        nextChapterObserver.observe(image);
    }
}
class TokyoMotion extends Video {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
        return this.searchResultsDocument.querySelector(".prevnext");
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".thumb-popu");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        if (thumbnailCollection.length === 75) { // we are on the landing page
            thumbnailCollection.splice(0, 63); // we need only the last 12 thumbnails
        }
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail;
        const thumbOverlayChildren = levelTwoAnchor.children[0].children;
        const thumbnail = thumbOverlayChildren[0];
        const duration = thumbOverlayChildren[thumbOverlayChildren.length - 1];
        thumbnail.setAttribute(Content.DATA_DURATION, duration.innerText.trim());
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    // level two
    getVideo(videoDocument) {
        return videoDocument.getElementById("vjsplayer");
    }
    getSource(source) {
        let returnedSource = null;
        if (source.src.includes("/hd/")) {
            returnedSource = source.src;
        }
        return returnedSource;
    }
}
class KissJav extends Video {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
        return this.searchResultsDocument.querySelector(".pagination-next");
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelector(".videos").children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        let shouldPushThumbnail = true;
        const cardImageChildren = searchResultsThumbnail.children[0].children[0].children;
        const levelTwoAnchor = cardImageChildren[0].children[0];
        const thumbnail = levelTwoAnchor?.children[0];
        if (thumbnail === undefined) {
            shouldPushThumbnail = false; // it's an ad
        }
        else if (thumbnail.getAttribute(Content.DATA_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
            const duration = cardImageChildren[1];
            const parts = duration.innerText.split("HD");
            thumbnail.setAttribute(Content.DATA_DURATION, parts[parts.length - 1].trim());
        }
        if (shouldPushThumbnail) {
            this.pushThumbnail(thumbnail, levelTwoAnchor);
        }
    }
    // level two
    getVideo(videoDocument) {
        return videoDocument.getElementById("player-fluid");
    }
    getSource(source) {
        let returnedSource = null;
        if (source.src.includes("720p")) {
            returnedSource = source.src;
        }
        return returnedSource;
    }
}
class NHentai extends HManga {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
        return this.searchResultsDocument.querySelector(".next");
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelector(".index-container").children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0];
        const thumbnail = levelTwoAnchor.children[0];
        if (thumbnail.getAttribute(Content.DATA_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    getMangaCollection(mangaDocument) {
        const galleryThumbnailCollection = mangaDocument.querySelector(Utilities.PERIOD + Content.THUMBS).children;
        const thumbnails = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        return thumbnails;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const levelThreeHref = levelThreeAnchor.href;
        const parts = levelThreeHref.split("/");
        return parts[parts.length - 2]; // the penultimate part
    }
    getLastAvailableTwoInnerText(mangaCollection) {
        return "Page " + mangaCollection.length;
    }
    // level two
    removeExtraDiv() {
        // remove a div that gets added from other scripts:
        const removePotential = document.querySelector("body").children[1];
        if (removePotential.getAttribute("style").length === 80) {
            removePotential.remove();
        }
    }
    getLevelTwoThumbnail(levelThreeAnchor) {
        return levelThreeAnchor.children[0];
    }
    // level three
    getLevelThreeImage(imageDocument) {
        return imageDocument.getElementById("image-container").children[0].children[0];
    }
    setNextAnchor(imageDocument, levelThreeContainer) {
        // get the next image document href
        const nextAnchor = imageDocument.querySelector(".next");
        if (nextAnchor.href === Utilities.EMPTY_STRING) { // there's always a .next, but .next.href can be empty
            levelThreeContainer.removeAttribute(Content.DATA_LEVEL_THREE_HREF);
        }
        else {
            levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
    }
}
class AsuraScans extends NhManga {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
        return this.searchResultsDocument.querySelector(".r");
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".imgu");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0];
        const thumbnail = levelTwoAnchor.children[0];
        if (thumbnail.getAttribute(Content.DATA_CFSRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_CFSRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    getMangaCollection(mangaDocument) {
        const nodeChapters = mangaDocument.querySelectorAll(Utilities.PERIOD + Content.EPH_NUM);
        const chapters = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const span = levelThreeAnchor.children[0];
        return span.innerText;
    }
    getLastAvailableTwoInnerText(mangaCollection) {
        const levelThreeAnchor = this.getLevelThreeAnchor(mangaCollection[0]);
        const name = this.getItemName(levelThreeAnchor);
        return Utilities.hyphenateLongWord(name);
    }
    // level two - getMangaCollection and getLevelThreeAnchor from above
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const viewports = [];
        const readerAreaChildren = chapter.getElementById("readerarea").children;
        for (let i = 0; i < readerAreaChildren.length; i++) {
            // find all the indexes of the children that have the class ai-viewport-2
            if (readerAreaChildren[i].getAttribute(Content.CLASS)?.includes("ai-viewport-2")) {
                viewports.push(i);
            }
        }
        for (const viewport of viewports) {
            // the index of the p tags are always 2 more than the index of the viewports
            // the p tag contains only the image
            const parent = readerAreaChildren[viewport + 2];
            if (parent !== undefined) {
                const levelThreeImage = readerAreaChildren[viewport + 2].children[0];
                if (levelThreeImage !== undefined) {
                    const dataCfsrc = levelThreeImage.getAttribute(Content.DATA_CFSRC);
                    if (dataCfsrc !== null) {
                        const image = new Image();
                        image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
                        image.setAttribute(Content.DATA_SRC, levelThreeImage.getAttribute(Content.DATA_CFSRC));
                        images.push(image);
                    }
                }
            }
        }
    }
}
loadContent();
//# sourceMappingURL=Content.js.map
