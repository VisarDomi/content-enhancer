// let level2ScrollPosition: number;
// let nextImageHref: string;
// let infoClicked: boolean;
// let breakLoop: boolean; // don't send any more requests if you go back a level
//
// async function loadLevelThree(element: HTMLElement): Promise<void> {
//     breakLoop = false;
//
//     // scroll to the top - order matters
//     level2ScrollPosition = window.scrollY;
//     window.scrollTo({top: 0});
//
//     // create level 3
//     const levelTwoContainer: HTMLDivElement = document.getElementById(L2_CONTAINER_ID) as HTMLDivElement;
//     const levelThreeHref: string = element.getAttribute(DATA_LEVEL_THREE_HREF);
//     const levelThreeContainer: HTMLDivElement = createTagWithId("div", L3_CONTAINER_ID) as HTMLDivElement;
//     document.querySelector("body").appendChild(levelThreeContainer);
//     levelTwoContainer.style.display = NONE; // hide level 2
//     const backButton: HTMLDivElement = createTagWithId("div", "go-to-level-two") as HTMLDivElement;
//     backButton.className = "go-back";
//     backButton.onclick = goToLevelTwo;
//
//     const info: HTMLDivElement = createTagWithClassName("div", "info") as HTMLDivElement;
//     const clicker: HTMLDivElement = createTagWithClassName("div", "clicker") as HTMLDivElement;
//     infoClicked = false;
//     clicker.onclick = () => {
//         infoClicked = !infoClicked; // change the status
//         if (infoClicked) {
//             info.className = "info-clicked"
//         } else {
//             info.className = "info";
//         }
//     }
//
//     const span: HTMLSpanElement = createTagWithClassName("span", "info-content") as HTMLSpanElement;
//     span.innerText = levelThreeHref;
//
//     info.appendChild(span);
//     levelThreeContainer.appendChild(info);
//     levelThreeContainer.appendChild(clicker);
//
//     // now it's time to load the images
//     if (ORIGINAL_HREF.includes(NHENTAI)) {
//         nextImageHref = levelThreeHref;
//         await loadHMangaImage(levelThreeContainer);
//     } else if (ORIGINAL_HREF.includes(ASURASCANS)) {
//         const images: HTMLImageElement[] = await getAsImages(levelThreeHref);
//         setLastImageClassName(images, OBSERVE_IMAGE);
//         await loadNhMangaImage(images, levelThreeContainer);
//     }
// }
//
// function setLastImageClassName(images: HTMLImageElement[], className: string): void {
//     const image: HTMLImageElement = images.pop();
//     image.className = className;
//     images.push(image);
// }
//
// function goToLevelTwo(): void {
//     const backButton: HTMLDivElement = document.getElementById("go-to-level-two") as HTMLDivElement;
//     document.getElementById(L2_CONTAINER_ID).style.display = FLEX; // show level 2
//     document.getElementById(backButton.parentElement.id).remove(); // destroy level 3
//
//     // stop requests
//     breakLoop = true;
//
//     // update level 2 chapter information
//     const lastRead: HTMLSpanElement = document.getElementById(currentChapterHref) as HTMLSpanElement;
//     lastRead.innerText = getTimeAgo(Date.now() + "");
//
//     // scroll to level 2 scroll position
//     window.scrollTo({top: level2ScrollPosition});
// }
//
// async function loadHMangaImage(levelThreeContainer: HTMLDivElement): Promise<void> {
//     if (nextImageHref !== EMPTY_STRING && !breakLoop) {
//         // get the next image
//         const imageDocument: Document = await getResponseDocument(nextImageHref);
//
//         // append the image to the container
//         const image: HTMLImageElement = imageDocument.getElementById("image-container").children[0].children[0] as HTMLImageElement;
//         const levelThreeImage: HTMLImageElement = new Image();
//         levelThreeImage.src = image.src;
//         levelThreeContainer.appendChild(levelThreeImage);
//
//         // set the next image to be loaded
//         const nextImage = imageDocument.querySelector(".next") as HTMLAnchorElement;
//         if (nextImage === null) {
//             nextImageHref = EMPTY_STRING;
//         } else {
//             nextImageHref = nextImage.href;
//         }
//
//         // load the next image
//         levelThreeImage.onload = async () => {
//             await loadHMangaImage(levelThreeContainer);
//         }
//         levelThreeImage.onerror = async () => {
//             await onImageLoadError(levelThreeImage);
//         }
//     } else {
//         // save the info of the current image
//         const setInfo = (entries: IntersectionObserverEntry[]) => {
//             entries.forEach(async entry => {
//                 if (entry.isIntersecting) {
//                     const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
//                     localStorage.setItem(entryTarget.src, Date.now() + "");
//                 }
//             })
//         }
//         const infoOptions: {} = {
//             root: null,
//             rootMargin: "0px"
//         }
//         const infoObserver: IntersectionObserver = new IntersectionObserver(setInfo, infoOptions);
//         const targets: NodeListOf<HTMLImageElement> = levelThreeContainer.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
//         targets.forEach(target => {
//             infoObserver.observe(target);
//         })
//     }
// }
//
// async function getAsImages(href: string, retry: boolean = true): Promise<HTMLImageElement[]> {
//     const images: HTMLImageElement[] = [];
//     const chapter: Document = await getResponseDocument(href, retry);
//     if (chapter !== null) {
//         const viewports: number[] = [];
//         const readerAreaChildren: HTMLCollectionOf<Element> = chapter.getElementById("readerarea").children;
//         for (let i: number = 0; i < readerAreaChildren.length; i++) {
//             // find all the indexes of the children that have the class ai-viewport-2
//             if (readerAreaChildren[i].getAttribute(CLASS)?.includes("ai-viewport-2")) {
//                 viewports.push(i);
//             }
//         }
//         viewports.pop(); // remove the last image (it's the credits image)
//         for (const viewport of viewports) {
//             // the index of the p tags are always 2 more than the index of the viewports
//             // the p tag contains only the image
//             const image: HTMLImageElement = readerAreaChildren[viewport + 2].children[0] as HTMLImageElement;
//             const newImage: HTMLImageElement = new Image();
//             newImage.setAttribute(DATA_LEVEL_TWO_HREF, href);
//             newImage.setAttribute(DATA_SRC, image.getAttribute(DATA_CFSRC))
//             images.push(newImage)
//         }
//     }
//     return images;
// }
//
// function getNextChapterHref(images: HTMLImageElement[]): string {
//     const href: string = images[0].getAttribute(DATA_LEVEL_TWO_HREF);
//     const parts: string[] = href.split(HYPHEN);
//     const chapterString: string = "chapter";
//     const indexOfChapter: number = parts.indexOf(chapterString);
//     const end: string = parts[indexOfChapter + 1];
//     const chapterNumber: string = end.substring(0, end.length - 1);
//     let nextChapterNumber: number;
//     if (end.includes(PERIOD)) { // we are on a half chapter, skip this and get the next one
//         nextChapterNumber = parseInt(chapterNumber.split(PERIOD)[0]) + 1;
//     } else {
//         nextChapterNumber = parseInt(chapterNumber) + 1;
//     }
//     let nextChapterHref: string = EMPTY_STRING;
//     for (let i: number = 0; i < indexOfChapter; i++) {
//         nextChapterHref += parts[i] + HYPHEN;
//     }
//     nextChapterHref += chapterString + HYPHEN + nextChapterNumber + "/";
//     return nextChapterHref;
// }
//
// async function loadNhMangaImage(images: HTMLImageElement[], levelThreeContainer: HTMLDivElement, index: number = 0): Promise<void> {
//     if (index < images.length && !breakLoop) {
//         const image: HTMLImageElement = images[index];
//         levelThreeContainer.append(image);
//         image.src = image.getAttribute(DATA_SRC);
//         image.onload = async () => {
//             await loadNhMangaImage(images, levelThreeContainer, ++index);
//         }
//         image.onerror = async () => {
//             await onImageLoadError(image);
//         }
//     } else if (index === images.length) {
//         // load next chapter
//         const nextChapter = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
//             entries.forEach(async entry => {
//                 if (entry.isIntersecting) {
//                     const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
//                     observer.unobserve(entryTarget);
//                     entryTarget.removeAttribute(CLASS);
//                     const nextChapterHref: string = getNextChapterHref(images);
//                     const nextChapterImages: HTMLImageElement[] = await getAsImages(nextChapterHref, false);
//                     if (nextChapterImages.length > 0) {
//                         setLastImageClassName(nextChapterImages, OBSERVE_IMAGE);
//                         await loadNhMangaImage(nextChapterImages, levelThreeContainer);
//                     }
//                 }
//             })
//         }
//         const nextChapterOptions: {} = {
//             root: null,
//             rootMargin: LOOK_AHEAD
//         }
//         const nextChapterObserver: IntersectionObserver = new IntersectionObserver(nextChapter, nextChapterOptions);
//         const target: HTMLImageElement = document.querySelector(PERIOD + OBSERVE_IMAGE) as HTMLImageElement;
//         nextChapterObserver.observe(target);
//
//         // set the info of the current image
//         const setInfo = (entries: IntersectionObserverEntry[]) => {
//             entries.forEach(async entry => {
//                 if (entry.isIntersecting) {
//                     const entryTarget: HTMLImageElement = entry.target as HTMLImageElement;
//                     const infoContent: HTMLSpanElement = document.querySelector(".info-content") as HTMLSpanElement;
//                     currentChapterHref = entryTarget.getAttribute(DATA_LEVEL_TWO_HREF);
//                     infoContent.innerText = currentChapterHref;
//                     localStorage.setItem(currentChapterHref, Date.now() + "");
//                 }
//             })
//         }
//         const infoOptions: {} = {
//             root: null,
//             rootMargin: "0px"
//         }
//         const infoObserver: IntersectionObserver = new IntersectionObserver(setInfo, infoOptions);
//         const targets: NodeListOf<HTMLImageElement> = levelThreeContainer.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
//         targets.forEach(target => {
//             infoObserver.observe(target);
//         })
//     }
// }
