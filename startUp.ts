(async () => {
    const nextSearchResultsHref: string= getNextSearchResultsHref(document);

    // collect the thumbnails before the html element is removed
    const searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(document, nextSearchResultsHref);

    // set up the html
    const contentEnhancers: NodeListOf<HTMLScriptElement> = document.querySelectorAll(".content-enhancer") as NodeListOf<HTMLScriptElement>;
    document.querySelector("body").parentElement.remove(); // destroy everything
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
    const levelOneContainer: HTMLDivElement = createTagWithId("div", L1_CONTAINER_ID) as HTMLDivElement;
    body.appendChild(levelOneContainer);

    observeLastImage(searchResultsThumbnails, THUMBNAIL);
    await loadThumbnail(searchResultsThumbnails, levelOneContainer);
})();
