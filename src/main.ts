const CSS_INNER_HTML: string = `/* level 1 */
body {
    margin: 0;
    background-color: black;
    padding-top: 100px;
    padding-bottom: 200px;
}

img, video {
    display: block;
    width: 100%;
}

video {
    margin-bottom: 100px;
}

.loading {
    background-color: hsl(30, 75%, 50%);
}

.loaded {
    background-color: hsl(120, 75%, 50%);
}

.loading > img, .loaded > img {
    opacity: 0.5;
}

.level-one-thumbnail-container {
    position: relative;
}

.latest-container {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: end;
    width: 100%;
    font-family: sans-serif;
    color: white;
}

.last-watched-element, .last-available-element {
    background-color: rgba(0, 0, 0, 0.5);
    width: 50%;
}

.last-watched-element > div:nth-child(2), .last-available-element > div:nth-child(2) {
    font-size: 2rem;
}

.last-available-element {
    display: flex;
    flex-direction: column;
    align-items: end;
}

/* level 2 */
.go-back-video {
    width: 100%;
    height: 100vh;
    background-color: hsl(0, 50%, 25%);
}

.refresh {
    margin: 200px 0;
}

.go-back-manga, .go-back {
    width: 100%;
    height: 30vh;
    background-color: hsl(0, 50%, 25%);
    margin-top: -100px;
}

.refresh, .chapter-button {
    font-size: 1.2rem;
    line-height: 3;
    text-align: center;
    width: 100%;
}

.chapter-container {
    display: flex;
    font-size: 1.2rem;
    font-family: sans-serif;
    color: white;
    align-items: center;
}

.last-read-container {
    width: 100%;
}

.last-read {
    margin-left: 10px;
}

.level-two-thumbnail-container {
    position: relative;
    width: 50%;
}

.last-read-gallery, .gallery-page {
    background-color: rgba(0, 0, 0, 0.5);
}

.last-read-gallery {
    margin-right: auto;
}

.gallery-page {
    margin-left: auto;
    font-size: 2rem;
}

/* level 3 */
.go-back {
    position: fixed;
    left: 0;
    top: 0;
    animation: fadeout 1s linear 0s 1 normal forwards running;
}

@keyframes fadeout {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.info, .info-clicked {
    position: fixed;
    left: 0;
    top: 30%;
    height: 30%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.info {
    background-color: rgba(0, 0, 0, 0.0);
}

.info-clicked {
    background-color: rgba(0, 0, 0, 0.7);
}

.info-content {
    display: none;
}

.info-content-clicked {
    display: block;
    font-size: 1.1rem;
    font-family: sans-serif;
    color: white;
    line-height: 2;
    margin: 20px;
}
`;

function loadContent(): void {
    document.write("<html><head></head><body></body></html>");
    const body = document.querySelector("body");
    const head = document.querySelector("head");
    const levelOneContainer: HTMLDivElement = Utilities.createTagWithId("div", Content.L1_CONTAINER_ID) as HTMLDivElement;
    body.appendChild(levelOneContainer);
    const styleTag: HTMLScriptElement = Utilities.createTagWithId("style", "content-enhancer-css") as HTMLScriptElement;
    styleTag.innerHTML = CSS_INNER_HTML;
    head.appendChild(styleTag);

    const content: Content = createContent(location.href);
    content?.load(); // asynchronously
}

function createContent(href: string): Content {
    let content: Content = null;
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion(href);
    } else if (href.includes("kissjav")) {
        content = new KissJav(href);
    } else if (href.includes("ytboob")) {
        content = new YtBoob(href);
    } else if (href.includes("nhentai")) {
        content = new NHentai(href);
    } else if (href.includes("exhentai") || href.includes("e-hentai")) {
        content = new ExHentai(href);
    } else if (href.includes("asurascans")) {
        content = new AsuraScans(href);
    } else if (href.includes("kissmanga")) {
        content = new KissManga(href);
    }

    return content;
}

loadContent();
