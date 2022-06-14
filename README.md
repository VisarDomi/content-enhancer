# content-enhancer
Enhance the navigation of certain sites

## Develop using OOP

### Hierarchy
Content - name, thumbnail
  * Video - duration
  * Manga
    - Nh manga
    - H manga

Pagination - to be designed

### User Story

#### The Search results, level 1
- Search for mangas (videos)
- Activate the script on the search results
- The script will list the manga thumbnails (video thumbnails and duration) one after the other. Show the title over the thumbnail, with a transparent gray background
- Show 10 pages of results at a time
- At the end of the results, show a load the next 10 pages button
- Clicking this makes the button turn orange
- After the first image is loaded, destroy the current container and create a new one for the new results
- Clicking on a thumbnail will hide the search results container and show level 2.
- For videos, it will dim to 0.5, and show an orange background while loading, and a green background when the video is loaded. Clicking on a green thumbnail will hide the search results container and show level 2.

#### The Result, level 2
- Show a list of chapter of a nh manga (the video) (the gallery thumbnails for h manga)
- Have a hidden back button, which destroys level 2 and un hides level 1, and scrolls back to the correct position
- Clicking on a chapter for nh manga (a gallery thumbnail for h manga) will hide the result container and show level 3

#### The Content, level 3
- Show the images one after the other sequentially
- Show 10 chapters worth of images for nh manga (all images for h manga)
- Nh manga have a load more button to load the next 10 chapters. Clicking this will make the button turn orange and say loading. After the first image is loaded, destroy the current container and create a new one for the new chapters
- Have a hidden back button, which destroys level 3 and un hides level 2, and scroll to the correct position
- Have a hidden button for nh manga which shows the comic name, the chapter number, and the image number

## What goals are achieved by the script?

### Making the navigation more fluid
- There are only content related divs
- Showing 10 times the search results, with a load more results button
- Watching videos is easier, because you can load multiple videos at a time in the background. Then, you come back a few seconds later to watch them
- Reading nh manga is easier because you get to select a chapter and 10 chapters are loaded, with a load more chapters button
- Reading h manga is easier, as you get to select the thumbnail, and load the subsequent images as well
- The back button is invisible and is on the top left (50vw, 50vh)
- There is also an info button for nh manga, on the bottom left (50vw, 50vh)

## TODO:
- use localstorage to mark clicked videos and chapters:
  * for galleries, when on level 1, show the last read time and last read page
  * for galleries, when on level 2, highlight the last read page
  * for galleries, when on level 3, save the image in the viewport in localstorage
  * for videos, when on level 2, save a key value pair -> videoHref: lastTimeWatched
  * for videos, when on level 1, show lastTimeWatched
- change the final merge to use OOP
- add ytboob, e-hentai, and 1stkissmanga to the list -> how easy is it to implement using OOP?
