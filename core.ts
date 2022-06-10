let pc: number = 1; // page counter
let nrp: HTMLAnchorElement; // next result page
let nip: HTMLAnchorElement; // next image page
let l1sp: number; // level 1 scroll position
let oh: string; // original href
let bl: boolean; // break loop - don't send any more requests if you go back a level
const L1 = "l1-container"; // level 1 container id
const TM: string = "tokyomotion";
const KJ: string = "kissjav";
const NH: string = "nhentai";
const AS: string = "asurascans";

(async () => {
    oh = location.href;
    setNextResultPage(document);

    // collect the thumbnails before the html element is removed
    let thumbnailImages: HTMLImageElement[] = getThumbnailImages(document);

    // set up the html
    const contentEnhancers: NodeListOf<HTMLScriptElement> = document.querySelectorAll(".content-enhancer") as NodeListOf<HTMLScriptElement>;
    document.body.parentElement.remove(); // remove the html element
    const body: HTMLBodyElement = document.createElement("body");
    const html: HTMLHtmlElement = document.createElement("html");
    const head: HTMLHeadElement = document.createElement("head");
    for (const contentEnhancer of contentEnhancers) {
        head.appendChild(contentEnhancer);
    }
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    // create level 1
    const l1Container: HTMLDivElement = document.createElement("div");
    l1Container.id = L1;
    body.appendChild(l1Container);

    // append the thumbnails to the container
    for (const thumbnailImage of thumbnailImages) {
        l1Container.appendChild(thumbnailImage);
    }

    // load the thumbnails of the next page
    await loadL1();
})();

function getThumbnailImages(responseDocument: Document): HTMLImageElement[] {
    const thumbnailImages: HTMLImageElement[] = [];
    let thumbnailList: any;
    if (oh.includes(TM)) { // TODO: use OOP
        thumbnailList = responseDocument.querySelectorAll(".thumb-popu") as NodeListOf<HTMLAnchorElement>;
    } else if (oh.includes(KJ)) {
        thumbnailList = responseDocument.querySelector(".videos").children as HTMLCollectionOf<HTMLLIElement>;
    } else if (oh.includes(NH)) {
        thumbnailList = responseDocument.querySelector(".index-container").children as HTMLCollectionOf<HTMLDivElement>;
    }
    for (const thumbnailElement of thumbnailList) {
        let secondLevelHref: HTMLAnchorElement;
        let firstLevelThumbnailImage: HTMLImageElement;
        if (oh.includes(TM)) { // TODO: use OOP
            secondLevelHref = thumbnailElement as HTMLAnchorElement;
            firstLevelThumbnailImage = secondLevelHref.children[0].children[0] as HTMLImageElement;
        } else if (oh.includes(KJ)) {
            secondLevelHref = thumbnailElement.children[0].children[0].children[0].children[0] as HTMLAnchorElement;
            firstLevelThumbnailImage = secondLevelHref?.children[0] as HTMLImageElement;
            if (firstLevelThumbnailImage === undefined) {
                continue; // don't do anything, it's an ad
            }
        } else if (oh.includes(NH)) {
            secondLevelHref = thumbnailElement.children[0] as HTMLAnchorElement;
            firstLevelThumbnailImage = secondLevelHref.children[0] as HTMLImageElement;
        }
        if (firstLevelThumbnailImage.getAttribute("data-src") !== null) {
            firstLevelThumbnailImage.src = firstLevelThumbnailImage.getAttribute("data-src");
        }
        const thumbnailImage: HTMLImageElement = new Image();
        thumbnailImage.setAttribute("data-href", secondLevelHref.href);
        thumbnailImage.setAttribute("onclick", "loadL2(this)"); // we do it this way to split the code into several files
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

function setNextResultPage(currentDocument: Document): void {
    if (oh.includes(TM)) { // TODO: use OOP
        nrp = currentDocument.getElementsByClassName("prevnext")[0] as HTMLAnchorElement;
    } else if (oh.includes(KJ)) {
        nrp = currentDocument.getElementsByClassName("pagination-next")[0] as HTMLAnchorElement;
    } else if (oh.includes(NH)) {
        nrp = currentDocument.getElementsByClassName("next")[0] as HTMLAnchorElement;
    }
}
