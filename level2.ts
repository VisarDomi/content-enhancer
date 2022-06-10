async function loadL2(thumbnailImage: HTMLImageElement): Promise<void> {
    const secondLevelHref: string = thumbnailImage.getAttribute("data-href");

    let contentType: string; // OOP as always is better
    if (oh.includes(TM) || oh.includes(KJ)) {
        contentType = "video";
    } else if (oh.includes(NH)) {
        contentType = "hmanga";
    } else if (oh.includes(AS)) {
        contentType = "nhmanga"
    }

    switch (contentType) { // OOP as always is better
        case "video":
            await handleVideo(secondLevelHref, thumbnailImage);
            break;
        case "hmanga":
            await handleHManga(secondLevelHref);
            break;
        case "nhmanga":
            await handleNhManga(secondLevelHref);
            break;
    }
}

function goToL1(l2ContainerId: string): void {
    document.getElementById(L1).className = "show"; // show level 1
    document.getElementById(l2ContainerId).remove(); // destroy level 2

    // break loop - stop requesting new images TODO: use OOP
    bl = true;

    // scroll to the first level position
    window.scrollTo({top: l1sp});
}

async function handleVideo(secondLevelHref: string, thumbnailImage: HTMLImageElement): Promise<void> {
    const l2ContainerId: string = "l2" + secondLevelHref;
    const backgroundId = "bg" + secondLevelHref;
    const videoLoaded: boolean = (thumbnailImage.getAttribute("data-load-status") === "loaded");
    const videoLoading: boolean = (thumbnailImage.getAttribute("data-load-status") === "loading");
    if (videoLoaded) {
        // save the position
        l1sp = window.scrollY;
        window.scrollTo({top: 0});

        // remove the load status
        thumbnailImage.removeAttribute("data-load-status");
        // remove the encompassing div
        const background: HTMLDivElement = document.getElementById(backgroundId) as HTMLDivElement;
        background.after(thumbnailImage);
        background.remove();

        // hide the thumbnails and show the video container
        document.getElementById(L1).className = "hide"; // hide level 1
        document.getElementById(l2ContainerId).className = "show"; // show level 2
    } else if (videoLoading) {
        // alert("wait for the video to load");
    } else {
        // after the first click, the video's load status is loading
        const background: HTMLDivElement = document.createElement("div");
        thumbnailImage.setAttribute("data-load-status", "loading");
        background.id = backgroundId;
        background.className = "loading";
        thumbnailImage.after(background);
        background.appendChild(thumbnailImage);
        thumbnailImage.className = "clicked";

        // create level 2
        const l2Container: HTMLDivElement = document.createElement("div");
        document.body.appendChild(l2Container);
        const video: HTMLVideoElement = document.createElement("video");
        l2Container.appendChild(video);
        const source: HTMLSourceElement = document.createElement("source");
        const responseSources = await getResponseSources(secondLevelHref);
        source.src = getBestSource(responseSources); // order matters
        video.appendChild(source);
        const refresh: HTMLButtonElement = document.createElement("button");
        l2Container.appendChild(refresh);
        const goToL1: HTMLDivElement = document.createElement("div");
        l2Container.appendChild(goToL1);

        // hide the video container
        l2Container.id = l2ContainerId;
        l2Container.className = "hide";

        // refresh attributes
        refresh.className = "refresh";
        refresh.type = "button";
        refresh.onclick = refreshVideo;
        refresh.innerText = "Reload the video";

        // the red "go-back" div attributes
        goToL1.className = "go-video-l1";
        goToL1.setAttribute("onclick", 'goToL1("' + l2ContainerId + '")');

        // video attributes
        video.controls = true;
        video.preload = "auto";
        video.playsInline = true;
        video.muted = true;

        video.onloadedmetadata = async () => {
            video.onloadedmetadata = null; // activate this function just once
            await waitFor(100); // wait for a split second
            await video.play();
            await waitFor(100); // play the video for a split second
            video.pause();
            thumbnailImage.setAttribute("data-load-status", "loaded");
            background.className = "loaded";
        }
        video.onerror = async () => {
            await waitFor(5000);
            video.load();
        }
    }
}

function refreshVideo(): void {
    document.querySelector("video").load();
}

async function getResponseSources(secondLevelHref: string): Promise<HTMLCollectionOf<HTMLSourceElement>> {
    // select the best source
    const response: Response = await getResponse(secondLevelHref);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
    let responseVideo: HTMLVideoElement;
    if (secondLevelHref.includes(TM)) {
        responseVideo = responseDocument.getElementById("vjsplayer") as HTMLVideoElement;
    } else if (secondLevelHref.includes(KJ)) {
        responseVideo = responseDocument.getElementById("player-fluid") as HTMLVideoElement;
    }

    return responseVideo.getElementsByTagName("source") as HTMLCollectionOf<HTMLSourceElement>;
}

function getBestSource(edSources: HTMLCollectionOf<HTMLSourceElement>): string {
    let bestSource: string = null;
    for (const source of edSources) {
        if (oh.includes(TM) && source.src.includes("/hd/")) {
            bestSource = source.src;
        } else if (oh.includes(KJ) && source.src.includes("720p")) {
            bestSource = source.src;
        }
    }
    if (bestSource === null) {
        bestSource = edSources[0].src;
    }

    return bestSource;
}

async function handleHManga(secondLevelHref: string): Promise<void> {
    // scroll to the top - order matters
    l1sp = window.scrollY;
    window.scrollTo({top: 0});

    // create level 2
    const l2ContainerId = "l2-container";
    const l2Container: HTMLDivElement = document.createElement("div");
    l2Container.id = l2ContainerId;
    document.body.appendChild(l2Container);
    document.getElementById(L1).className = "hide"; // hide level 1

    // the back button
    const goToL1: HTMLDivElement = document.createElement("div");
    goToL1.className = "go-manga-l1";
    goToL1.setAttribute("onclick", "goToL1('" + l2ContainerId + "')");
    l2Container.appendChild(goToL1);

    // get the gallery
    const response: Response = await getResponse(secondLevelHref);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");

    // set the next page TODO: use OOP
    nip = responseDocument.querySelector(".gallerythumb") as HTMLAnchorElement;
    bl = false; // break loop - start requesting new images

    // load all the images recursively
    await loadImage(l2Container);
}

async function loadImage(l2Container: HTMLDivElement): Promise<void> {
    if (nip?.href !== "" && !bl) {
        // get the next image page
        const response: Response = await getResponse(nip.href);
        const text: string = await response.text();
        const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");

        // append the image to the container
        const hMImage: HTMLImageElement = responseDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
        const image: HTMLImageElement = new Image();
        image.src = hMImage.src;
        l2Container.appendChild(image);

        // set the next image
        setNextImagePage(responseDocument);

        // load the next image
        image.onload = async () => {
            await loadImage(l2Container);
        }
        image.onerror = async () => {
            await waitFor(5000);
            image.src = hMImage.src + "?time=" + Date.now();
        }
    }
}

async function handleNhManga(secondLevelHref: string): Promise<void> {
    // asurascans goes in here
}

function setNextImagePage(responseDocument: Document): void {
    // set the next image to be loaded TODO: use OOP here
    nip = responseDocument.querySelector(".next") as HTMLAnchorElement;
}

