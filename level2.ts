let level1ScrollPosition: number;

const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";

async function loadL2(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnail);
    } else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnail);
    }
}

function goToL1(backButton: HTMLDivElement): void {
    document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
    backButton.parentElement.remove(); // destroy level 2

    // scroll to the first level position
    window.scrollTo({top: level1ScrollPosition});
}

async function loadVideo(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    const l2Href: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const l2ContainerId: string = l2Href;
    const background: HTMLDivElement = searchResultsThumbnail.parentElement as HTMLDivElement;
    const videoLoaded: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        // save the position
        level1ScrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the load status
        searchResultsThumbnail.removeAttribute(DATA_LOAD_STATUS);
        background.removeAttribute("class");

        // hide the thumbnails and show the video container
        document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
        document.getElementById(l2ContainerId).style.display = BLOCK; // show level 2
    } else if (videoLoading) {
        // alert("wait for the video to load");
    } else {
        // after the first click, the video's load status is loading
        searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADING);
        searchResultsThumbnail.className = "clicked"; // TODO: use localstorage to remember watched videos
        background.className = LOADING;

        // create level 2
        const l2Container: HTMLDivElement = document.createElement("div");
        l2Container.id = l2ContainerId;
        l2Container.style.display = NONE;
        document.body.appendChild(l2Container);

        // the video
        const l2Video: HTMLVideoElement = document.createElement("video");
        l2Video.controls = true;
        l2Video.preload = "auto";
        l2Video.playsInline = true;
        l2Video.muted = true;
        l2Video.onloadedmetadata = async () => {
            l2Video.onloadedmetadata = null; // activate this function just once
            // manually autoplay
            await waitFor(100);
            await l2Video.play();
            await waitFor(100);
            l2Video.pause();
            // the video is loaded
            searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADED);
            background.className = LOADED;
        }
        l2Video.onerror = async () => {
            await waitFor(5000);
            l2Video.load();
        }

        // the source
        const l2Source: HTMLSourceElement = document.createElement("source");
        const videoDocument: Document = await getResponseDocument(l2Href);
        let video: HTMLVideoElement;
        if (l2Href.includes(TOKYOMOTION)) {
            video = videoDocument.getElementById("vjsplayer") as HTMLVideoElement;
        } else if (l2Href.includes(KISSJAV)) {
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
        l2Source.src = bestSource;
        l2Video.appendChild(l2Source);
        l2Container.appendChild(l2Video);

        // the go back button
        createBackButton(l2Container, "goToL1", "go-back-video");

        // refresh should be at the end of the page
        const refresh: HTMLButtonElement = document.createElement("button");
        refresh.className = "refresh";
        refresh.type = "button";
        refresh.onclick = () => {
            l2Video.scrollIntoView();
            l2Video.load();
        };
        refresh.innerText = "Reload the video";
        l2Container.appendChild(refresh);
    }
}

async function loadManga(searchResultsThumbnail): Promise<void> {
    // scroll to the top - order matters
    level1ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 2
    const l2Href: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const l2Container: HTMLDivElement = document.createElement("div");
    l2Container.id = L2_CONTAINER_ID;
    l2Container.style.display = FLEX;
    document.body.appendChild(l2Container);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    createBackButton(l2Container, "goToL1", "go-back-manga");

    // get the gallery thumbnails
    const mangaDocument: Document = await getResponseDocument(l2Href);


    if (originalHref.includes(NHENTAI)) {
        l2Container.style.flexDirection = "row";
        l2Container.style.flexWrap = "wrap";
        const galleryThumbnails = getGalleryThumbnails(mangaDocument);
        await loadThumbnail(galleryThumbnails, l2Container);
    } else if (originalHref.includes(ASURASCANS)) {
        l2Container.style.flexDirection = "column";
        const chapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".eph-num") as NodeListOf<HTMLDivElement>;
        for (const chapter of chapters) {
            const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
            currentChapterHref = anchor.href;

            // add the chapter button
            const chapterContainer: HTMLDivElement = document.createElement("div");
            chapterContainer.className = "chapter-container";
            const chapterButton: HTMLButtonElement = document.createElement("button");
            const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
            chapterButton.innerText = span.innerText;
            chapterButton.className = "chapter-button";
            chapterButton.setAttribute(DATA_HREF, currentChapterHref);
            chapterButton.onclick = async () => {
                await loadL3(chapterButton);
            }
            chapterContainer.appendChild(chapterButton);

            // add the last read information next to the button
            const lastReadContainer: HTMLDivElement = document.createElement("div");
            lastReadContainer.className = "last-read-container";
            const lastRead: HTMLSpanElement = document.createElement("span");
            lastRead.className = "last-read";
            lastRead.id = currentChapterHref;
            const lastReadString: string = localStorage.getItem(currentChapterHref);
            if (lastReadString === null) {
                lastRead.innerText = "Never read";
            } else {
                lastRead.innerText = getTimeAgo(lastReadString);
            }

            lastReadContainer.appendChild(lastRead);
            chapterContainer.appendChild(lastReadContainer);
            l2Container.appendChild(chapterContainer);
        }
    }
}

function getGalleryThumbnails(galleryDocument: Document): HTMLImageElement[] {
    const galleryThumbnails: HTMLImageElement[] = [];
    const galleryThumbnailList: HTMLElement[] = Array.from(galleryDocument.querySelector(".thumbs").children as HTMLCollectionOf<HTMLDivElement>);
    for (const galleryThumbnailElement of galleryThumbnailList) {
        const l3ref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const l2Thumbnail: HTMLImageElement = l3ref.children[0] as HTMLImageElement;
        l2Thumbnail.src = l2Thumbnail.getAttribute(DATA_SRC);
        pushThumbnail(l2Thumbnail, l3ref, "loadL3", galleryThumbnails, "l2-thumbnail");
    }

    return galleryThumbnails;
}
