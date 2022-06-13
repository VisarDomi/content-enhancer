// settings
const LOOK_AHEAD = "1000%"; // look ahead 10 screens

// logic
let retry: boolean = true; // do we retry a request every 5 seconds?
let nextSearchResultsHref: string;
let originalHref: string;

// string names
const L1_CONTAINER_ID: string = "l1-container";
const L2_CONTAINER_ID: string = "l2-container";
const L3_CONTAINER_ID: string = "l3-container";
const THUMBNAIL = "observeThumbnail";
const IMAGE = "observeImage";
const DATA_SRC = "data-src";
const DATA_CFSRC = "data-cfsrc";
const DATA_HREF = "data-href";
const EMPTY_STRING = "";
const ONCLICK = "onclick";
const CLASS = "class";
const BLOCK = "block";
const FLEX = "flex";
const NONE = "none";

// websites
const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";
const ASURASCANS: string = "asurascans";

function setNextSearchResultsHref(currentDocument: Document): void {
    let anchor: HTMLAnchorElement = null;
    if (originalHref.includes(TOKYOMOTION)) {
        anchor = currentDocument.querySelector(".prevnext") as HTMLAnchorElement;
    } else if (originalHref.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next") as HTMLAnchorElement;
    } else if (originalHref.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next") as HTMLAnchorElement;
    } else if (originalHref.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r") as HTMLAnchorElement;
    }
    nextSearchResultsHref = anchor === null ? EMPTY_STRING : anchor.href;
}

function getSearchResultsThumbnails(responseDocument: Document): HTMLImageElement[] {
    const searchResultsThumbnails: HTMLImageElement[] = [];
    const thumbnailList: HTMLElement[] = [];
    if (originalHref.includes(TOKYOMOTION)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".thumb-popu") as NodeListOf<HTMLAnchorElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(KISSJAV)) {
        const selectedElements: HTMLCollectionOf<HTMLLIElement> = responseDocument.querySelector(".videos").children as HTMLCollectionOf<HTMLLIElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(NHENTAI)) {
        const selectedElements: HTMLCollectionOf<HTMLDivElement> = responseDocument.querySelector(".index-container").children as HTMLCollectionOf<HTMLDivElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    } else if (originalHref.includes(ASURASCANS)) {
        const selectedElements: NodeListOf<HTMLAnchorElement> = responseDocument.querySelectorAll(".imgu") as NodeListOf<HTMLAnchorElement>;
        thumbnailList.splice(0, 0, ...Array.from(selectedElements));
    }
    for (const thumbnail of thumbnailList) {
        let l2Href: HTMLAnchorElement;
        let l1Thumbnail: HTMLImageElement;

        if (originalHref.includes(TOKYOMOTION)) {
            l2Href = thumbnail as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0].children[0] as HTMLImageElement;
        } else if (originalHref.includes(KISSJAV)) {
            l2Href = thumbnail.children[0].children[0].children[0].children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href?.children[0] as HTMLImageElement;
            if (l1Thumbnail === undefined) {
                continue; // don't do anything, it's an ad
            }
            if (l1Thumbnail.getAttribute(DATA_SRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_SRC);
            }
        } else if (originalHref.includes(NHENTAI)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
            if (l1Thumbnail.getAttribute(DATA_SRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_SRC);
            }
        } else if (originalHref.includes(ASURASCANS)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
            // fix lazy-loading
            if (l1Thumbnail.getAttribute(DATA_CFSRC) !== null) {
                l1Thumbnail.src = l1Thumbnail.getAttribute(DATA_CFSRC);
            }
        }

        pushThumbnail(l1Thumbnail, l2Href, "loadL2", searchResultsThumbnails, "l1-thumbnail");
    }

    return searchResultsThumbnails;
}

function pushThumbnail(levelThumbnail: HTMLImageElement, levelHref: HTMLAnchorElement, functionName: string, thumbnails: HTMLImageElement[], className: string): void {
    // we got all the needed data
    const thumbnail: HTMLImageElement = new Image();
    thumbnail.setAttribute(DATA_HREF, levelHref.href);
    thumbnail.setAttribute(ONCLICK, functionName + "(this)"); // we do it this way to split the code into several files
    thumbnail.setAttribute(DATA_SRC, levelThumbnail.src);
    thumbnail.className = className;
    thumbnails.push(thumbnail);
}

async function getResponseDocument(href: string): Promise<Document> {
    const response: Response = await getResponse(href);
    if (response !== null) {
        const text: string = await response.text();
        return new DOMParser().parseFromString(text, "text/html");
    } else {
        return null;
    }
}

async function getResponse(href: string): Promise<Response> {
    const response: Response = await fetch(href);
    if (response.status === 200) { // the base case, the response was successful
        return response;
    } else if (!retry) {
        return null; // do not retry
    } else { // wait 5 seconds before retrying
        await waitFor(5000);
        return await getResponse(href);
    }
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function onImageLoadError(image: HTMLImageElement): Promise<void> {
    // reload the image in 5 seconds
    await waitFor(5000);
    let imageSrc: string = image.src;
    const TIME = "?time=";
    const timeIndex: number = imageSrc.indexOf(TIME);
    const time: string = TIME + Date.now();
    if (timeIndex !== -1) {
        imageSrc = imageSrc.substring(0, timeIndex) + time;
    } else {
        imageSrc += time;
    }
    image.src = imageSrc;
}

async function loadThumbnail(thumbnails: HTMLImageElement[], container: HTMLDivElement, index: number = 0): Promise<void> {
    if (index < thumbnails.length) {
        const thumbnail = thumbnails[index];
        container.appendChild(thumbnail);
        thumbnail.src = thumbnail.getAttribute(DATA_SRC);
        thumbnail.onload = async () => {
            await loadThumbnail(thumbnails, container, ++index);
        }
        thumbnail.onerror = async () => {
            await onImageLoadError(thumbnail);
        }
    } else if (index === thumbnails.length && container.id === L1_CONTAINER_ID) { // load new pages using the Intersection API - functional programming
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
                    observer.unobserve(entryTarget);
                    entryTarget.removeAttribute(CLASS);
                    await loadL1();
                }
            })
        }
        const options: {} = {
            root: null,
            rootMargin: LOOK_AHEAD
        }
        const observer: IntersectionObserver = new IntersectionObserver(callback, options);
        const target: HTMLImageElement = document.querySelector("." + THUMBNAIL) as HTMLImageElement;
        observer.observe(target);
    }
}

function observeLastImage(images: HTMLImageElement[], className: string): void {
    // start loading the thumbnails
    const image: HTMLImageElement = images.pop();
    image.className = className;
    images.push(image);
}

function createBackButton(container: HTMLDivElement, functionName: string, className: string): void {
    const backButton: HTMLDivElement = document.createElement("div");
    backButton.className = className;
    backButton.setAttribute(ONCLICK, functionName + "(this)");
    container.appendChild(backButton);
}

(async () => {
    originalHref = location.href;
    setNextSearchResultsHref(document);

    // collect the thumbnails before the html element is removed
    let searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(document);

    // set up the html
    const contentEnhancers: NodeListOf<HTMLScriptElement> = document.querySelectorAll(".content-enhancer") as NodeListOf<HTMLScriptElement>;
    document.body.parentElement.remove(); // destroy everything
    const html: HTMLHtmlElement = document.createElement("html");
    const body: HTMLBodyElement = document.createElement("body");
    const head: HTMLHeadElement = document.createElement("head");
    for (const contentEnhancer of contentEnhancers) {
        head.appendChild(contentEnhancer);
    }
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    // level 1
    const l1Container: HTMLDivElement = document.createElement("div");
    l1Container.id = L1_CONTAINER_ID;
    body.appendChild(l1Container);

    observeLastImage(searchResultsThumbnails, THUMBNAIL);
    await loadThumbnail(searchResultsThumbnails, l1Container);
})();
