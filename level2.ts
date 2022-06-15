const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";
const LEVEL_TWO_THUMBNAIL_CONTAINER: string = "level-two-thumbnail-container";
const BLOCK: string = "block";

async function loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnailContainer, levelOneScrollPosition);
    } else if (ORIGINAL_HREF.includes(NHENTAI) || ORIGINAL_HREF.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnailContainer, levelOneScrollPosition);
    }
}


async function loadVideo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const levelOneContainer: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;
    const videoLoaded: boolean = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading: boolean = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        window.scrollTo({top: 0});
        searchResultsThumbnailContainer.removeAttribute(DATA_LOAD_STATUS); // remove the load status
        levelOneContainer.style.display = NONE; // hide level 1
        document.getElementById(levelTwoHref).style.display = BLOCK; // show level 2
    } else if (!videoLoading) {
        // after the first click, the video's load status is loading
        searchResultsThumbnailContainer.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnailContainer.className = LEVEL_ONE_THUMBNAIL_CONTAINER + SPACE + LOADING; // TODO: use localstorage to remember watched videos

        // create level 2
        const levelTwoContainer: HTMLDivElement = createTagWithId("div", levelTwoHref) as HTMLDivElement;
        levelTwoContainer.style.display = NONE;
        document.querySelector("body").appendChild(levelTwoContainer);

        const levelTwoVideo = createLevelTwoVideo(searchResultsThumbnailContainer);
        const bestSource = await getBestSource(levelTwoHref);
        levelTwoVideo.appendChild(bestSource);
        levelTwoContainer.appendChild(levelTwoVideo);

        // the go back button
        const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-one") as HTMLDivElement;
        backButton.className = "go-back-video";
        backButton.onclick = () => {
            levelOneContainer.style.display = BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            searchResultsThumbnailContainer.className = LEVEL_ONE_THUMBNAIL_CONTAINER;
            window.scrollTo({top: levelOneScrollPosition});
        }
        levelTwoContainer.appendChild(backButton);

        // refresh should be at the end of the page
        const refresh: HTMLButtonElement = createTagWithClassName("button", "refresh") as HTMLButtonElement;
        refresh.type = "button";
        refresh.onclick = () => {
            levelTwoVideo.scrollIntoView();
            levelTwoVideo.load();
        };
        refresh.innerText = "Reload the video";
        levelTwoContainer.appendChild(refresh);
    }
}

function createLevelTwoVideo(searchResultsThumbnailContainer: HTMLDivElement): HTMLVideoElement {
    // the video
    const levelTwoVideo: HTMLVideoElement = document.createElement("video");
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
    }
    levelTwoVideo.onerror = async () => {
        await waitFor(randomNumber(5000, 10000));
        levelTwoVideo.load();
    }

    return levelTwoVideo;
}

async function getBestSource(levelTwoHref: string): Promise<HTMLSourceElement> {
    // the source
    const levelTwoSource: HTMLSourceElement = document.createElement("source");
    const videoDocument: Document = await getResponseDocument(levelTwoHref);
    let video: HTMLVideoElement;
    if (levelTwoHref.includes(TOKYOMOTION)) {
        video = videoDocument.getElementById("vjsplayer") as HTMLVideoElement;
    } else if (levelTwoHref.includes(KISSJAV)) {
        video = videoDocument.getElementById("player-fluid") as HTMLVideoElement;
    }
    const sources: NodeListOf<HTMLSourceElement> = video.querySelectorAll("source") as NodeListOf<HTMLSourceElement>;
    // select the best source
    let bestSource: string = null;
    for (const source of sources) {
        if (ORIGINAL_HREF.includes(TOKYOMOTION) && source.src.includes("/hd/")) {
            bestSource = source.src;
        } else if (ORIGINAL_HREF.includes(KISSJAV) && source.src.includes("720p")) {
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


async function loadManga(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    window.scrollTo({top: 0});
    // create level 2
    const levelTwoHref: string = searchResultsThumbnailContainer.getAttribute(DATA_LEVEL_TWO_HREF);
    const levelTwoContainer: HTMLDivElement = createTagWithId("div", L2_CONTAINER_ID) as HTMLDivElement;
    levelTwoContainer.setAttribute(DATA_LEVEL_TWO_HREF, levelTwoHref); // TODO: delete?
    levelTwoContainer.style.display = FLEX;
    document.querySelector("body").appendChild(levelTwoContainer);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-one") as HTMLDivElement;
    backButton.className = "go-back-manga";
    backButton.onclick = () => {

        // update level one chapter information
        const levelThreeHref: string = levelTwoContainer.getAttribute(DATA_LEVEL_THREE_HREF);
        if (levelThreeHref !== null) {
            const lastRead: HTMLSpanElement = document.getElementById(levelThreeHref) as HTMLDivElement;
            let lastReadTwoInnerText: string;
            if (ORIGINAL_HREF.includes(NHENTAI)) {
                const parts: string[] = levelThreeHref.split("/");
                lastReadTwoInnerText = "Page " + parts[parts.length - 2]; // the penultimate part
            } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
                const chapterButton: HTMLButtonElement = lastRead.parentElement.parentElement.getElementsByTagName("button")[0];
                lastReadTwoInnerText = chapterButton.innerText;
            }
            const lastReadOne: HTMLSpanElement = document.getElementById(LAST_READ_1 + levelTwoHref) as HTMLDivElement;
            lastReadOne.innerText = hyphenateLongWord(getTimeAgo(Date.now() + ""));
            const lastReadTwo: HTMLSpanElement = document.getElementById(LAST_READ_2 + levelTwoHref) as HTMLDivElement;
            lastReadTwo.innerText = hyphenateLongWord(lastReadTwoInnerText);
            levelTwoContainer.removeAttribute(DATA_LEVEL_THREE_HREF);
        }

        document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
        levelTwoContainer.remove(); // destroy level 2
        window.scrollTo({top: levelOneScrollPosition});
    }
    levelTwoContainer.appendChild(backButton);

    // get the gallery thumbnails
    const mangaDocument: Document = await getResponseDocument(levelTwoHref);
    if (ORIGINAL_HREF.includes(NHENTAI)) {
        await loadHManga(levelTwoContainer, mangaDocument);
    } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
        loadNhManga(levelTwoContainer, mangaDocument);
    }
}

async function loadHManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document): Promise<void> {
    levelTwoContainer.style.flexDirection = "row";
    levelTwoContainer.style.flexWrap = "wrap";
    const levelTwoThumbnailContainers: HTMLDivElement[] = [];

    removeExtraDiv();

    const galleryThumbnailsCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(PERIOD + THUMBS).children as HTMLCollectionOf<HTMLDivElement>;
    const galleryThumbnailsList: HTMLDivElement[] = [];
    galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailsCollection));
    for (let i = 0; i < galleryThumbnailsList.length; i++) {
        const galleryThumbnailElement = galleryThumbnailsList[i];
        const levelThreeAnchor: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelTwoThumbnail: HTMLImageElement = levelThreeAnchor.children[0] as HTMLImageElement;

        const thumbnailContainer: HTMLDivElement = createTagWithClassName("div", LEVEL_TWO_THUMBNAIL_CONTAINER) as HTMLDivElement;
        const levelThreeHref: string = levelThreeAnchor.href;
        thumbnailContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        thumbnailContainer.onclick = async () => {
            await loadLevelThree(thumbnailContainer, window.scrollY);
        }

        const galleryThumbnail: HTMLImageElement = new Image();
        galleryThumbnail.setAttribute(DATA_SRC, levelTwoThumbnail.getAttribute(DATA_SRC));
        thumbnailContainer.append(galleryThumbnail);

        // add the last read information next to the button
        const lastReadContainer: HTMLDivElement = createTagWithClassName("div", "latest-container") as HTMLDivElement;
        const lastRead: HTMLSpanElement = createTagWithClassName("span", "last-read-gallery") as HTMLSpanElement;
        appendLastRead(lastRead, levelThreeHref, lastReadContainer);

        const pageNumber: HTMLSpanElement = createTagWithClassName("span", "gallery-page") as HTMLSpanElement;
        pageNumber.innerText = (i + 1) + "";
        lastReadContainer.appendChild(pageNumber);

        thumbnailContainer.appendChild(lastReadContainer);
        levelTwoThumbnailContainers.push(thumbnailContainer);
    }
    await loadThumbnailContainer(levelTwoThumbnailContainers, levelTwoContainer);
}

function removeExtraDiv() {
    // remove a div that gets added from other scripts:
    const removePotential: HTMLDivElement = document.body.children[1] as HTMLDivElement;
    if (removePotential.getAttribute("style").length === 80) {
        removePotential.remove();
    }
}

function appendLastRead(lastRead: HTMLSpanElement, levelThreeHref: string, lastReadContainer: HTMLDivElement) {
    lastRead.id = levelThreeHref;
    const lastReadString: string = localStorage.getItem(levelThreeHref);
    let lastReadInnerText: string;
    if (lastReadString === null) {
        lastReadInnerText = "Never read";
    } else {
        lastReadInnerText = getTimeAgo(lastReadString);
    }
    lastRead.innerText = hyphenateLongWord(lastReadInnerText);
    lastReadContainer.appendChild(lastRead);
}

function loadNhManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document): void {
    levelTwoContainer.style.flexDirection = "column";
    const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(PERIOD + EPH_NUM) as NodeListOf<HTMLDivElement>;
    const chapters: HTMLDivElement[] = [];
    chapters.splice(0, 0, ...Array.from(nodeChapters));
    for (const chapter of chapters) {
        const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
        const levelThreeHref = anchor.href;

        // add the chapter button
        const chapterContainer: HTMLDivElement = createTagWithClassName("div", "chapter-container") as HTMLDivElement;
        chapterContainer.setAttribute(DATA_LEVEL_THREE_HREF, levelThreeHref);
        chapterContainer.onclick = async () => {
            await loadLevelThree(chapterContainer, window.scrollY);
        }

        const chapterButton: HTMLButtonElement = createTagWithClassName("button", "chapter-button") as HTMLButtonElement;
        const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
        const maxChapterNameLength: number = 15;
        chapterButton.innerText = span.innerText.substring(0, maxChapterNameLength);
        chapterButton.onclick = async () => {
            // await loadLevelThree(chapterContainer);
        }
        chapterContainer.appendChild(chapterButton);

        // add the last read information next to the button
        const lastReadContainer: HTMLDivElement = createTagWithClassName("div", "last-read-container") as HTMLDivElement;
        const lastRead: HTMLSpanElement = createTagWithClassName("span", "last-read") as HTMLSpanElement;
        appendLastRead(lastRead, levelThreeHref, lastReadContainer);

        chapterContainer.appendChild(lastReadContainer);
        levelTwoContainer.appendChild(chapterContainer);
    }
}
