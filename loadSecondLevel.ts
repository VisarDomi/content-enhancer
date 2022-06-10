async function loadSecondLevel(thumbnailImage: HTMLImageElement): Promise<void> {
    const href: string = thumbnailImage.getAttribute("data-href");
    const videoLoaded: boolean = (thumbnailImage.getAttribute("data-video-loaded") === "true");
    if (!videoLoaded) {
        // add an orange background
        const background: HTMLDivElement = document.createElement("div");
        background.id = "div" + href;
        background.className = "loading";
        thumbnailImage.after(background);
        background.appendChild(thumbnailImage);
        thumbnailImage.className = "clicked";

        // get the video page
        const response: Response = await getResponse(href);
        const text: string = await response.text();
        const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
        // get the video
        let responseVideo: HTMLVideoElement;

        if (href.includes(TOKYOMOTION)) {
            responseVideo = responseDocument.getElementById("vjsplayer") as HTMLVideoElement;
        } else if (href.includes(KISSJAV)) {
            responseVideo = responseDocument.getElementById("player-fluid") as HTMLVideoElement;
        }

        const responseSources: HTMLCollectionOf<HTMLSourceElement> = responseVideo.getElementsByTagName("source") as HTMLCollectionOf<HTMLSourceElement>;

        // create the video
        const video: HTMLVideoElement = document.createElement("video");
        video.id = "video" + href;
        video.controls = true;
        video.preload = "auto";
        video.playsInline = true;
        video.muted = true;
        video.className = "hide";

        // select the best source
        const source: HTMLSourceElement = document.createElement("source");
        source.src = getBestSource(responseSources);
        video.appendChild(source);
        document.body.appendChild(video);

        // use onloadedmetadata because ios safari seems to not support oncanplaythrough
        video.onloadedmetadata = async () => {
            video.onloadedmetadata = null; // activate this function just once
            await waitFor(1000); // wait for a sec
            await video.play();
            await waitFor(1000); // play the video for a sec
            video.pause();
            // show a green background
            thumbnailImage.setAttribute("data-video-loaded", "true");
            background.className = "loaded";
        }
        video.onerror = async () => {
            await waitFor(5000);
            video.load();
        }
    } else {
        // save the position
        scrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the background
        const background: HTMLDivElement = document.getElementById("div" + href) as HTMLDivElement;
        background.after(thumbnailImage);
        background.remove();
        thumbnailImage.removeAttribute("data-video-loaded");

        // hide the thumbnails
        document.getElementById("thumbnails-container").className = "hide";

        // show the video
        const video: HTMLVideoElement = document.getElementById("video" + href) as HTMLVideoElement;
        video.className = "show";

        // show refresh video
        const refresh: HTMLButtonElement = document.createElement("button");
        refresh.className = "refresh";
        refresh.type = "button";
        refresh.onclick = refreshVideo;
        refresh.innerText = "Reload the video";
        video.after(refresh);

        // show the red back button
        const div: HTMLDivElement = document.createElement("div");
        div.className = "go-back";
        div.onclick = goBack;
        div.id = href;
        refresh.after(div);
    }
}

function refreshVideo(): void {
    document.getElementsByTagName("video")[0].load();
}

function goBack(): void {
    document.getElementById("thumbnails-container").className = "show";
    document.getElementsByTagName("video")[0].remove();
    document.getElementsByClassName("refresh")[0].remove();
    document.getElementsByClassName("go-back")[0].remove();

    // scroll to the saved position
    window.scrollTo({top: scrollPosition});
}

function getBestSource(edSources: HTMLCollectionOf<HTMLSourceElement>): string {
    let bestSource: string = null;
    for (const source of edSources) {
        if (href.includes(TOKYOMOTION) && source.src.includes("/hd/")) {
            bestSource = source.src;
        } else if (href.includes(KISSJAV) && source.src.includes("720p")) {
            bestSource = source.src;
        }
    }
    if (bestSource === null) {
        bestSource = edSources[0].src;
    }

    return bestSource;
}

