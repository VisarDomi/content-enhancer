let level2ScrollPosition: number;
let nextImageHref: string;
let breakLoop: boolean; // don't send any more requests if you go back to level 2

async function loadL3(galleryThumbnail: HTMLImageElement): Promise<void> {
    // scroll to the top - order matters
    level2ScrollPosition = window.scrollY;
    window.scrollTo({top: 0});

    // create level 3
    const l2ContainerId: string = galleryThumbnail.getAttribute("data-l2-id");
    const l2Container: HTMLDivElement = document.getElementById(l2ContainerId) as HTMLDivElement;
    const l3Href: string = galleryThumbnail.getAttribute("data-href");
    const l3ContainerId: string = "l3" + l3Href;
    const l3Container: HTMLDivElement = document.createElement("div");
    l3Container.id = l3ContainerId;
    document.body.appendChild(l3Container);
    l2Container.className = "hide"; // hide level 2
    createGoToL2(l2Container, l3Container, "goToL2");

    // now it's time to load the images TODO: use OOP
    nextImageHref = l3Href;
    breakLoop = false;
    await loadL3Image(l3Container);
}

function createGoToL2(l2Container: HTMLDivElement, l3Container: HTMLDivElement, functionName: string): void {
    // the back button
    const goToL2: HTMLDivElement = document.createElement("div");
    goToL2.className = "go-back";
    goToL2.setAttribute("onclick", functionName + "('" + l2Container.id + "', '" + l3Container.id + "')");
    l3Container.appendChild(goToL2);
}

function goToL2(l2ContainerId: string, l3ContainerId: string): void {
    document.getElementById(l2ContainerId).className = "show"; // show level 2
    document.getElementById(l3ContainerId).remove(); // destroy level 3

    // break loop - stop requesting new images TODO: use OOP
    breakLoop = true;

    // scroll to level 2 scroll position
    window.scrollTo({top: level2ScrollPosition});
}

async function loadL3Image(l3Container: HTMLDivElement): Promise<void> {
    if (nextImageHref !== "" && !breakLoop) {
        // get the next image
        const imageDocument: Document = await getResponseDocument(nextImageHref);

        // append the image to the container
        const image: HTMLImageElement = imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
        const l3Image: HTMLImageElement = new Image();
        l3Image.src = image.src;
        l3Container.appendChild(l3Image);

        // set the next image to be loaded TODO: use OOP
        const nextImage = imageDocument.querySelector(".next") as HTMLAnchorElement;
        nextImageHref = nextImage === null ? "" : nextImage.href;

        // load the next image
        l3Image.onload = async () => {
            await loadL3Image(l3Container);
        }
        l3Image.onerror = async () => {
            await onImageLoadError(l3Image);
        }
    } else {
        // a load more button for asurascans
    }
}
