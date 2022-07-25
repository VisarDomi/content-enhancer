// ==UserScript==
// @name         Content Enhancer
// @namespace    visardomi4@gmail.com
// @version      1.0
// @description  Enhance the content
// @author       Visar Domi
// @match        https://1stkissmanga.io/*
// @run-at       document-start
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
//# sourceMappingURL=Utilities.js.map

class Content {
    constructor(href) {
        this.searchResultsLookAhead = Content.LOOK_AHEAD;
        this.lookAhead = Content.LOOK_AHEAD;
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
                await this.loadThumbnailContainer(thumbnailContainers, container, ++index);
            };
            if (index === thumbnailContainersLength - 1) {
                if (container.id === Content.L1_CONTAINER_ID) {
                    thumbnail.className = Content.OBSERVE_THUMBNAIL;
                }
                else if (container.id === Content.L2_CONTAINER_ID) {
                    thumbnail.className = Content.OBSERVE_GALLERY_THUMBNAIL;
                }
            }
            container.appendChild(thumbnailContainer);
        }
        else if (index === thumbnailContainersLength) {
            if (container.id === Content.L1_CONTAINER_ID) {
                this.observeLastThumbnail();
                for (const thumbnailContainer of thumbnailContainers) {
                    await this.updateThumbnailContainer(thumbnailContainer);
                }
            }
            else if (container.id === Content.L2_CONTAINER_ID && !this.breakLoop) {
                this.observeLastGalleryThumbnail(container);
            }
        }
    }
    observeLastGalleryThumbnail(levelTwoContainer) { }
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
            rootMargin: this.searchResultsLookAhead
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
Content.L1_CONTAINER_ID = "level-one-container";
Content.L2_CONTAINER_ID = "level-two-container";
Content.L3_CONTAINER_ID = "level-three-container";
Content.LOOK_AHEAD = "2000%"; // look ahead 20 screens
Content.DATA_SRC = "data-src";
Content.DATA_CFSRC = "data-cfsrc";
Content.DATA_LAZY_SRC = "data-lazy-src";
Content.DATA_LEVEL_TWO_HREF = "data-level-two-href";
Content.DATA_LEVEL_THREE_HREF = "data-level-three-href";
Content.DATA_DURATION = "data-duration";
Content.LEVEL_ONE_THUMBNAIL_CONTAINER = "level-one-thumbnail-container";
Content.LEVEL_TWO_THUMBNAIL_CONTAINER = "level-two-thumbnail-container";
Content.OBSERVE_THUMBNAIL = "observe-thumbnail";
Content.OBSERVE_GALLERY_THUMBNAIL = "observe-gallery-thumbnail";
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
//# sourceMappingURL=Content.js.map

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
//# sourceMappingURL=Video.js.map

class Manga extends Content {
    // level one
    async updateLevelOne(levelTwoHref, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        this.updateLevelOneManga(mangaDocument, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo);
    }
    updateLevelOneManga(mangaDocument, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
        const mangaCollection = this.getMangaCollection(mangaDocument);
        lastReadOne.innerText = "Never read before";
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
        lastAvailableTwo.innerText = this.getLastAvailableTwoInnerText(mangaDocument);
    }
    // level two
    async loadLevelTwo(searchResultsThumbnailContainer, levelOneScrollPosition) {
        this.breakLoop = false;
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
//# sourceMappingURL=Manga.js.map

class HManga extends Manga {
    constructor() {
        super(...arguments);
        this.nextLevelTwoHref = null;
    }
    // level one
    getLastReadTwoInnerText(lastReadItemName) {
        return "Page " + lastReadItemName;
    }
    getLastAvailableOneInnerText() {
        return "Total pages:";
    }
    // level two
    setNextLevelTwoHref(mangaDocument) {
        this.nextLevelTwoHref = null;
    }
    async loadManga(levelTwoContainer) {
        if (this.nextLevelTwoHref === null) {
            this.nextLevelTwoHref = levelTwoContainer.getAttribute(HManga.DATA_LEVEL_TWO_HREF);
        }
        const mangaDocument = await Utilities.getResponseDocument(this.nextLevelTwoHref);
        this.setNextLevelTwoHref(mangaDocument);
        levelTwoContainer.style.flexDirection = "row";
        levelTwoContainer.style.flexWrap = "wrap";
        const levelTwoThumbnailContainers = [];
        this.removeExtraDiv();
        const galleryThumbnailsList = this.getMangaCollection(mangaDocument);
        for (const galleryThumbnailElement of galleryThumbnailsList) {
            const levelThreeAnchor = this.getLevelThreeAnchor(galleryThumbnailElement);
            const levelTwoThumbnail = this.getLevelTwoThumbnail(levelThreeAnchor);
            const thumbnailContainer = Utilities.createTagWithClassName("div", Content.LEVEL_TWO_THUMBNAIL_CONTAINER);
            const levelThreeHref = levelThreeAnchor.href;
            thumbnailContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            thumbnailContainer.onclick = async () => {
                await this.loadLevelThree(thumbnailContainer, window.scrollY);
            };
            const galleryThumbnail = new Image();
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
//# sourceMappingURL=HManga.js.map

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
        const mangaDocument = await Utilities.getResponseDocument(levelTwoHref);
        const chapters = this.getMangaCollection(mangaDocument);
        const localStorageChapters = [];
        for (const chapter of chapters) {
            const levelThreeAnchor = this.getLevelThreeAnchor(chapter);
            const levelThreeHref = levelThreeAnchor.href;
            // save to localStorage
            localStorageChapters.push(levelThreeHref);
            // add the chapter button
            const chapterContainer = Utilities.createTagWithClassName("div", "chapter-container");
            chapterContainer.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            chapterContainer.onclick = async () => {
                await this.loadLevelThree(chapterContainer, window.scrollY);
            };
            const chapterButton = Utilities.createTagWithClassName("button", "chapter-button");
            const innerText = this.getChapterButtonInnerText(levelThreeAnchor);
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
        localStorage.setItem(levelTwoHref, JSON.stringify(localStorageChapters));
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
                    const currentLevelThreeHref = images[0].getAttribute(Content.DATA_LEVEL_THREE_HREF);
                    const levelTwoHref = document.getElementById(Content.L2_CONTAINER_ID).getAttribute(Content.DATA_LEVEL_TWO_HREF);
                    const localStorageChapters = JSON.parse(localStorage.getItem(levelTwoHref));
                    const nextChapterIndex = localStorageChapters.indexOf(currentLevelThreeHref) - 1;
                    const nextChapterHref = localStorageChapters[nextChapterIndex];
                    if (nextChapterHref) {
                        const nextChapterImages = await this.getMangaImages(nextChapterHref, false);
                        await this.loadMangaImage(nextChapterImages, levelThreeContainer);
                    }
                }
            });
        };
        const nextChapterOptions = {
            root: null,
            rootMargin: this.lookAhead
        };
        const nextChapterObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
        const image = document.querySelector(Utilities.PERIOD + Content.OBSERVE_IMAGE);
        nextChapterObserver.observe(image);
    }
}
//# sourceMappingURL=NhManga.js.map

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
//# sourceMappingURL=TokyoMotion.js.map

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
//# sourceMappingURL=KissJav.js.map

class YtBoob extends Video {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
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
//# sourceMappingURL=YtBoob.js.map

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
        const galleryThumbnailCollection = mangaDocument.querySelector(".thumbs").children;
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
    getLastAvailableTwoInnerText(mangaDocument) {
        const mangaCollection = this.getMangaCollection(mangaDocument);
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
        const levelTwoThumbnail = levelThreeAnchor.children[0];
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(Content.DATA_SRC);
        return levelTwoThumbnail;
    }
    getPageNumber(levelTwoThumbnail) {
        const src = levelTwoThumbnail.getAttribute(NHentai.DATA_SRC);
        const parts = src.split("/");
        const pageNumber = parts[parts.length - 1].split("t.jpg")[0];
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
//# sourceMappingURL=NHentai.js.map

class ExHentai extends HManga {
    constructor(href) {
        super(href);
    }
    // level one
    getAnchor() {
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
    getMangaCollection(mangaDocument) {
        const galleryThumbnailCollection = mangaDocument.querySelectorAll(".gdtl");
        const thumbnails = [];
        thumbnails.splice(0, 0, ...Array.from(galleryThumbnailCollection));
        return thumbnails;
    }
    getLevelThreeAnchor(item) {
        return item.children[0];
    }
    getItemName(levelThreeAnchor) {
        const levelTwoThumbnail = levelThreeAnchor.children[0];
        return levelTwoThumbnail.alt;
    }
    getLastAvailableTwoInnerText(mangaDocument) {
        const children = mangaDocument.querySelectorAll(".gdt2");
        const pages = children[children.length - 2].innerText.split(" ")[0];
        return "Page " + pages;
    }
    // level two
    observeLastGalleryThumbnail(levelTwoContainer) {
        const callback = (entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const thumbnail = entry.target;
                    observer.unobserve(thumbnail);
                    thumbnail.removeAttribute(Content.CLASS);
                    if (this.nextLevelTwoHref !== null) {
                        await this.loadManga(levelTwoContainer);
                    }
                }
            });
        };
        const options = {
            root: null,
            rootMargin: this.lookAhead
        };
        const observer = new IntersectionObserver(callback, options);
        const thumbnail = document.querySelector(Utilities.PERIOD + Content.OBSERVE_GALLERY_THUMBNAIL);
        observer.observe(thumbnail);
    }
    getLevelTwoThumbnail(levelThreeAnchor) {
        return levelThreeAnchor.children[0];
    }
    getPageNumber(levelTwoThumbnail) {
        return levelTwoThumbnail.alt;
    }
    setNextLevelTwoHref(mangaDocument) {
        const children = mangaDocument.querySelector(".ptt").children[0].children[0].children;
        const nextPageChildren = children[children.length - 1].children;
        if (nextPageChildren.length > 0) {
            this.nextLevelTwoHref = nextPageChildren[0].href;
        }
        else {
            this.nextLevelTwoHref = null;
        }
    }
    // level three
    async getLevelThreeImage(imageDocument) {
        // use nl instead of the image
        const nl = imageDocument.getElementById("loadfail").outerHTML.split("nl('")[1].split("'")[0];
        const nlHref = imageDocument.baseURI + "?nl=" + nl;
        const nlDocument = await Utilities.getResponseDocument(nlHref);
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
//# sourceMappingURL=ExHentai.js.map

class KissManga extends NhManga {
    constructor(href) {
        super(href);
        this.searchResultsLookAhead = "500%";
    }
    // level one
    getAnchor() {
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
        if (thumbnail.getAttribute(Content.DATA_LAZY_SRC) !== null) {
            thumbnail.src = thumbnail.getAttribute(Content.DATA_LAZY_SRC);
        }
        this.pushThumbnail(thumbnail, levelTwoAnchor);
    }
    getMangaCollection(mangaDocument) {
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
    getLastAvailableTwoInnerText(mangaDocument) {
        const mangaCollection = this.getMangaCollection(mangaDocument);
        const levelThreeAnchor = this.getLevelThreeAnchor(mangaCollection[0]);
        const name = this.getItemName(levelThreeAnchor);
        return Utilities.hyphenateLongWord(name);
    }
    async updateLevelOne(levelTwoHref, lastReadOne, lastReadTwo, lastAvailableOne, lastAvailableTwo) {
        // yeah well, kissmanga throws a lot of 429s, we need to change the logic
    }
    // level two
    getChapterButtonInnerText(levelThreeAnchor) {
        return levelThreeAnchor.innerText.trim();
    }
    ;
    // level three
    async pushImage(chapter, levelThreeHref, images) {
        const children = chapter.querySelectorAll(".page-break");
        for (const child of children) {
            const levelThreeImage = child.children[0];
            const dataLazySrc = levelThreeImage.getAttribute(Content.DATA_LAZY_SRC);
            const image = new Image();
            image.setAttribute(Content.DATA_LEVEL_THREE_HREF, levelThreeHref);
            image.setAttribute(Content.DATA_SRC, dataLazySrc);
            images.push(image);
        }
    }
}
//# sourceMappingURL=KissManga.js.map

const CSS_INNER_HTML = `
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
    padding-top: 30vh;
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
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion(href);
    }
    else if (href.includes("kissjav")) {
        content = new KissJav(href);
    }
    else if (href.includes("ytboob")) {
        content = new YtBoob(href);
    }
    else if (href.includes("nhentai")) {
        content = new NHentai(href);
    }
    else if (href.includes("exhentai") || href.includes("e-hentai")) {
        content = new ExHentai(href);
    }
    else if (href.includes("kissmanga")) {
        content = new KissManga(href);
    }
    return content;
}
loadContent();
//# sourceMappingURL=main.js.map
