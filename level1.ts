async function loadL1(): Promise<void> {
    pc++;
    const response: Response = await getResponse(nrp.href);
    const text: string = await response.text();
    const responseDocument: Document = new DOMParser().parseFromString(text, "text/html");
    const thumbnailsImages: HTMLImageElement[] = getThumbnailImages(responseDocument);
    const l1Container: HTMLDivElement = document.getElementById(L1) as HTMLDivElement;
    for (const thumbnailImage of thumbnailsImages) {
        l1Container.appendChild(thumbnailImage);
    }

    setNextResultPage(responseDocument);

    if (nrp !== undefined) {
        if (pc < 2) { // TODO: change this from 2 to 10 after development
            await loadL1();
        } else {
            const loadMoreButton: HTMLButtonElement = document.createElement("button");
            loadMoreButton.className = "load-more";
            loadMoreButton.innerText = "Load More";
            l1Container.appendChild(loadMoreButton);
            loadMoreButton.onclick = loadL1; // recursion
        }
    }
}
