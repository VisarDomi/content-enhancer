let pageCounter: number = 1;
let nextPage: HTMLAnchorElement;
let scrollPosition: number;
let href: string;
const TOKYOMOTION: string = "tokyomotion";
const KISSJAV: string = "kissjav";
const NHENTAI: string = "nhentai";

(async ()=>{
    href = location.href;
    setNextPage(document);

    // collect the thumbnails before the html element is removed
    let thumbnailImages: HTMLImageElement[] = getThumbnailImages(document);

    // set up the html
    const contentEnhancerElements: HTMLCollectionOf<HTMLScriptElement> = document.getElementsByClassName("content-enhancer") as HTMLCollectionOf<HTMLScriptElement>;
    const clonedElements: HTMLElement[] = [];
    for (const contentEnhancerElement of contentEnhancerElements) {
        clonedElements.push(contentEnhancerElement.cloneNode(true) as HTMLElement);
    }
    document.body.parentElement.remove(); // remove the html element
    const body: HTMLBodyElement = document.createElement("body");
    const html: HTMLHtmlElement = document.createElement("html");
    const head: HTMLHeadElement = document.createElement("head");
    for (const contentEnhancer of clonedElements) {
        head.appendChild(contentEnhancer);
    }
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    // create a container for the thumbnails
    const thumbnailsContainer: HTMLDivElement = document.createElement("div");
    thumbnailsContainer.id = "thumbnails-container";
    body.appendChild(thumbnailsContainer);

    // append the thumbnails to the container
    for (const thumbnailImage of thumbnailImages) {
        thumbnailsContainer.appendChild(thumbnailImage);
    }

    // load the thumbnails of the next page
    // TODO: set a limit here, just 10 pages at a time, with a load more button
    await loadFirstLevel();
})();


function getThumbnailImages(responseDocument: Document): HTMLImageElement[] {
    const thumbnailImages: HTMLImageElement[] = [];
    let thumbnailList: HTMLCollectionOf<HTMLElement>;
    if (href.includes(TOKYOMOTION)) {
        thumbnailList = responseDocument.getElementsByClassName("thumb-popu") as HTMLCollectionOf<HTMLAnchorElement>;
    } else if (href.includes(KISSJAV)) {
        thumbnailList = responseDocument.getElementsByClassName("videos")[0].children as HTMLCollectionOf<HTMLLIElement>;
    }
    for (const thumbnailElement of thumbnailList) {
        let secondLevelHref: HTMLAnchorElement;
        let firstLevelThumbnailImage: HTMLImageElement;
        if (href.includes(TOKYOMOTION)) {
            secondLevelHref = thumbnailElement as HTMLAnchorElement;
            firstLevelThumbnailImage = secondLevelHref.children[0].children[0] as HTMLImageElement;
        } else if (href.includes(KISSJAV)) {
            secondLevelHref = thumbnailElement.children[0].children[0].children[0].children[0] as HTMLAnchorElement;
            firstLevelThumbnailImage = secondLevelHref?.children[0] as HTMLImageElement;
            if (firstLevelThumbnailImage === undefined) {
                continue; // don't do anything, it's an ad
            }
            if (firstLevelThumbnailImage.src.includes("loading.jpg")) {
                firstLevelThumbnailImage.src = firstLevelThumbnailImage.getAttribute("data-src");
            }
        }
        const thumbnailImage: HTMLImageElement = new Image();
        thumbnailImage.setAttribute("data-href", secondLevelHref.href);
        thumbnailImage.setAttribute("onclick", "loadSecondLevel(this)"); // we do it this way to split the code into several files
        thumbnailImage.src = firstLevelThumbnailImage.src;
        thumbnailImages.push(thumbnailImage);
    }
    return thumbnailImages;
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

function setNextPage(currentDocument: Document): void {
    // set pagination parameters
    if (href.includes(TOKYOMOTION)) {
        nextPage = currentDocument.getElementsByClassName("prevnext")[0] as HTMLAnchorElement;
    } else if (href.includes(KISSJAV)) {
        nextPage = currentDocument.getElementsByClassName("pagination-next")[0] as HTMLAnchorElement;
    } else if (href.includes(NHENTAI)) {
        nextPage = currentDocument.getElementsByClassName("last")[0] as HTMLAnchorElement;
    }
}
