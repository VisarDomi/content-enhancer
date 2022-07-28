// ==UserScript==
// @name         Content Enhancer
// @namespace    visardomi4@gmail.com
// @version      1.3
// @description  2022-07-28
// @author       Visar Domi
// @source       https://github.com/VisarDomi/content-enhancer
// @updateURL    https://raw.githubusercontent.com/VisarDomi/content-enhancer/main/userscript-content-enhancer.js
// @downloadURL  https://raw.githubusercontent.com/VisarDomi/content-enhancer/main/userscript-content-enhancer.js
// @supportURL   https://github.com/VisarDomi/content-enhancer/issues
// @run-at       document-start
// @match        https://1stkissmanga.io/*
// @match        https://www.mcreader.net/*
// @match        https://mangahub.io/*
// @match        https://www.readm.org/*
// @match        https://isekaiscan.com/*
// @grant        none
// @match        https://www.tokyomotion.net/*
// @match        https://kissjav.li/*
// @match        https://ytboob.com/*
// @match        https://nhentai.net/*
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// ==/UserScript==

class Utilities {
    static async getResponseDocument(href, retry = true) {
        const response = await this.getResponse(href, retry);
        let returnedDocument = null;
        if (response !== null) {
            const text = await response.text();
            returnedDocument = new DOMParser().parseFromString(text, "text/html");
            const base = document.createElement("base");
            base.href = href;
            returnedDocument.head.appendChild(base);
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
            failedHref.waitTime += this.randomNumber(0, 1000); // the base wait time is between one and two seconds
            if (failedHref.href === href) { // the request has previously failed
                failedHref.waitTime *= this.randomNumber(2, 3); // double the wait time (on average) for each failed attempt
            }
            failedHref.href = href; // save the failed request
            await this.waitFor(failedHref.waitTime);
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
}
Utilities.EMPTY_STRING = "";
Utilities.SPACE = " ";
Utilities.HYPHEN = "-";
Utilities.PERIOD = ".";

class Content {
    constructor(href, fullscreen = false) {
        this.href = href;
        this.fullscreen = fullscreen;
    }
    async init() {
        document.write("<html><head></head><body></body></html>");
        const body = document.querySelector("body");
        const head = document.querySelector("head");
        const levelOneContainer = Utilities.createTagWithId("div", Content.L1_CONTAINER_ID);
        body.appendChild(levelOneContainer);
        const styleTag = Utilities.createTagWithId("style", "content-enhancer-css");
        styleTag.innerHTML = Content.CSS_INNER_HTML;
        head.appendChild(styleTag);
        if (this.fullscreen) {
            await this.loadFullscreen();
        }
        else {
            await this.load();
        }
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
        const anchor = this.getNextSearchResultsAnchor();
        if (anchor && anchor.href !== undefined) {
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
        const levelTwoHref = levelTwoAnchor.href;
        thumbnailContainer.setAttribute(Content.DATA_LEVEL_TWO_HREF, levelTwoHref);
        const thumbnail = new Image();
        const latestContainer = Utilities.createTagWithClassName("div", "latest-container");
        const lastWatched = Utilities.createTagWithClassName("div", "last-watched-element");
        const lastAvailable = Utilities.createTagWithClassName("div", "last-available-element");
        const lastWatchedOne = Utilities.createTagWithId("div", Content.LAST_WATCHED_1 + levelTwoHref);
        lastWatchedOne.innerText = Content.LOADING___;
        const lastWatchedTwo = Utilities.createTagWithId("div", Content.LAST_WATCHED_2 + levelTwoHref);
        lastWatchedTwo.innerText = Content.LOADING___;
        const lastAvailableOne = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_1 + levelTwoHref);
        lastAvailableOne.innerText = Content.LOADING___;
        const lastAvailableTwo = Utilities.createTagWithId("div", Content.LAST_AVAILABLE_2 + levelTwoHref);
        lastAvailableTwo.innerText = Content.LOADING___;
        this.saveDuration(levelOneThumbnail, lastAvailableTwo);
        this.saveLastAvailableTwo(levelTwoAnchor);
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
    saveLastAvailableTwo(levelTwoAnchor) {
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
                await this.loadThumbnailContainer(thumbnailContainers, container, ++index);
            };
            if (index === thumbnailContainersLength - 1) {
                thumbnail.className = Content.OBSERVE_THUMBNAIL;
            }
            container.appendChild(thumbnailContainer);
        }
        else {
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
    // level three - the fullscreen experience
    async loadFullscreen() {
        localStorage.setItem(this.href, Date.now() + "");
        const levelOneContainer = document.getElementById(Content.L1_CONTAINER_ID);
        const levelTwoHref = localStorage.getItem(Content.LEVEL_TWO_HREF + this.href);
        const srcs = JSON.parse(localStorage.getItem(Content.SOURCES + levelTwoHref));
        // the things above can be sent to exhentai
        for (const src of srcs) {
            const image = document.createElement("img");
            image.src = src;
            image.loading = "lazy";
            levelOneContainer.appendChild(image);
        }
        const pOne = document.createElement("p");
        levelOneContainer.appendChild(pOne);
        pOne.innerText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.`;
        const pTwo = document.createElement("p");
        levelOneContainer.appendChild(pTwo);
        pTwo.innerText = `Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.`;
        const pThree = document.createElement("p");
        levelOneContainer.appendChild(pThree);
        pThree.innerText = `Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus.`;
        const pFour = document.createElement("p");
        levelOneContainer.appendChild(pFour);
        pFour.innerText = `Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa.`;
        const pFive = document.createElement("p");
        levelOneContainer.appendChild(pFive);
        pFive.innerText = `Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales.`;
        const pSix = document.createElement("p");
        levelOneContainer.appendChild(pSix);
        pSix.innerText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.`;
        const pSeven = document.createElement("p");
        levelOneContainer.appendChild(pSeven);
        pSeven.innerText = `Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.`;
        const pEight = document.createElement("p");
        levelOneContainer.appendChild(pEight);
        pEight.innerText = `Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus.`;
        const pNine = document.createElement("p");
        levelOneContainer.appendChild(pNine);
        pNine.innerText = `Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa.`;
        const pTen = document.createElement("p");
        levelOneContainer.appendChild(pTen);
        pTen.innerText = `Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales.`;
    }
}
Content.CSS_INNER_HTML = `
/* level 1 */
body {
    margin: 0;
    background-color: black;
    font-family: -apple-system, sans-serif;
}

img, video {
    display: block;
    width: 100%;
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
#level-two-container {
    padding: 30vh 0;
}

.go-back-manga, .go-back {
    width: 100%;
    height: 30vh;
    background-color: hsl(0, 50%, 25%);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;
}

.go-back-manga {
    opacity: 0.5;
}

.chapter-button {
    font-size: 1.2rem;
    line-height: 3;
    text-align: center;
    width: 100%;
}

.chapter-container {
    display: flex;
    font-size: 1.2rem;
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
    color: white;
    line-height: 2;
    margin: 20px;
}
`;
Content.L1_CONTAINER_ID = "level-one-container";
Content.L2_CONTAINER_ID = "level-two-container";
Content.L3_CONTAINER_ID = "level-three-container";
Content.LOOK_AHEAD = "2000%"; // look ahead 20 screens
Content.DATA_SRC = "data-src";
Content.DATA_LEVEL_TWO_HREF = "data-level-two-href";
Content.DATA_LEVEL_THREE_HREF = "data-level-three-href";
Content.DATA_DURATION = "data-duration";
Content.LEVEL_ONE_THUMBNAIL_CONTAINER = "level-one-thumbnail-container";
Content.LEVEL_TWO_THUMBNAIL_CONTAINER = "level-two-thumbnail-container";
Content.OBSERVE_THUMBNAIL = "observe-thumbnail";
Content.OBSERVE_IMAGE = "observe-image";
Content.LAST_WATCHED_1 = "last-watched-one";
Content.LAST_WATCHED_2 = "last-watched-two";
Content.LAST_AVAILABLE_1 = "last-available-one";
Content.LAST_AVAILABLE_2 = "last-available-two";
Content.CLASS = "class";
Content.BLOCK = "block";
Content.FLEX = "flex";
Content.NONE = "none";
Content.LOADING___ = "Loading...";
Content.SOURCES = "sources";
Content.LEVEL_THREE_HREFS = "level-three-hrefs";
Content.ITEM_NAME = "item-name";
Content.LAST_AVAILABLE = "last-available";
Content.LEVEL_TWO_HREF = "level-two-href";

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
    // level two - it doesn't exist for videos
    async loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
        searchResultsThumbnailContainer.onclick = null;
        const levelTwoHref = searchResultsThumbnailContainer.getAttribute(Content.DATA_LEVEL_TWO_HREF);
        const levelTwoVideo = this.createLevelTwoVideo();
        const bestSource = await this.getBestSource(levelTwoHref);
        levelTwoVideo.appendChild(bestSource);
        const length = searchResultsThumbnailContainer.children.length;
        searchResultsThumbnailContainer.children[length - 1].remove(); // remove the last child.
        searchResultsThumbnailContainer.appendChild(levelTwoVideo);
        // update last watched
        const lastWatchedOne = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref);
        setInterval(() => {
            const video = {
                lastWatched: Date.now(),
                currentTime: levelTwoVideo.currentTime
            };
            localStorage.setItem(levelTwoHref, JSON.stringify(video));
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement);
        }, 1000);
    }
    createLevelTwoVideo() {
        const levelTwoVideo = document.createElement("video");
        levelTwoVideo.controls = true;
        levelTwoVideo.muted = true;
        levelTwoVideo.autoplay = true;
        levelTwoVideo.playsInline = true;
        levelTwoVideo.onerror = async () => {
            levelTwoVideo.onerror = null;
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
        lastAvailableOne.innerText = this.getLastAvailableOneInnerText();
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(levelTwoHref);
        lastReadOne.innerText = "Never read before";
        lastReadTwo.innerText = "New";
        try {
            const levelThreeHrefs = JSON.parse(localStorage.getItem(Content.LEVEL_THREE_HREFS + levelTwoHref));
            const readCollection = [];
            for (const levelThreeHref of levelThreeHrefs) {
                const lastRead = parseInt(localStorage.getItem(levelThreeHref));
                if (lastRead) {
                    readCollection.push({
                        name: localStorage.getItem(Content.ITEM_NAME + levelThreeHref),
                        lastRead
                    });
                }
            }
            const lastReadItem = readCollection.reduce(Utilities.getLastReadChapter);
            if (lastReadItem) {
                lastReadOne.innerText = "Read: " + Utilities.getTimeAgo(lastReadItem.lastRead + "");
                lastReadTwo.innerText = this.getLastReadTwoInnerText(lastReadItem.name);
            }
        }
        catch (ignored) {
        }
    }
    getLastAvailableTwoInnerText(levelTwoHref) {
        return localStorage.getItem(Content.LAST_AVAILABLE + levelTwoHref);
    }
    // level two
    async loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
        this.breakLoop = false;
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
            this.breakLoop = true;
            document.getElementById(Content.L1_CONTAINER_ID).style.display = Content.BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            window.scrollTo({ top: levelOneScrollPosition });
            const lastWatchedOne = document.getElementById(Content.LAST_WATCHED_1 + levelTwoHref);
            this.updateThumbnailContainer(lastWatchedOne.parentElement.parentElement.parentElement); // do this asynchronously
        };
        levelTwoContainer.appendChild(backButton);
        // get the gallery thumbnails
        await this.loadManga(levelTwoContainer);
    }
    // level three
    async loadLevelThree(elementContainer, levelTwoScrollPosition, infoClicked = false) {
        this.breakLoop = false;
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
    async loadManga(levelTwoContainer) {
        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers = [];
        this.removeExtraDiv();
        const levelTwoHref = levelTwoContainer.getAttribute(HManga.DATA_LEVEL_TWO_HREF);
        const galleryThumbnailsList = await this.getMangaCollection(levelTwoHref);
        const levelThreeHrefs = [];
        for (const galleryThumbnailElement of galleryThumbnailsList) {
            const levelThreeAnchor = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelThreeHref = levelThreeAnchor.href;
            // save to localStorage
            levelThreeHrefs.push(levelThreeHref);
            localStorage.setItem(Content.ITEM_NAME + levelThreeHref, this.getItemName(levelThreeAnchor));
            // add the thumbnail container
            const thumbnailContainer = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER);
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            };
            const galleryThumbnail = new Image();
            const levelTwoThumbnail = this.getLevelTwoThumbnail(levelThreeAnchor);
            galleryThumbnail.setAttribute(Content.DATA_SRC, levelTwoThumbnail.src);
            thumbnailContainer.append(galleryThumbnail);
            // add the last read information next to the button
            const lastReadContainer = Utilities.createTagWithClassName("div", "latest-container");
            const lastRead = Utilities.createTagWithClassName("span", "last-read-gallery");
            lastRead.id = levelThreeHref;
            Utilities.updateLastRead(lastRead);
            lastReadContainer.appendChild(lastRead);
            const pageNumber = Utilities.createTagWithClassName("span", "gallery-page");
            pageNumber.innerText = this.getPageNumber(levelTwoThumbnail);
            lastReadContainer.appendChild(pageNumber);
            thumbnailContainer.appendChild(lastReadContainer);
            levelTwoThumbnailContainers.push(thumbnailContainer);
        }
        localStorage.setItem(Content.LEVEL_THREE_HREFS + levelTwoHref, JSON.stringify(levelThreeHrefs));
        await this.loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
    }
    removeExtraDiv() { }
    // level three
    async loadImages(levelThreeContainer) {
        const levelThreeHref = levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null && !this.breakLoop) {
            const imageDocument = await Utilities.getResponseDocument(levelThreeHref);
            // append the image to the container
            const levelThreeImage = await this.getLevelThreeImage(imageDocument);
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
    async loadManga(levelTwoContainer) {
        levelTwoContainer.style.flexDirection = "column";
        const levelTwoHref = levelTwoContainer.getAttribute(NhManga.DATA_LEVEL_TWO_HREF);
        const chapters = await this.getMangaCollection(levelTwoHref);
        const levelThreeHrefs = [];
        for (const chapter of chapters) {
            const levelThreeAnchor = this.getLevelThreeAnchor(chapter);
            const levelThreeHref = levelThreeAnchor.href;
            // save to localStorage
            levelThreeHrefs.push(levelThreeHref);
            const itemName = this.getItemName(levelThreeAnchor);
            localStorage.setItem(Content.ITEM_NAME + levelThreeHref, itemName);
            // add the chapter button
            const chapterContainer = Utilities.createTagWithClassName("div", "chapter-container");
            chapterContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            chapterContainer.onclick = async () => {
                await this.loadLevelThree(chapterContainer, window.scrollY);
            };
            const chapterButton = Utilities.createTagWithClassName("button", "chapter-button");
            const innerText = itemName;
            const maxChapterNameLength = 15;
            chapterButton.innerText = innerText.substring(0, maxChapterNameLength);
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
        localStorage.setItem(Content.LEVEL_THREE_HREFS + levelTwoHref, JSON.stringify(levelThreeHrefs));
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
            await this.pushImage(chapter, levelThreeHref, images);
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
    loadNextChapter(images, levelThreeContainer) {
        // load next chapter
        const nextChapter = (entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    observer.unobserve(image);
                    image.removeAttribute(Content.CLASS);
                    const currentLevelThreeHref = images[0].getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    const levelTwoHref = document.getElementById(Content.L2_CONTAINER_ID).getAttribute(Content.DATA_LEVEL_TWO_HREF);
                    const levelThreeHrefs = JSON.parse(localStorage.getItem(Content.LEVEL_THREE_HREFS + levelTwoHref));
                    const nextChapterIndex = levelThreeHrefs.indexOf(currentLevelThreeHref) - 1;
                    const nextChapterHref = levelThreeHrefs[nextChapterIndex];
                    if (nextChapterHref) {
                        const nextChapterImages = await this.getMangaImages(nextChapterHref, false);
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

class KissJav extends Video {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
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

class TokyoMotion extends Video {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
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

class YtBoob extends Video {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        return this.searchResultsDocument.querySelectorAll(".pagination-nav")[1].children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".videos-list")[1].children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0];
        const thumbOverlayChildren = levelTwoAnchor.children[0].children;
        const thumbnail = thumbOverlayChildren[0];
        const duration = thumbOverlayChildren[thumbOverlayChildren.length - 1];
        thumbnail.setAttribute(Content.DATA_DURATION, duration.innerText.trim());
        if (thumbnail.src.match(/\.gif/g)) {
            thumbnail.src = thumbnail.getAttribute(YtBoob.DATA_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    // level two
    getVideo(videoDocument) {
        return videoDocument.getElementById("wpst-video");
    }
    getSource(source) {
        return source.src;
    }
}

class ExHentai extends HManga {
    constructor(fullscreen = false) {
        super(location.href, fullscreen);
    }
    // level one
    getNextSearchResultsAnchor() {
        return this.searchResultsDocument.querySelector(".ptb").children[0].children[0].children[10].children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelector(".itg.gld").children;
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[1].children[0];
        const thumbnail = levelTwoAnchor.children[0];
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const totalPages = levelTwoAnchor.parentElement.parentElement.querySelector(".ir").parentElement.children[1];
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, totalPages.innerText);
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const children = [...mangaDocument.querySelector(".ptt").children[0].children[0].children];
        children.pop();
        children.shift(); // the first and last element are < and > (which are not needed)
        const responses = [mangaDocument];
        if (children.length > 1) {
            const lastIndex = children.length - 1;
            const lastChild = children[lastIndex];
            const anchor = lastChild.children[0];
            const lastHref = anchor.href;
            const SEPARATOR = "?p=";
            const pageFormat = lastHref.split(SEPARATOR)[0] + SEPARATOR;
            const lastPage = parseInt(lastHref.split(SEPARATOR)[1]);
            const promises = [];
            for (let index = 1; index < lastPage + 1; index++) {
                const pagePromise = Utilities.getResponseDocument(pageFormat + index);
                promises.push(pagePromise);
            }
            responses.push(...await Promise.all(promises)); // parallel requests)
        }
        const thumbnails = [];
        for (const pageDocument of responses) {
            const galleryThumbnailCollection = pageDocument.querySelectorAll(".gdtl");
            const pageThumbnails = [];
            pageThumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
            thumbnails.push(...pageThumbnails);
        }
        return thumbnails;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const levelTwoThumbnail = levelThreeAnchor.children[0];
        return levelTwoThumbnail.alt;
    }
    getLevelTwoThumbnail(levelThreeAnchor) {
        return levelThreeAnchor.children[0];
    }
    getPageNumber(levelTwoThumbnail) {
        return levelTwoThumbnail.alt;
    }
    // level three - it does not exist for exhentai (because of the fullscreen experience)
    async loadLevelThree(elementContainer, levelTwoScrollPosition, infoClicked = false) {
        const levelThreeHref = elementContainer.getAttribute(ExHentai.DATA_LEVEL_THREE_HREF);
        const levelTwoContainer = document.getElementById(ExHentai.L2_CONTAINER_ID);
        const levelTwoHref = levelTwoContainer.getAttribute(ExHentai.DATA_LEVEL_TWO_HREF);
        localStorage.setItem(Content.LEVEL_TWO_HREF + levelThreeHref, levelTwoHref);
        const levelThreeHrefs = JSON.parse(localStorage.getItem(Content.LEVEL_THREE_HREFS + levelTwoHref));
        let index = levelThreeHrefs.indexOf(levelThreeHref);
        const promises = [];
        for (index; index < levelThreeHrefs.length; index++) {
            const levelThreeHref = levelThreeHrefs[index];
            const promise = Utilities.getResponseDocument(levelThreeHref);
            promises.push(promise);
        }
        const responses = await Promise.all(promises); // parallel requests everywhere
        const nlPromises = [];
        for (const response of responses) {
            const nlPromise = Utilities.getResponseDocument(this.getNlHref(response));
            nlPromises.push(nlPromise);
        }
        const nlResponses = await Promise.all(nlPromises); // parallel requests everywhere
        const srcs = [];
        for (const nlResponse of nlResponses) {
            const nlImage = nlResponse.getElementById("img");
            srcs.push(nlImage.src);
        }
        localStorage.setItem(Content.SOURCES + levelTwoHref, JSON.stringify(srcs));
        window.open(levelThreeHref, levelTwoHref);
    }
    getNlHref(response) {
        const nl = response.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        return response.baseURI + "?nl=" + nl;
    }
    async getLevelThreeImage(imageDocument) {
        const nlDocument = await Utilities.getResponseDocument(this.getNlHref(imageDocument));
        return nlDocument.getElementById("i3").children[0].children[0];
    }
    setNextAnchor(imageDocument, levelThreeContainer) {
        // get the next image document href
        const nextAnchor = imageDocument.getElementById("next");
        if (nextAnchor.href === levelThreeContainer.getAttribute(Content.DATA_LEVEL_THREE_HREF)) {
            levelThreeContainer.removeAttribute(Content.DATA_LEVEL_THREE_HREF);
        }
        else {
            levelThreeContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, nextAnchor.href);
        }
    }
}

class NHentai extends HManga {
    constructor(fullscreen = false) {
        super(location.href, fullscreen);
    }
    // level one
    getNextSearchResultsAnchor() {
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
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const galleryThumbnailCollection = mangaDocument.querySelector(".thumbs").children;
        const thumbnails = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        const names = mangaDocument.querySelectorAll(".name");
        const totalPages = names.item(names.length - 1);
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoHref, totalPages.innerText);
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
    getLastAvailableTwoInnerText(levelTwoHref) {
        const lastAvailableTwoInnerText = localStorage.getItem(Content.LAST_AVAILABLE + levelTwoHref);
        return lastAvailableTwoInnerText ? lastAvailableTwoInnerText : "Unknown";
    }
    removeExtraDiv() {
        // remove a div that gets added from other scripts:
        const removePotential = document.querySelector("body").children[1];
        if (removePotential.getAttribute("style").length === 80) {
            removePotential.remove();
        }
    }
    getLevelTwoThumbnail(levelThreeAnchor) {
        const levelTwoThumbnail = levelThreeAnchor.children[0];
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(Content.DATA_SRC);
        return levelTwoThumbnail;
    }
    getPageNumber(levelTwoThumbnail) {
        const src = levelTwoThumbnail.getAttribute(NHentai.DATA_SRC);
        const parts = src.split("/");
        let pageNumber = parts[parts.length - 1].split("t.jpg")[0];
        if (pageNumber.includes("t.png")) {
            pageNumber = parts[parts.length - 1].split("t.png")[0];
        }
        return pageNumber;
    }
    // level three
    async getLevelThreeImage(imageDocument) {
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

class KissManga extends NhManga {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        return this.searchResultsDocument.querySelector(".nextpostslink");
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".item-thumb");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0];
        const thumbnail = levelTwoAnchor.children[0];
        if (thumbnail.getAttribute(KissManga.DATA_LAZY_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(KissManga.DATA_LAZY_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const lastChapter = levelTwoAnchor.parentElement.parentElement.querySelector(".btn-link");
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, lastChapter.innerText);
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters = mangaDocument.querySelector(".main").children;
        const chapters = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        return levelThreeAnchor.innerText.trim();
    }
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const children = chapter.querySelectorAll(".page-break");
        for (const child of children) {
            const levelThreeImage = child.children[0];
            const dataLazySrc = levelThreeImage.getAttribute(KissManga.DATA_LAZY_SRC);
            const image = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, dataLazySrc);
            images.push(image);
        }
    }
}
KissManga.DATA_LAZY_SRC = "data-lazy-src";

class MangaHub extends NhManga {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        return this.searchResultsDocument.querySelector(".next").children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".media");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0].children[0];
        const thumbnail = levelTwoAnchor.children[0];
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const anchor = levelTwoAnchor.parentElement.parentElement.children[1].children[1].children[0];
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, anchor.innerText);
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters = mangaDocument.querySelectorAll(".list-group-item");
        const chapters = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const chapterTitle = levelThreeAnchor.children[0].children[0];
        return chapterTitle.innerText;
    }
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const imageElement = chapter.querySelector("#mangareader").children[0].children[1].children[1];
        const baseFormat = imageElement.src.split("1.jpg")[0];
        const levelThreeContainer = document.getElementById(Content.L3_CONTAINER_ID);
        const TEMPORARY = "temporary";
        const tempContainer = Utilities.createTagWithId("div", TEMPORARY);
        levelThreeContainer.appendChild(tempContainer);
        const tempImages = [];
        for (let i = 1; i < 100; i++) { // 1000 requests are too much (don't spam the server)
            const src = baseFormat + i + ".jpg";
            const image = new Image();
            image.src = src;
            const pushedImage = { i, src, loading: true };
            tempImages.push(pushedImage);
            tempContainer.appendChild(image);
            image.onload = () => {
                tempImages[tempImages.indexOf(pushedImage)].loading = false;
            };
            image.onerror = () => {
                tempImages.splice(tempImages.indexOf(pushedImage), 1);
            };
        }
        let stillLoading = true;
        while (stillLoading) { // polling - a better structure is to use notification events
            await Utilities.waitFor(100);
            const filtered = tempImages.filter(item => item.loading);
            if (filtered.length === 0) {
                stillLoading = false; // break out of the loop if all the items are loaded
            }
        }
        tempContainer.remove();
        // now the list of tempImages can be pushed
        for (const tempImage of tempImages) {
            const image = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, tempImage.src);
            images.push(image);
        }
    }
}

class McReader extends NhManga {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        const paginationChildren = this.searchResultsDocument.querySelector(".pagination").children;
        return paginationChildren[paginationChildren.length - 1].children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".novel-item");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.children[0];
        const thumbnail = levelTwoAnchor.children[0].children[0].children[0];
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const novelStats = levelTwoAnchor.querySelector(".novel-stats").children[0];
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, novelStats.innerText);
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters = mangaDocument.querySelector(".chapter-list").children;
        const chapters = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const chapterTitle = levelThreeAnchor.querySelector(".chapter-title");
        return chapterTitle.innerText.trim();
    }
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const chapterReader = chapter.querySelector("#chapter-reader");
        const levelThreeImages = chapterReader.querySelectorAll("img");
        for (const levelThreeImage of levelThreeImages) {
            if (levelThreeImage.id.includes("image")) {
                const image = new Image();
                image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
                image.setAttribute(Content.DATA_SRC, levelThreeImage.src);
                images.push(image);
            }
        }
    }
}

class ReadM extends NhManga {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        const paginationChildren = this.searchResultsDocument.querySelector(".pagination").children;
        return paginationChildren[paginationChildren.length - 2].children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const selectedElements = this.searchResultsDocument.querySelectorAll(".segment-poster-sm");
        thumbnailCollection.splice(0, 0, ...Array.from(selectedElements));
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.querySelector("a");
        const thumbnail = searchResultsThumbnail.querySelector("img");
        thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const chapters = levelTwoAnchor.parentElement.parentElement.querySelector(".chapters").children[0].children[0];
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, chapters.innerText);
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const episodesLists = mangaDocument.querySelectorAll(".episodes-list");
        const chapters = [];
        for (const episodeList of episodesLists) {
            const partialChapters = episodeList.children[0].children;
            for (const chapter of partialChapters) {
                chapters.push(chapter);
            }
        }
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.querySelector("a");
    }
    getItemName(levelThreeAnchor) {
        return levelThreeAnchor.innerText;
    }
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const chapterImages = chapter.querySelector(".ch-images");
        const levelThreeImages = chapterImages.querySelectorAll("img");
        for (const levelThreeImage of levelThreeImages) {
            const image = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, levelThreeImage.src);
            images.push(image);
        }
    }
}

class IsekaiScan extends NhManga {
    constructor() {
        super(location.href);
    }
    // level one
    getNextSearchResultsAnchor() {
        return this.searchResultsDocument.querySelector(".nav-previous").children[0];
    }
    getSearchResultsThumbnails() {
        const thumbnailCollection = [];
        const pageListingItem = this.searchResultsDocument.querySelectorAll(".page-listing-item");
        for (const item of pageListingItem) {
            const selectedElements = item.querySelectorAll(".badge-pos-1");
            for (const element of selectedElements) {
                thumbnailCollection.push(element);
            }
        }
        return thumbnailCollection;
    }
    appendThumbnailContainer(searchResultsThumbnail) {
        const levelTwoAnchor = searchResultsThumbnail.querySelector("a");
        const thumbnail = searchResultsThumbnail.querySelector("img");
        const dataSrcSet = thumbnail.getAttribute("data-srcset");
        if (dataSrcSet !== null) {
            const parts = dataSrcSet.split(",");
            thumbnail.src = parts[parts.length - 1].split(" ")[1];
        }
        else {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    saveLastAvailableTwo(levelTwoAnchor) {
        const latestChapter = levelTwoAnchor.parentElement.nextElementSibling.querySelectorAll("a").item(1);
        localStorage.setItem(Content.LAST_AVAILABLE + levelTwoAnchor.href, latestChapter.innerText.trim());
    }
    // level two
    async getMangaCollection(levelTwoHref) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const nodeChapters = mangaDocument.querySelectorAll(".wp-manga-chapter");
        const chapters = [];
        chapters.splice(0, 0, ...Array.from(nodeChapters));
        return chapters;
    }
    getLevelThreeAnchor(item) {
        return item.querySelector("a");
    }
    getItemName(levelThreeAnchor) {
        return levelThreeAnchor.innerText.trim();
    }
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const imageContainers = chapter.querySelector(".read-container").querySelectorAll(".page-break.no-gaps");
        for (const imageContainer of imageContainers) {
            const image = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, imageContainer.children[0].getAttribute(Content.DATA_SRC).trim());
            images.push(image);
        }
    }
}

async function load() {
    const href = location.href;
    let content = null;
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion();
    }
    else if (href.includes("kissjav")) {
        content = new KissJav();
    }
    else if (href.includes("ytboob")) {
        content = new YtBoob();
    }
    else if (href.includes("nhentai") && !href.includes("__cf_chl_rt_tk")) {
        if (href.match(/\//g).length !== 6) {
            content = new NHentai();
        }
        else {
            content = new NHentai(true);
        }
    }
    else if (href.includes("exhentai") || href.includes("e-hentai") && !href.includes(".php")) {
        if (href.match(/\//g).length !== 5) {
            content = new ExHentai();
        }
        else {
            content = new ExHentai(true);
        }
    }
    else if (href.includes("kissmanga")) {
        content = new KissManga();
    }
    else if (href.includes("mcreader")) {
        content = new McReader();
    }
    else if (href.includes("mangahub")) {
        content = new MangaHub();
    }
    else if (href.includes("readm")) {
        content = new ReadM();
    }
    else if (href.includes("isekaiscan")) {
        content = new IsekaiScan();
    }
    await content?.init();
}
load();
