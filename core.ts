let nextSearchResultsHref: string;
let originalHref: string;
const L1_CONTAINER_ID: string = "l1-container";

const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";
const ASURASCANS: string = "asurascans";

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

    await loadThumbnail(searchResultsThumbnails, l1Container);
})();

function setNextSearchResultsHref(currentDocument: Document): void {
    let anchor: HTMLAnchorElement = null;
    if (originalHref.includes(TOKYOMOTION)) { // TODO: use OOP
        anchor = currentDocument.querySelector(".prevnext") as HTMLAnchorElement;
    } else if (originalHref.includes(KISSJAV)) {
        anchor = currentDocument.querySelector(".pagination-next") as HTMLAnchorElement;
    } else if (originalHref.includes(NHENTAI)) {
        anchor = currentDocument.querySelector(".next") as HTMLAnchorElement;
    } else if (originalHref.includes(ASURASCANS)) {
        anchor = currentDocument.querySelector(".r") as HTMLAnchorElement;
    }
    nextSearchResultsHref = anchor === null ? "" : anchor.href;
}

function getSearchResultsThumbnails(responseDocument: Document): HTMLImageElement[] {
    const searchResultsThumbnails: HTMLImageElement[] = [];

    // TODO: use OOP
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

        // TODO: use OOP
        if (originalHref.includes(TOKYOMOTION)) {
            l2Href = thumbnail as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0].children[0] as HTMLImageElement;
        } else if (originalHref.includes(KISSJAV)) {
            l2Href = thumbnail.children[0].children[0].children[0].children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href?.children[0] as HTMLImageElement;
            if (l1Thumbnail === undefined) {
                continue; // don't do anything, it's an ad
            }
        } else if (originalHref.includes(NHENTAI)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
        } else if (originalHref.includes(ASURASCANS)) {
            l2Href = thumbnail.children[0] as HTMLAnchorElement;
            l1Thumbnail = l2Href.children[0] as HTMLImageElement;
        }

        pushThumbnail(l1Thumbnail, l2Href, "loadL2", searchResultsThumbnails);
    }

    return searchResultsThumbnails;
}

function pushThumbnail(levelThumbnail: HTMLImageElement, levelHref: HTMLAnchorElement, functionName: string, thumbnails: HTMLImageElement[]) {
    // fix lazy-loading
    if (levelThumbnail.getAttribute("data-src") !== null) {
        levelThumbnail.src = levelThumbnail.getAttribute("data-src");
    }

    // we got all the needed data
    const thumbnail: HTMLImageElement = new Image();
    thumbnail.setAttribute("data-href", levelHref.href);
    thumbnail.setAttribute("onclick", functionName + "(this)"); // we do it this way to split the code into several files
    thumbnail.setAttribute("data-src", levelThumbnail.src);
    thumbnails.push(thumbnail);
}

async function getResponseDocument(href: string): Promise<Document> {
    const response: Response = await getResponse(href);
    const text: string = await response.text();
    return new DOMParser().parseFromString(text, "text/html");
}

async function getResponse(href: string): Promise<Response> {
    const response: Response = await fetch(href);
    if (response.status === 200) { // the base case, the response was successful
        return response;
    } else { // wait 5 seconds before retrying
        await waitFor(5000);
        return await getResponse(href);
    }
}

async function waitFor(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function onImageLoadError(image: HTMLImageElement) {
    // reload the image in 5 seconds
    await waitFor(5000);
    let imageSrc: string = image.src;
    const timeIndex: number = imageSrc.indexOf("?time=");
    const time: string = "?time=" + Date.now();
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
        thumbnail.src = thumbnail.getAttribute("data-src");
        thumbnail.onload = async () => {
            await loadThumbnail(thumbnails, container, ++index);
        }
    } else if (index === thumbnails.length && container.id === L1_CONTAINER_ID) {
        createLoadMoreButton(container);
    }
}

function createLoadMoreButton(l1Container: HTMLDivElement): void {
    // TODO: use the intersection API instead
    const loadMoreButton: HTMLButtonElement = document.createElement("button");
    loadMoreButton.className = "load-more";
    loadMoreButton.innerText = "Load More";
    l1Container.appendChild(loadMoreButton);
    loadMoreButton.onclick = async () => {
        loadMoreButton.remove();
        await loadL1();
    }
}
