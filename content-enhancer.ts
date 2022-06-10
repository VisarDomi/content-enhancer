(() => {
    const css = `body{margin: 0;background-color: black}img, video{display: block;width: 100%}`;
    const internal = `let nextPage,scrollPosition,href,pageCounter=1;const TOKYOMOTION="tokyomotion",KISSJAV="kissjav",NHENTAI="nhentai";function getThumbnailImages(e){const t=[];let n;href.includes(TOKYOMOTION)?n=e.getElementsByClassName("thumb-popu"):href.includes(KISSJAV)&&(n=e.getElementsByClassName("videos")[0].children);for(const e of n){let n,s;if(href.includes(TOKYOMOTION))n=e,s=n.children[0].children[0];else if(href.includes(KISSJAV)){if(n=e.children[0].children[0].children[0].children[0],s=n?.children[0],void 0===s)continue;s.src.includes("loading.jpg")&&(s.src=s.getAttribute("data-src"))}const a=new Image;a.setAttribute("data-href",n.href),a.setAttribute("style","display:block;width:100%;"),a.setAttribute("onclick","loadSecondLevel(this)"),a.src=s.src,t.push(a)}return t}async function getResponse(e){const t=await fetch(e);return 200===t.status?t:(await waitFor(5e3),await getResponse(e))}async function waitFor(e){await new Promise((t=>setTimeout(t,e)))}function setNextPage(e){href.includes(TOKYOMOTION)?nextPage=e.getElementsByClassName("prevnext")[0]:href.includes(KISSJAV)?nextPage=e.getElementsByClassName("pagination-next")[0]:href.includes(NHENTAI)&&(nextPage=e.getElementsByClassName("last")[0])}(async()=>{href=location.href,setNextPage(document);let e=getThumbnailImages(document);const t=document.getElementsByClassName("content-enhancer"),n=[];for(const e of t)n.push(e.cloneNode(!0));document.body.parentElement.remove();const s=document.createElement("body");s.setAttribute("style","margin:0;background-color:black;");const a=document.createElement("html"),o=document.createElement("head");for(const e of n)o.appendChild(e);a.appendChild(o),a.appendChild(s),document.appendChild(a);const c=document.createElement("div");c.id="thumbnailsContainer",s.appendChild(c);for(const t of e)c.appendChild(t);await loadFirstLevel()})();`;
    const loadFirstLevel = `async function loadFirstLevel(){pageCounter++;const e=await getResponse(nextPage.href),t=await e.text(),n=(new DOMParser).parseFromString(t,"text/html"),a=getThumbnailImages(n),o=document.getElementById("thumbnailsContainer");for(const e of a)o.appendChild(e);if(setNextPage(n),void 0!==nextPage)if(pageCounter<10)await loadFirstLevel();else{const e=document.createElement("button");e.innerText="Load More",o.appendChild(e)}}`;
    const loadSecondLevel = `async function loadSecondLevel(e){const t=e.getAttribute("data-href");if("true"===e.getAttribute("data-loaded")){scrollPosition=window.scrollY,window.scrollTo({top:0});const o=document.getElementById("div"+t);o.after(e),o.remove(),e.removeAttribute("data-loaded");document.getElementById("thumbnailsContainer").setAttribute("style","display:none;");const n=document.getElementById("video"+t);n.setAttribute("style","margin-top:100px;");const a=document.createElement("div");a.setAttribute("onclick","goBack(this)"),a.setAttribute("style","width:100%;height:100vh;background-color:darkred;opacity:0.8;"),a.id=t,n.after(a)}else{const o=document.createElement("div");o.id="div"+t,o.setAttribute("style","background-color:orange;opacity:0.8;"),e.after(o),o.appendChild(e),e.setAttribute("style","opacity:0.03;");const n=await getResponse(t),a=await n.text(),i=(new DOMParser).parseFromString(a,"text/html");let r;t.includes(TOKYOMOTION)?r=i.getElementById("vjsplayer"):t.includes(KISSJAV)&&(r=i.getElementById("player-fluid"));const d=r.getElementsByTagName("source"),l=document.createElement("video");l.id="video"+t,l.controls=!0,l.preload="auto",l.playsInline=!0,l.muted=!0,l.setAttribute("style","display:none;");const s=document.createElement("source");s.src=getBestSource(d),l.appendChild(s),document.body.appendChild(l),l.onloadedmetadata=async()=>{await waitFor(1e3),await l.play(),await waitFor(1e3),l.pause(),e.setAttribute("data-loaded","true"),o.setAttribute("style","background-color:green;opacity:0.8;"),e.setAttribute("style","opacity:0.3;")},l.onerror=async()=>{await waitFor(5e3),l.load()}}}function goBack(e){document.getElementById("thumbnailsContainer").setAttribute("style","display:block;");document.getElementById("video"+e.id).remove(),e.remove(),window.scrollTo({top:scrollPosition})}function getBestSource(e){let t=null;for(const o of e)(href.includes(TOKYOMOTION)&&o.src.includes("/hd/")||href.includes(KISSJAV)&&o.src.includes("720p"))&&(t=o.src);return null===t&&(t=e[0].src),t}`;

    function createTag(innerHTML: string, tagName: string): HTMLElement {
        const tag: HTMLElement = document.createElement(tagName) as HTMLElement;
        tag.className = "content-enhancer";
        tag.innerHTML = innerHTML;

        return tag;
    }

    const head: HTMLHeadElement = document.head;

    const cssTag: HTMLStyleElement = createTag(css, "style") as HTMLStyleElement;
    head.appendChild(cssTag);

    const loadFirstLevelTag: HTMLScriptElement = createTag(loadFirstLevel, "script") as HTMLScriptElement;
    head.appendChild(loadFirstLevelTag);

    const loadSecondLevelTag: HTMLScriptElement = createTag(loadSecondLevel, "script") as HTMLScriptElement;
    head.appendChild(loadSecondLevelTag);

    // TODO: add a ThirdLevelTag

    // order matters, we call the main function at the very end
    const internalTag: HTMLScriptElement = createTag(internal, "script") as HTMLScriptElement;
    head.appendChild(internalTag);
})();
