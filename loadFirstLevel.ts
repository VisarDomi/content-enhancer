async function loadFirstLevel(): Promise<void> {
    pageCounter++;
    const response: Response = await getResponse(nextPage.href);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
    const thumbnailsImages: HTMLImageElement[] = getThumbnailImages(responseDocument);
    const thumbnailsContainer: HTMLDivElement = document.getElementById("thumbnails-container") as HTMLDivElement;
    for (const thumbnailImage of thumbnailsImages) {
        thumbnailsContainer.appendChild(thumbnailImage);
    }

    setNextPage(responseDocument);

    if (nextPage !== undefined) {
        if (pageCounter < 10) { //don't load the 11th page unless we load it with a load more button
                await loadFirstLevel();
        } else {
            //TODO: the load more button will
            const loadMoreButton: HTMLButtonElement = document.createElement("button");
            loadMoreButton.className = "load-more";
            loadMoreButton.innerText = "Load More";
            thumbnailsContainer.appendChild(loadMoreButton);
        }
    }
}
