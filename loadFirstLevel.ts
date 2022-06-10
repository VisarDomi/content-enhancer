async function loadFirstLevel(): Promise<void> {
    pageCounter++;
    const response: Response = await getResponse(nextPage.href);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
    const thumbnails: HTMLImageElement[] = getThumbnailImages(responseDocument);
    const thumbnailsContainer: HTMLDivElement = document.getElementById("thumbnailsContainer") as HTMLDivElement;
    for (const thumbnail of thumbnails) {
        thumbnailsContainer.appendChild(thumbnail);
    }

    setNextPage(responseDocument);

    if (nextPage !== undefined) {
        if (pageCounter < 10) { //don't load the 11th page unless we load it with a load more button
                await loadFirstLevel();
        } else {
            //TODO: the load more button will
            const loadMoreButton = document.createElement("button");
            loadMoreButton.innerText = "Load More";
            thumbnailsContainer.appendChild(loadMoreButton);
        }
    }
}
