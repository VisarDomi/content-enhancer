let level1ScrollPosition: number;

const DATA_LOAD_STATUS = "data-load-status";
const LOADED = "loaded";
const LOADING = "loading";
const BUTTON = "button";

async function loadL2(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    // TODO: use OOP
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnail);
    } else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnail);
    }
}

function goToL1(l2ContainerId: string): void {
    document.getElementById(L1_CONTAINER_ID).style.display = BLOCK; // show level 1
    document.getElementById(l2ContainerId).remove(); // destroy level 2

    // scroll to the first level position
    window.scrollTo({top: level1ScrollPosition});
}

async function loadVideo(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    const l2Href: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const l2ContainerId: string = "l2" + l2Href;
    const backgroundId = "bg" + l2Href;
    const videoLoaded: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADED);
    const videoLoading: boolean = (searchResultsThumbnail.getAttribute(DATA_LOAD_STATUS) === LOADING);
    if (videoLoaded) {
        // save the position
        level1ScrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the load status
        searchResultsThumbnail.removeAttribute(DATA_LOAD_STATUS);
        // remove the encompassing div
        const background: HTMLDivElement = document.getElementById(backgroundId) as HTMLDivElement;
        background.after(searchResultsThumbnail);
        background.remove();

        // hide the thumbnails and show the video container
        document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
        document.getElementById(l2ContainerId).style.display = BLOCK; // show level 2
    } else if (videoLoading) {
        // alert("wait for the video to load");
    } else {
        // after the first click, the video's load status is loading
        const background: HTMLDivElement = document.createElement(DIV);
        searchResultsThumbnail.setAttribute(DATA_LOAD_STATUS, LOADING);
        background.id = backgroundId;
        background.className = LOADING;
        searchResultsThumbnail.after(background);
        searchResultsThumbnail.className = "clicked";
        background.appendChild(searchResultsThumbnail);

        // create level 2
        const l2Container: HTMLDivElement = document.createElement(DIV);
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
        if (l2Href.includes(TOKYOMOTION)) { // TODO: use OOP
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
        const goToL1: HTMLDivElement = document.createElement(DIV);
        // the red "go-back" div attributes
        goToL1.className = "go-video-l1";
        goToL1.setAttribute(ONCLICK, 'goToL1("' + l2ContainerId + '")');
        l2Container.appendChild(goToL1);

        // refresh should be at the end of the page
        const refresh: HTMLButtonElement = document.createElement(BUTTON);
        refresh.className = "refresh";
        refresh.type = BUTTON;
        refresh.onclick = () => {
            video.scrollIntoView();
            l2Video.load();
        };
        refresh.innerText = "Reload the video";
        l2Container.appendChild(refresh);
    }
}

function createGoToL1(l2Container: HTMLDivElement, functionName: string): void {
    // the back button
    const goToL1: HTMLDivElement = document.createElement(DIV);
    goToL1.className = GO_BACK;
    goToL1.setAttribute(ONCLICK, functionName + "('" + l2Container.id + "')");
    l2Container.appendChild(goToL1);
}

async function loadManga(searchResultsThumbnail): Promise<void> {
    // scroll to the top - order matters
    level1ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 2
    const l2Href: string = searchResultsThumbnail.getAttribute(DATA_HREF);
    const l2ContainerId: string = "l2" + l2Href;
    const l2Container: HTMLDivElement = document.createElement(DIV);
    l2Container.id = l2ContainerId;
    document.body.appendChild(l2Container);
    document.getElementById(L1_CONTAINER_ID).style.display = NONE; // hide level 1
    createGoToL1(l2Container, "goToL1");

    // get the gallery thumbnails
    const mangaDocument: Document = await getResponseDocument(l2Href);


    if (originalHref.includes(NHENTAI)) {
        const galleryThumbnails = getGalleryThumbnails(mangaDocument);

        // add the l2Container id as well
        for (const galleryThumbnail of galleryThumbnails) {
            galleryThumbnail.setAttribute(DATA_L2_ID, l2ContainerId);
        }

        // load the gallery thumbnails
        await loadThumbnail(galleryThumbnails, l2Container);
    } else if (originalHref.includes(ASURASCANS)) {
        l2Container.setAttribute("style", "display:flex;flex-direction:column;");
        const chapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".eph-num") as NodeListOf<HTMLDivElement>;

        for (const chapter of chapters) {
            const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
            const chapterButton: HTMLButtonElement = document.createElement(BUTTON);
            const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
            chapterButton.innerText = span.innerText;
            chapterButton.className = "chapter-button";
            chapterButton.setAttribute(DATA_HREF, anchor.href);
            chapterButton.setAttribute(DATA_L2_ID, l2ContainerId);
            chapterButton.onclick = async () => {
                await loadL3(chapterButton);
            }
            l2Container.appendChild(chapterButton);
        }
    }
}

function getGalleryThumbnails(galleryDocument: Document) {
    const galleryThumbnails: HTMLImageElement[] = [];

    // TODO: use OOP
    const galleryThumbnailList: HTMLElement[] = Array.from(galleryDocument.querySelector(".thumbs").children as HTMLCollectionOf<HTMLDivElement>);
    for (const galleryThumbnailElement of galleryThumbnailList) {

        // TODO: use OOP
        const l3ref: HTMLAnchorElement = galleryThumbnailElement.children[0] as HTMLAnchorElement;
        const l2Thumbnail: HTMLImageElement = l3ref.children[0] as HTMLImageElement;

        pushThumbnail(l2Thumbnail, l3ref, "loadL3", galleryThumbnails);
    }

    return galleryThumbnails;
}
