(() => {
    const core = `let np,l1sp,oh,pc=1;const L1="l1-container",TM="tokyomotion",KJ="kissjav",NH="nhentai";function getThumbnailImages(e){const t=[];let n;oh.includes(TM)?n=e.getElementsByClassName("thumb-popu"):oh.includes(KJ)&&(n=e.getElementsByClassName("videos")[0].children);for(const e of n){let n,o;if(oh.includes(TM))n=e,o=n.children[0].children[0];else if(oh.includes(KJ)){if(n=e.children[0].children[0].children[0].children[0],o=n?.children[0],void 0===o)continue;o.src.includes("loading.jpg")&&(o.src=o.getAttribute("data-src"))}const s=new Image;s.setAttribute("data-href",n.href),s.setAttribute("onclick","loadL2(this)"),s.src=o.src,t.push(s)}return t}async function getResponse(e){const t=await fetch(e);return 200===t.status?t:(await waitFor(5e3),await getResponse(e))}async function waitFor(e){await new Promise((t=>setTimeout(t,e)))}function setNextPage(e){oh.includes(TM)?np=e.getElementsByClassName("prevnext")[0]:oh.includes(KJ)?np=e.getElementsByClassName("pagination-next")[0]:oh.includes(NH)&&(np=e.getElementsByClassName("last")[0])}(async()=>{oh=location.href,setNextPage(document);let e=getThumbnailImages(document);const t=document.getElementsByClassName("content-enhancer"),n=[];for(const e of t)n.push(e.cloneNode(!0));document.body.parentElement.remove();const o=document.createElement("body"),s=document.createElement("html"),a=document.createElement("head");for(const e of n)a.appendChild(e);s.appendChild(a),s.appendChild(o),document.appendChild(s);const c=document.createElement("div");c.id=L1,o.appendChild(c);for(const t of e)c.appendChild(t);await loadL1()})();`;
    const l1 = `async function loadL1(){pc++;const e=await getResponse(np.href),t=await e.text(),n=(new DOMParser).parseFromString(t,"text/html"),o=getThumbnailImages(n),a=document.getElementById(L1);for(const e of o)a.appendChild(e);if(setNextPage(n),void 0!==np)if(pc<1)await loadL1();else{const e=document.createElement("button");e.className="load-more",e.innerText="Load More",a.appendChild(e)}}(()=>{let e=document.querySelector("video");e.addEventListener("webkitpresentationmodechanged",(e=>e.stopPropagation()),!0),e.webkitSetPresentationMode("picture-in-picture"),e.loop=!0})();`;
    const l2 = `async function loadL2(e){const t=e.getAttribute("data-href"),a="l2"+t,o="bg"+t,n="loaded"===e.getAttribute("data-load-status"),d="loading"===e.getAttribute("data-load-status");if(n){l1sp=window.scrollY,window.scrollTo({top:0}),e.removeAttribute("data-load-status");const t=document.getElementById(o);t.after(e),t.remove(),document.getElementById(L1).className="hide",document.getElementById(a).className="show"}else if(d);else{const n=document.createElement("div");e.setAttribute("data-load-status","loading"),n.id=o,n.className="loading",e.after(n),n.appendChild(e),e.className="clicked";const d=document.createElement("div");document.body.appendChild(d);const s=document.createElement("video");d.appendChild(s);const l=document.createElement("source"),c=await getResponseSources(t);l.src=getBestSource(c),s.appendChild(l);const i=document.createElement("button");d.appendChild(i);const r=document.createElement("div");d.appendChild(r),d.id=a,d.className="hide",i.className="refresh",i.type="button",i.onclick=refreshVideo,i.innerText="Reload the video",r.className="go-l1",r.setAttribute("onclick",'goToL1("'+a+'")'),s.controls=!0,s.preload="auto",s.playsInline=!0,s.muted=!0,s.onloadedmetadata=async()=>{s.onloadedmetadata=null,await waitFor(1e3),await s.play(),await waitFor(1e3),s.pause(),e.setAttribute("data-load-status","loaded"),n.className="loaded"},s.onerror=async()=>{await waitFor(5e3),s.load()}}}function goToL1(e){document.getElementById(L1).className="show",document.getElementById(e).remove(),window.scrollTo({top:l1sp})}function refreshVideo(){document.getElementsByTagName("video")[0].load()}async function getResponseSources(e){const t=await getResponse(e),a=await t.text(),o=(new DOMParser).parseFromString(a,"text/html");let n;e.includes(TM)?n=o.getElementById("vjsplayer"):e.includes(KJ)&&(n=o.getElementById("player-fluid"));return n.getElementsByTagName("source")}function getBestSource(e){let t=null;for(const a of e)(oh.includes(TM)&&a.src.includes("/hd/")||oh.includes(KJ)&&a.src.includes("720p"))&&(t=a.src);return null===t&&(t=e[0].src),t}`;
    const css = `body{margin: 0;background-color: black}img, video{display: block;width: 100%}video, button{margin-top: 100px}.loading{background-color: hsl(30, 75%, 50%)}.loaded{background-color: hsl(120, 75%, 50%)}.clicked{opacity: 0.3}.hide{display: none}.show{display: block}.go-l1{width:100%;height:100vh;background-color: hsl(0, 50%, 25%)}`;

    function createTag(innerHTML: string, tagName: string): HTMLElement {
        const tag: HTMLElement = document.createElement(tagName) as HTMLElement;
        tag.className = "content-enhancer";
        tag.innerHTML = innerHTML;

        return tag;
    }

    const head: HTMLHeadElement = document.head;

    const cssTag: HTMLStyleElement = createTag(css, "style") as HTMLStyleElement;
    head.appendChild(cssTag);

    const loadFirstLevelTag: HTMLScriptElement = createTag(l1, "script") as HTMLScriptElement;
    head.appendChild(loadFirstLevelTag);

    const loadSecondLevelTag: HTMLScriptElement = createTag(l2, "script") as HTMLScriptElement;
    head.appendChild(loadSecondLevelTag);

    // TODO: add a ThirdLevelTag

    // order matters, we call the main function at the very end
    const coreTag: HTMLScriptElement = createTag(core, "script") as HTMLScriptElement;
    head.appendChild(coreTag);
})();
