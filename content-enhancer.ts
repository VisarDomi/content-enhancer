(() => {
    const internal = `let nextPage,scrollPosition,href,pageCounter=1;const TOKYOMOTION="tokyomotion",KISSJAV="kissjav",NHENTAI="nhentai";function getThumbnailImages(e){const t=[];let n;href.includes(TOKYOMOTION)?n=e.getElementsByClassName("thumb-popu"):href.includes(KISSJAV)&&(n=e.getElementsByClassName("videos")[0].children);for(const e of n){let n,s;if(href.includes(TOKYOMOTION))n=e,s=n.children[0].children[0];else if(href.includes(KISSJAV)){if(n=e.children[0].children[0].children[0].children[0],s=n?.children[0],void 0===s)continue;s.src.includes("loading.jpg")&&(s.src=s.getAttribute("data-src"))}const a=new Image;a.setAttribute("data-href",n.href),a.setAttribute("onclick","loadSecondLevel(this)"),a.src=s.src,t.push(a)}return t}async function getResponse(e){const t=await fetch(e);return 200===t.status?t:(await waitFor(5e3),await getResponse(e))}async function waitFor(e){await new Promise((t=>setTimeout(t,e)))}function setNextPage(e){href.includes(TOKYOMOTION)?nextPage=e.getElementsByClassName("prevnext")[0]:href.includes(KISSJAV)?nextPage=e.getElementsByClassName("pagination-next")[0]:href.includes(NHENTAI)&&(nextPage=e.getElementsByClassName("last")[0])}(async()=>{href=location.href,setNextPage(document);let e=getThumbnailImages(document);const t=document.getElementsByClassName("content-enhancer"),n=[];for(const e of t)n.push(e.cloneNode(!0));document.body.parentElement.remove();const s=document.createElement("body"),a=document.createElement("html"),o=document.createElement("head");for(const e of n)o.appendChild(e);a.appendChild(o),a.appendChild(s),document.appendChild(a);const c=document.createElement("div");c.id="thumbnails-container",s.appendChild(c);for(const t of e)c.appendChild(t);await loadFirstLevel()})();`;
    const loadFirstLevel = `async function loadFirstLevel(){pageCounter++;const e=await getResponse(nextPage.href),t=await e.text(),a=(new DOMParser).parseFromString(t,"text/html"),n=getThumbnailImages(a),o=document.getElementById("thumbnails-container");for(const e of n)o.appendChild(e);if(setNextPage(a),void 0!==nextPage)if(pageCounter<10)await loadFirstLevel();else{const e=document.createElement("button");e.className="load-more",e.innerText="Load More",o.appendChild(e)}}`;
    const loadSecondLevel = `async function loadSecondLevel(e){const t=e.getAttribute("data-href");if("true"===e.getAttribute("data-video-loaded")){scrollPosition=window.scrollY,window.scrollTo({top:0});const o=document.getElementById("div"+t);o.after(e),o.remove(),e.removeAttribute("data-video-loaded"),document.getElementById("thumbnails-container").className="hide";const a=document.getElementById("video"+t);a.className="show";const n=document.createElement("button");n.className="refresh",n.type="button",n.onclick=refreshVideo,n.innerText="Reload the video",a.after(n);const d=document.createElement("div");d.className="go-back",d.onclick=goBack,d.id=t,n.after(d)}else{const o=document.createElement("div");o.id="div"+t,o.className="loading",e.after(o),o.appendChild(e),e.className="clicked";const a=await getResponse(t),n=await a.text(),d=(new DOMParser).parseFromString(n,"text/html");let l;t.includes(TOKYOMOTION)?l=d.getElementById("vjsplayer"):t.includes(KISSJAV)&&(l=d.getElementById("player-fluid"));const s=l.getElementsByTagName("source"),c=document.createElement("video");c.id="video"+t,c.controls=!0,c.preload="auto",c.playsInline=!0,c.muted=!0,c.className="hide";const i=document.createElement("source");i.src=getBestSource(s),c.appendChild(i),document.body.appendChild(c),c.onloadedmetadata=async()=>{c.onloadedmetadata=null,await waitFor(1e3),await c.play(),await waitFor(1e3),c.pause(),e.setAttribute("data-video-loaded","true"),o.className="loaded"},c.onerror=async()=>{await waitFor(5e3),c.load()}}}function refreshVideo(){document.getElementsByTagName("video")[0].load()}function goBack(){document.getElementById("thumbnails-container").className="show",document.getElementsByTagName("video")[0].remove(),document.getElementsByClassName("refresh")[0].remove(),document.getElementsByClassName("go-back")[0].remove(),window.scrollTo({top:scrollPosition})}function getBestSource(e){let t=null;for(const o of e)(href.includes(TOKYOMOTION)&&o.src.includes("/hd/")||href.includes(KISSJAV)&&o.src.includes("720p"))&&(t=o.src);return null===t&&(t=e[0].src),t}`;
    const css = `body{margin: 0;background-color: black}img, video{display: block;width: 100%}video, button{margin-top: 100px}.loading{background-color: #ffa500}.loaded{background-color: hsl(120, 100%, 40%)}.clicked{opacity: 0.3}.hide{display: none}.show{display: block}.go-back{width:100%;height:100vh;background-color: hsl(0, 100%, 10%)}`;

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
