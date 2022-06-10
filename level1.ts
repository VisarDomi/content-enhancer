async function loadL1(): Promise<void> {
    pc++;
    const response: Response = await getResponse(np.href);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
    const thumbnailsImages: HTMLImageElement[] = getThumbnailImages(responseDocument);
    const l1Container: HTMLDivElement = document.getElementById(L1) as HTMLDivElement;
    for (const thumbnailImage of thumbnailsImages) {
        l1Container.appendChild(thumbnailImage);
    }

    setNextPage(responseDocument);

    if (np !== undefined) {
        if (pc < 2) { //don't load the 11th page unless we load it with a load more button
            await loadL1();
        } else {
            //TODO: the load more button will load the next 10 pages and destroy the current 10 pages
            const loadMoreButton: HTMLButtonElement = document.createElement("button");
            loadMoreButton.className = "load-more";
            loadMoreButton.innerText = "Load More";
            l1Container.appendChild(loadMoreButton);
            loadMoreButton.onclick = loadL1; // recursion
        }
    }
}
