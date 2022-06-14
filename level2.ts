let level1ScrollPosition: number;
const chapters: HTMLDivElement[] = [];
const galleryThumbnailsList: HTMLDivElement[] = [];

const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";

function getLevelTwoVideo(searchResultsThumbnail: HTMLImageElement, background: HTMLDivElement) {
    // the video
    const levelTwoVideo: HTMLVideoElement = document.createElement("video");
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
    }
    levelTwoVideo.onerror = async () => {
        await waitRandomly(5000, 10000);
        levelTwoVideo.load();
    }
    return levelTwoVideo;
}

async function setBestSource(levelTwoHref: string, levelTwoVideo: HTMLVideoElement, levelTwoContainer: HTMLDivElement) {
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
        if (originalHref.includes(TOKYOMOTION) && source.src.includes("/hd/")) {
            bestSource = source.src;
        } else if (originalHref.includes(KISSJAV) && source.src.includes("720p")) {
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

async function loadVideo(searchResultsThumbnail: HTMLImageElement) {
    const levelTwoHref: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const levelTwoContainerId: string = levelTwoHref;
    const background: HTMLDivElement = searchResultsThumbnail.parentElement as HTMLDivElement;
    const videoLoaded: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        // save the position
        level1ScrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the load status
        searchResultsThumbnail.removeAttribute(DATA_LOAD_STATUS);
        background.className = THUMBNAIL_CONTAINER;

        // hide the thumbnails and show the video container
        document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
        document.getElementById(levelTwoContainerId).style.display = BLOCK; // show level 2
    } else if (videoLoading) {
        // alert("wait for the video to load");
    } else {
        // after the first click, the video's load status is loading
        searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnail.className = "clicked"; // TODO: use localstorage to remember watched videos
        background.className = THUMBNAIL_CONTAINER + " " + LOADING;

        // create level 2
        const levelTwoContainer: HTMLDivElement = createTagWithId("div", levelTwoContainerId) as HTMLDivElement;
        levelTwoContainer.style.display = NONE;
        document.querySelector("body").appendChild(levelTwoContainer);

        const levelTwoVideo = getLevelTwoVideo(searchResultsThumbnail, background);
        await setBestSource(levelTwoHref, levelTwoVideo, levelTwoContainer);

        // the go back button
        createBackButton(levelTwoContainer, "goToLevelOne", "go-back-video");

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

async function loadHManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document) {
    levelTwoContainer.style.flexDirection = "row";
    levelTwoContainer.style.flexWrap = "wrap";
    const galleryThumbnails: HTMLImageElement[] = [];
    const galleryThumbnailsCollection: HTMLCollectionOf<HTMLDivElement> = mangaDocument.querySelector(".thumbs").children as HTMLCollectionOf<HTMLDivElement>;
    galleryThumbnailsList.splice(0, galleryThumbnailsList.length, ...Array.from(galleryThumbnailsCollection)); // replace the array
    for (const galleryThumbnailElement of galleryThumbnailsList) {
        const levelThreeHref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const levelTwoThumbnail: HTMLImageElement = levelThreeHref.children[0] as HTMLImageElement;
        levelTwoThumbnail.src = levelTwoThumbnail.getAttribute(DATA_SRC);
        pushThumbnail(levelTwoThumbnail, levelThreeHref, "loadLevelThree", galleryThumbnails, "l2-thumbnail");
    }
    await loadThumbnail(galleryThumbnails, levelTwoContainer);
}

function loadNhManga(levelTwoContainer: HTMLDivElement, mangaDocument: Document) {
    levelTwoContainer.style.flexDirection = "column";
    const nodeChapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll("." + EPH_NUM) as NodeListOf<HTMLDivElement>;
    chapters.splice(0, chapters.length, ...Array.from(nodeChapters)); // replace the array
    for (const chapter of chapters) {
        const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
        currentChapterHref = anchor.href;

        // add the chapter button
        const chapterContainer: HTMLDivElement = createTagWithClassName("div", "chapter-container") as HTMLDivElement;
        const chapterButton: HTMLButtonElement = createTagWithClassName("button", "chapter-button") as HTMLButtonElement;
        const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
        chapterButton.innerText = span.innerText;
        chapterButton.setAttribute(DATA_HREF, currentChapterHref);
        chapterButton.onclick = async () => {
            await loadLevelThree(chapterButton);
        }
        chapterContainer.appendChild(chapterButton);

        // add the last read information next to the button
        const lastReadContainer: HTMLDivElement = createTagWithClassName("div", "last-read-container") as HTMLDivElement;
        const lastRead: HTMLSpanElement = createTagWithClassName("span", "last-read") as HTMLSpanElement;
        lastRead.id = currentChapterHref;
        const lastReadString: string = localStorage.getItem(currentChapterHref);
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

async function loadManga(searchResultsThumbnail: HTMLImageElement) {
    // scroll to the top - order matters
    level1ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 2
    const levelTwoHref: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const levelTwoContainer: HTMLDivElement = createTagWithId("div", L2_CONTAINER_ID) as HTMLDivElement;
    levelTwoContainer.setAttribute(DATA_HREF, levelTwoHref);
    levelTwoContainer.style.display = FLEX;
    document.querySelector("body").appendChild(levelTwoContainer);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    createBackButton(levelTwoContainer, "goToLevelOne", "go-back-manga");

    // get the gallery thumbnails
    const mangaDocument: Document = await getResponseDocument(levelTwoHref);


    if (originalHref.includes(NHENTAI)) {
        await loadHManga(levelTwoContainer, mangaDocument);
    } else if (originalHref.includes(ASURASCANS)) {
        loadNhManga(levelTwoContainer, mangaDocument);
    }
}

async function loadLevelTwo(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnail);
    } else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnail);
    }
}

function goToLevelOne(backButton: HTMLDivElement): void {
    const levelTwoContainer: HTMLDivElement = backButton.parentElement as HTMLDivElement;
    document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
    levelTwoContainer.remove(); // destroy level 2

    const levelTwoHref: string = levelTwoContainer.getAttribute(DATA_HREF);
    const lastReadOne: HTMLDivElement = document.getElementById(LAST_READ_1 + levelTwoHref) as HTMLDivElement;
    const lastReadTwo: HTMLDivElement = document.getElementById(LAST_READ_2 + levelTwoHref) as HTMLDivElement;
    const lastAvailableTwo: HTMLDivElement = document.getElementById(LAST_AVAILABLE_2 + levelTwoHref) as HTMLDivElement;

    if (originalHref.includes(NHENTAI)) {
        updateLevelOneHManga(galleryThumbnailsList, lastReadOne, lastReadTwo, lastAvailableTwo);
    } else if (originalHref.includes(ASURASCANS)) {
        updateLevelOneNhManga(chapters, lastReadOne, lastReadTwo, lastAvailableTwo);
    }

    // scroll to the first level position
    window.scrollTo({top: level1ScrollPosition});
}
