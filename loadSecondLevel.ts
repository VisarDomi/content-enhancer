async function loadSecondLevel(image: HTMLImageElement): Promise<void> {
    const href: string = image.getAttribute("data-href");
    const loaded: boolean = (image.getAttribute("data-loaded") === "true");
    if (!loaded) {
        // add an orange background
        const div: HTMLDivElement = document.createElement("div");
        div.id = "div" + href;
        div.setAttribute("style", "background-color:orange;opacity:0.8;");
        image.after(div);
        div.appendChild(image);
        image.setAttribute("style", "opacity:0.03;");

        // get the video page
        const response: Response = await getResponse(href);
        const text: string = await response.text();
        const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
        // get the video
        let edVideo: HTMLVideoElement;

        if (href.includes(TOKYOMOTION)) {
            edVideo = responseDocument.getElementById("vjsplayer") as HTMLVideoElement;
        } else if (href.includes(KISSJAV)) {
            edVideo = responseDocument.getElementById("player-fluid") as HTMLVideoElement;
        }

        const edSources: HTMLCollectionOf<HTMLSourceElement> = edVideo.getElementsByTagName("source") as HTMLCollectionOf<HTMLSourceElement>;

        // create the video
        const video: HTMLVideoElement = document.createElement("video");
        video.id = "video" + href;
        video.controls = true;
        video.preload = "auto";
        video.playsInline = true;
        video.muted = true;
        video.setAttribute("style", "display:none;");

        // select the best source
        const source: HTMLSourceElement = document.createElement("source");
        source.src = getBestSource(edSources);
        video.appendChild(source);
        document.body.appendChild(video);

        // use onloadedmetadata because ios safari seems to not support oncanplaythrough
        video.onloadedmetadata = async () => {
            await waitFor(1000); // wait for a sec
            await video.play();
            await waitFor(1000); // play the video for a sec
            video.pause();
            // show a green background
            image.setAttribute("data-loaded", "true");
            div.setAttribute("style", "background-color:green;opacity:0.8;");
            image.setAttribute("style", "opacity:0.3;");
        }
        video.onerror = async () => {
            await waitFor(5000);
            video.load();
        }
    } else {
        // save the position
        scrollPosition = window.scrollY;
        window.scrollTo({top: 0});

        // remove the loaded div
        const imageDiv: HTMLDivElement = document.getElementById("div" + href) as HTMLDivElement;
        imageDiv.after(image);
        imageDiv.remove();
        image.removeAttribute("data-loaded");

        // hide the thumbnails
        const thumbnailsContainer: HTMLDivElement = document.getElementById("thumbnailsContainer") as HTMLDivElement;
        thumbnailsContainer.setAttribute("style", "display:none;");

        // show the video
        const video: HTMLVideoElement = document.getElementById("video" + href) as HTMLVideoElement;
        video.setAttribute("style", "margin-top:100px;");

        // show the red back button
        const div: HTMLDivElement = document.createElement("div");
        div.setAttribute("onclick", "goBack(this)");
        div.setAttribute("style", "width:100%;height:100vh;background-color:darkred;opacity:0.8;");
        div.id = href;
        video.after(div);
    }
}

function goBack(div: HTMLDivElement): void {
    // show the thumbnails
    const thumbnailsContainer: HTMLDivElement = document.getElementById("thumbnailsContainer") as HTMLDivElement;
    thumbnailsContainer.setAttribute("style", "display:block;");

    // remove the video
    const video: HTMLVideoElement = document.getElementById("video" + div.id) as HTMLVideoElement;
    video.remove();
    div.remove();

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

