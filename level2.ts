let level1ScrollPosition: number;

async function loadL2(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    // TODO: use OOP
    if (originalHref.includes(TOKYOMOTION) || originalHref.includes(KISSJAV)) {
        await loadVideo(searchResultsThumbnail);
    } else if (originalHref.includes(NHENTAI) || originalHref.includes(ASURASCANS)) {
        await loadManga(searchResultsThumbnail);
    }
}

function goToL1(l2ContainerId: string): void {
    document.getElementById(L1_CONTAINER_ID).style.display = "block"; // show level 1
    document.getElementById(l2ContainerId).remove(); // destroy level 2

    // scroll to the first level position
    window.scrollTo({top: level1ScrollPosition});
}

async function loadVideo(searchResultsThumbnail: HTMLImageElement): Promise<void> {
    const l2Href: string = searchResultsThumbnail.getAttribute("data-href");
    const l2ContainerId: string = "l2" + l2Href;
    const backgroundId = "bg" + l2Href;
    const videoLoaded: boolean = (searchResultsThumbnail.getAttribute("data-load-status") === "loaded");
    const videoLoading: boolean = (searchResultsThumbnail.getAttribute("data-load-status") === "loading");
    if (videoLoaded) {
        // save the position
        level1ScrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the load status
        searchResultsThumbnail.removeAttribute("data-load-status");
        // remove the encompassing div
        const background: HTMLDivElement = document.getElementById(backgroundId) as HTMLDivElement;
        background.after(searchResultsThumbnail);
        background.remove();

        // hide the thumbnails and show the video container
        document.getElementById(L1_CONTAINER_ID).style.display = "none"; // hide level 1
        document.getElementById(l2ContainerId).style.display = "block"; // show level 2
    } else if (videoLoading) {
        // alert("wait for the video to load");
    } else {
        // after the first click, the video's load status is loading
        const background: HTMLDivElement = document.createElement("div");
        searchResultsThumbnail.setAttribute("data-load-status", "loading");
        background.id = backgroundId;
        background.className = "loading";
        searchResultsThumbnail.after(background);
        searchResultsThumbnail.className = "clicked";
        background.appendChild(searchResultsThumbnail);

        // create level 2
        const l2Container: HTMLDivElement = document.createElement("div");
        l2Container.id = l2ContainerId;
        l2Container.style.display = "none";
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
            searchResultsThumbnail.setAttribute("data-load-status", "loaded");
            background.className = "loaded";
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
        const goToL1: HTMLDivElement = document.createElement("div");
        // the red "go-back" div attributes
        goToL1.className = "go-video-l1";
        goToL1.setAttribute("onclick", 'goToL1("' + l2ContainerId + '")');
        l2Container.appendChild(goToL1);

        // refresh should be at the end of the page
        const refresh: HTMLButtonElement = document.createElement("button");
        refresh.className = "refresh";
        refresh.type = "button";
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
    const goToL1: HTMLDivElement = document.createElement("div");
    goToL1.className = "go-back";
    goToL1.setAttribute("onclick", functionName + "('" + l2Container.id + "')");
    l2Container.appendChild(goToL1);
}

async function loadManga(searchResultsThumbnail): Promise<void> {
    // scroll to the top - order matters
    level1ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 2
    const l2Href: string = searchResultsThumbnail.getAttribute("data-href");
    const l2ContainerId: string = "l2" + l2Href;
    const l2Container: HTMLDivElement = document.createElement("div");
    l2Container.id = l2ContainerId;
    document.body.appendChild(l2Container);
    document.getElementById(L1_CONTAINER_ID).style.display = "none"; // hide level 1
    createGoToL1(l2Container, "goToL1");

    // get the gallery thumbnails
    const mangaDocument: Document = await getResponseDocument(l2Href);


    if (originalHref.includes(NHENTAI)) {
        const galleryThumbnails = getGalleryThumbnails(mangaDocument);

        // add the l2Container id as well
        for (const galleryThumbnail of galleryThumbnails) {
            galleryThumbnail.setAttribute("data-l2-id", l2ContainerId);
        }

        // load the gallery thumbnails
        await loadThumbnail(galleryThumbnails, l2Container);
    } else if (originalHref.includes(ASURASCANS)) {
        l2Container.setAttribute("style", "display:flex;flex-direction:column;");
        const chapters: NodeListOf<HTMLDivElement> = mangaDocument.querySelectorAll(".eph-num") as NodeListOf<HTMLDivElement>;

        for (const chapter of chapters) {
            const anchor: HTMLAnchorElement = chapter.children[0] as HTMLAnchorElement;
            const chapterButton: HTMLButtonElement = document.createElement("button");
            const span: HTMLSpanElement = anchor.children[0] as HTMLSpanElement;
            chapterButton.innerText = span.innerText;
            chapterButton.className = "chapter-button";
            chapterButton.setAttribute("data-href", anchor.href);
            chapterButton.setAttribute("data-l2-id", l2ContainerId);
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
