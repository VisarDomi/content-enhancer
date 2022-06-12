async function loadL1(): Promise<void> {
    if (nextSearchResultsHref !== EMPTY_STRING) {
        const l1Container: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;

        // get the search results thumbnails
        const searchResultsDocument: Document = await getResponseDocument(nextSearchResultsHref);
        const searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(searchResultsDocument);
        // set the next href
        setNextSearchResultsHref(searchResultsDocument);
        observeLastImage(searchResultsThumbnails, THUMBNAIL);
        await loadThumbnail(searchResultsThumbnails, l1Container);
    }
}
