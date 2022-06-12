async function loadL1(): Promise<void> {
    if (nextSearchResultsHref !== "") {
        const l1Container: HTMLDivElement = document.getElementById(L1_CONTAINER_ID) as HTMLDivElement;

        // get the search results thumbnails
        const searchResultsDocument: Document = await getResponseDocument(nextSearchResultsHref);
        const searchResultsThumbnails: HTMLImageElement[] = getSearchResultsThumbnails(searchResultsDocument);
        // set the next href
        setNextSearchResultsHref(searchResultsDocument);
        observeLastElement(searchResultsThumbnails);
        await loadThumbnail(searchResultsThumbnails, l1Container);
    }
}
