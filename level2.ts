async function loadL2(thumbnailImage: HTMLImageElement): Promise<void> {
    const secondLevelHref: string = thumbnailImage.getAttribute("data-href");
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
        source.src = getBestSource(responseSources);
        video.appendChild(source);
        const refresh: HTMLButtonElement = document.createElement("button");
        l2Container.appendChild(refresh);
        const gotToL1: HTMLDivElement = document.createElement("div");
        l2Container.appendChild(gotToL1);

        // hide the video container
        l2Container.id = l2ContainerId;
        l2Container.className = "hide";

        // refresh attributes
        refresh.className = "refresh";
        refresh.type = "button";
        refresh.onclick = refreshVideo;
        refresh.innerText = "Reload the video";

        // the red "go-back" div attributes
        gotToL1.className = "go-l1";
        gotToL1.setAttribute("onclick", 'goToL1("' + l2ContainerId + '")');

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

function goToL1(l2ContainerId: string): void {
    document.getElementById(L1).className = "show"; // show level 1
    document.getElementById(l2ContainerId).remove(); // destroy level 2

    // scroll to the first level position
    window.scrollTo({top: l1sp});
}

function refreshVideo(): void {
    document.getElementsByTagName("video")[0].load();
}

async function getResponseSources(secondLevelHref: string) {
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
    const responseSources: HTMLCollectionOf<HTMLSourceElement> = responseVideo.getElementsByTagName("source") as HTMLCollectionOf<HTMLSourceElement>;

    return responseSources;
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

