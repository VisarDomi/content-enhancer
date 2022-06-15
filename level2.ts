const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";

async function loadLevelTwo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnailContainer, levelOneScrollPosition);
    } else if (ORIGINAL_HREF.includes(NHENTAI) || ORIGINAL_HREF.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnailContainer, levelOneScrollPosition);
    }
}


async function loadVideo(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    const levelTwoHref: string = searchResultsThumbnailContainer.id;
    const levelTwoContainerId: string = levelTwoHref;
    const levelOneContainer: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;
    const videoLoaded: boolean = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading: boolean = (searchResultsThumbnailContainer.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        window.scrollTo({top: 0});
        searchResultsThumbnailContainer.removeAttribute(DATA_LOAD_STATUS); // remove the load status
        levelOneContainer.style.display = NONE; // hide level 1
        document.getElementById(levelTwoContainerId).style.display = BLOCK; // show level 2
    } else if (!videoLoading) {
        // after the first click, the video's load status is loading
        searchResultsThumbnailContainer.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnailContainer.className = THUMBNAIL_CONTAINER + SPACE + LOADING; // TODO: use localstorage to remember watched videos

        // create level 2
        const levelTwoContainer: HTMLDivElement = createTagWithId("div", levelTwoContainerId) as HTMLDivElement;
        levelTwoContainer.style.display = NONE;
        document.querySelector("body").appendChild(levelTwoContainer);

        const levelTwoVideo = getLevelTwoVideo(searchResultsThumbnailContainer);
        await setBestSource(levelTwoHref, levelTwoVideo, levelTwoContainer);

        // the go back button
        const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-one") as HTMLDivElement;
        backButton.className = "go-back-video";
        backButton.onclick = () => {
            levelOneContainer.style.display = BLOCK; // show level 1
            levelTwoContainer.remove(); // destroy level 2
            window.scrollTo({top: levelOneScrollPosition});
        }

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

function getLevelTwoVideo(searchResultsThumbnailContainer: HTMLDivElement): HTMLVideoElement {
    // the video
    const levelTwoVideo: HTMLVideoElement = document.createElement("video");
    levelTwoVideo.controls = true;
    levelTwoVideo.preload = "auto";
    levelTwoVideo.playsInline = true;
    levelTwoVideo.muted = true;
    levelTwoVideo.onloadedmetadata = async () => {
        // activate this function just once
        levelTwoVideo.onloadedmetadata = null;
        // manually autoplay
        await waitFor(100);
        await levelTwoVideo.play();
        await waitFor(100);
        levelTwoVideo.pause();
        // the video is loaded
        searchResultsThumbnailContainer.setAttribute(DATA_LOAD_STATUS, LOADED);
        searchResultsThumbnailContainer.className = THUMBNAIL_CONTAINER + SPACE + LOADED;
    }
    levelTwoVideo.onerror = async () => {
        await waitFor(randomNumber(5000, 10000));
        levelTwoVideo.load();
    }

    return levelTwoVideo;
}

async function setBestSource(levelTwoHref: string, levelTwoVideo: HTMLVideoElement, levelTwoContainer: HTMLDivElement): Promise<void> {
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
    levelTwoVideo.appendChild(levelTwoSource);
    levelTwoContainer.appendChild(levelTwoVideo);
}


async function loadManga(searchResultsThumbnailContainer: HTMLDivElement, levelOneScrollPosition: number): Promise<void> {
    window.scrollTo({top: 0});
    // create level 2
    const levelTwoHref: string = searchResultsThumbnailContainer.id;
    const levelTwoContainer: HTMLDivElement = createTagWithId("div", L2_CONTAINER_ID) as HTMLDivElement;
    levelTwoContainer.setAttribute(DATA_LEVEL_TWO_HREF, levelTwoHref); // TODO: delete?
    levelTwoContainer.style.display = FLEX;
    document.querySelector("body").appendChild(levelTwoContainer);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-one") as HTMLDivElement;
    backButton.className = "go-back-manga";
    backButton.onclick = () => {
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
    const galleryThumbnails: HTMLImageElement[] = [];
    const galleryThumbnailsCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(PERIOD + THUMBS).children as HTMLCollectionOf<HTMLDivElement>;
    const galleryThumbnailsList: HTMLDivElement[] = [];
    galleryThumbnailsList.splice(0, 0, ...Array.from(galleryThumbnailsCollection));
    for (const galleryThumbnailElement of galleryThumbnailsList) {
        const levelThreeHref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelTwoThumbnail: HTMLImageElement = levelThreeHref.children[0] as HTMLImageElement;
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(DATA_SRC);
        pushThumbnail(levelTwoThumbnail, levelThreeHref, "loadLevelThree", galleryThumbnails, "l2-thumbnail");
    }
    await loadThumbnailContainer(galleryThumbnails, levelTwoContainer);
}

function pushThumbnail(levelThumbnail: HTMLImageElement, levelHref: HTMLAnchorElement, functionName: string, thumbnails: HTMLImageElement[], className: string): void {
    // we got all the needed data
    const thumbnail: HTMLImageElement = new Image();
    thumbnail.setAttribute(DATA_SRC, levelThumbnail.src);
    thumbnail.className = className;

    if (ORIGINAL_HREF.includes(TOKYOMOTION) || ORIGINAL_HREF.includes(KISSJAV)) {
        const duration: string = levelThumbnail.getAttribute(DATA_DURATION);
        thumbnail.setAttribute(DATA_DURATION, duration);
    }

    thumbnails.push(thumbnail);
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
        lastRead.id = levelThreeHref;
        const lastReadString: string = localStorage.getItem(levelThreeHref);
        if (lastReadString === null) {
            lastRead.innerText = "Never read";
        } else {
            lastRead.innerText = getTimeAgo(lastReadString);
        }
        lastReadContainer.appendChild(lastRead);
        chapterContainer.appendChild(lastReadContainer);

        levelTwoContainer.appendChild(chapterContainer);
    }
}
