(() => {
    const core = `const LOOK_AHEAD="1000%";let nextSearchResultsHref,originalHref,retry=!0;const L1_CONTAINER_ID="l1-container",L2_CONTAINER_ID="l2-container",L3_CONTAINER_ID="l3-container",THUMBNAIL="observeThumbnail",IMAGE="observeImage",DATA_SRC="data-src",DATA_CFSRC="data-cfsrc",DATA_HREF="data-href",EMPTY_STRING="",ONCLICK="onclick",CLASS="class",BLOCK="block",FLEX="flex",NONE="none",TOKYOMOTION="tokyomotion",KISSJAV="kissjav",NHENTAI="nhentai",ASURASCANS="asurascans";function setNextSearchResultsHref(e){let t=null;originalHref.includes(TOKYOMOTION)?t=e.querySelector(".prevnext"):originalHref.includes(KISSJAV)?t=e.querySelector(".pagination-next"):originalHref.includes(NHENTAI)?t=e.querySelector(".next"):originalHref.includes(ASURASCANS)&&(t=e.querySelector(".r")),nextSearchResultsHref=null===t?"":t.href}function getSearchResultsThumbnails(e){const t=[],n=[];if(originalHref.includes(TOKYOMOTION)){const t=e.querySelectorAll(".thumb-popu");n.splice(0,0,...Array.from(t))}else if(originalHref.includes(KISSJAV)){const t=e.querySelector(".videos").children;n.splice(0,0,...Array.from(t))}else if(originalHref.includes(NHENTAI)){const t=e.querySelector(".index-container").children;n.splice(0,0,...Array.from(t))}else if(originalHref.includes(ASURASCANS)){const t=e.querySelectorAll(".imgu");n.splice(0,0,...Array.from(t))}for(const e of n){let n,r;if(originalHref.includes(TOKYOMOTION))n=e,r=n.children[0].children[0];else if(originalHref.includes(KISSJAV)){if(n=e.children[0].children[0].children[0].children[0],r=n?.children[0],void 0===r)continue;null!==r.getAttribute(DATA_SRC)&&(r.src=r.getAttribute(DATA_SRC))}else originalHref.includes(NHENTAI)?(n=e.children[0],r=n.children[0],null!==r.getAttribute(DATA_SRC)&&(r.src=r.getAttribute(DATA_SRC))):originalHref.includes(ASURASCANS)&&(n=e.children[0],r=n.children[0],null!==r.getAttribute(DATA_CFSRC)&&(r.src=r.getAttribute(DATA_CFSRC)));pushThumbnail(r,n,"loadL2",t,"l1-thumbnail")}return t}function pushThumbnail(e,t,n,r,i){const o=new Image;o.setAttribute(DATA_HREF,t.href),o.setAttribute(ONCLICK,n+"(this)"),o.setAttribute(DATA_SRC,e.src),o.className=i,r.push(o)}async function getResponseDocument(e){const t=await getResponse(e);if(null!==t){const e=await t.text();return(new DOMParser).parseFromString(e,"text/html")}return null}async function getResponse(e){const t=await fetch(e);return 200===t.status?t:retry?(await waitFor(5e3),await getResponse(e)):null}async function waitFor(e){await new Promise((t=>setTimeout(t,e)))}async function onImageLoadError(e){await waitFor(5e3);let t=e.src;const n="?time=",r=t.indexOf(n),i=n+Date.now();-1!==r?t=t.substring(0,r)+i:t+=i,e.src=t}async function loadThumbnail(e,t,n=0){if(n<e.length){const r=e[n];t.appendChild(r),r.src=r.getAttribute(DATA_SRC),r.onload=async()=>{await loadThumbnail(e,t,++n)},r.onerror=async()=>{await onImageLoadError(r)}}else if(n===e.length&&"l1-container"===t.id){const e=(e,t)=>{e.forEach((async e=>{if(e.isIntersecting){const n=e.target;t.unobserve(n),n.removeAttribute(CLASS),await loadL1()}}))},t=new IntersectionObserver(e,{root:null,rootMargin:"1000%"}),n=document.querySelector("."+THUMBNAIL);t.observe(n)}}function observeLastImage(e,t){const n=e.pop();n.className=t,e.push(n)}function createBackButton(e,t,n){const r=document.createElement("div");r.className=n,r.setAttribute(ONCLICK,t+"(this)"),e.appendChild(r)}(async()=>{originalHref=location.href,setNextSearchResultsHref(document);let e=getSearchResultsThumbnails(document);const t=document.querySelectorAll(".content-enhancer");document.body.parentElement.remove();const n=document.createElement("html"),r=document.createElement("body"),i=document.createElement("head");for(const e of t)i.appendChild(e);n.appendChild(i),n.appendChild(r),document.appendChild(n);const o=document.createElement("div");o.id="l1-container",r.appendChild(o),observeLastImage(e,THUMBNAIL),await loadThumbnail(e,o)})();`;
    const l1 = `async function loadL1(){if(nextSearchResultsHref!==EMPTY_STRING){const e=document.getElementById(L1_CONTAINER_ID),t=await getResponseDocument(nextSearchResultsHref),s=getSearchResultsThumbnails(t);setNextSearchResultsHref(t),observeLastImage(s,THUMBNAIL),await loadThumbnail(s,e)}}`;
    const l2 = `let level1ScrollPosition;const DATA_LOAD_STATUS="data-load-status",LOADED="loaded",LOADING="loading";async function loadL2(e){originalHref.includes(TOKYOMOTION)||originalHref.includes(KISSJAV)?await loadVideo(e):(originalHref.includes(NHENTAI)||originalHref.includes(ASURASCANS))&&await loadManga(e)}function goToL1(e){document.getElementById(L1_CONTAINER_ID).style.display=BLOCK,document.getElementById(e.parentElement.id).remove(),window.scrollTo({top:level1ScrollPosition})}async function loadVideo(e){const t=e.getAttribute(DATA_HREF),l="l2"+t,n="bg"+t,o=e.getAttribute(DATA_LOAD_STATUS)===LOADED,a=e.getAttribute(DATA_LOAD_STATUS)===LOADING;if(o){level1ScrollPosition=window.scrollY,window.scrollTo({top:0}),e.removeAttribute(DATA_LOAD_STATUS);const t=document.getElementById(n);t.after(e),t.remove(),document.getElementById(L1_CONTAINER_ID).style.display=NONE,document.getElementById(l).style.display=BLOCK}else if(a);else{const o=document.createElement("div");e.setAttribute(DATA_LOAD_STATUS,LOADING),o.id=n,o.className=LOADING,e.after(o),e.className="clicked",o.appendChild(e);const a=document.createElement("div");a.id=l,a.style.display=NONE,document.body.appendChild(a);const i=document.createElement("video");i.controls=!0,i.preload="auto",i.playsInline=!0,i.muted=!0,i.onloadedmetadata=async()=>{i.onloadedmetadata=null,await waitFor(100),await i.play(),await waitFor(100),i.pause(),e.setAttribute(DATA_LOAD_STATUS,LOADED),o.className=LOADED},i.onerror=async()=>{await waitFor(5e3),i.load()};const c=document.createElement("source"),d=await getResponseDocument(t);let r;t.includes(TOKYOMOTION)?r=d.getElementById("vjsplayer"):t.includes(KISSJAV)&&(r=d.getElementById("player-fluid"));const s=r.querySelectorAll("source");let u=null;for(const e of s)(originalHref.includes(TOKYOMOTION)&&e.src.includes("/hd/")||originalHref.includes(KISSJAV)&&e.src.includes("720p"))&&(u=e.src);null===u&&(u=s[0].src),c.src=u,i.appendChild(c),a.appendChild(i),createBackButton(a,"goToL1","go-back-video");const A=document.createElement("button");A.className="refresh",A.type="button",A.onclick=()=>{i.scrollIntoView(),i.load()},A.innerText="Reload the video",a.appendChild(A)}}async function loadManga(e){level1ScrollPosition=window.scrollY,window.scrollTo({top:0});const t=e.getAttribute(DATA_HREF),l=document.createElement("div");l.id=L2_CONTAINER_ID,l.style.display=FLEX,document.body.appendChild(l),document.getElementById(L1_CONTAINER_ID).style.display=NONE,createBackButton(l,"goToL1","go-back-manga");const n=await getResponseDocument(t);if(originalHref.includes(NHENTAI)){l.style.flexDirection="row",l.style.flexWrap="wrap";const e=getGalleryThumbnails(n);await loadThumbnail(e,l)}else if(originalHref.includes(ASURASCANS)){l.style.flexDirection="column";const e=n.querySelectorAll(".eph-num");for(const t of e){const e=t.children[0],n=document.createElement("button"),o=e.children[0];n.innerText=o.innerText,n.className="chapter-button",n.setAttribute(DATA_HREF,e.href),n.onclick=async()=>{await loadL3(n)},l.appendChild(n)}}}function getGalleryThumbnails(e){const t=[],l=Array.from(e.querySelector(".thumbs").children);for(const e of l){const l=e.children[0],n=l.children[0];n.src=n.getAttribute(DATA_SRC),pushThumbnail(n,l,"loadL3",t,"l2-thumbnail")}return t}`;
    const l3 = `let level2ScrollPosition,nextImageHref,infoClicked,breakLoop;async function loadL3(e){breakLoop=!1,level2ScrollPosition=window.scrollY,window.scrollTo({top:0});const t=document.getElementById(L2_CONTAINER_ID),n=e.getAttribute(DATA_HREF),o=document.createElement("div");if(o.id=L3_CONTAINER_ID,document.body.appendChild(o),t.style.display=NONE,createBackButton(o,"goToL2","go-back"),createInfoButton(n,o),originalHref.includes(NHENTAI))nextImageHref=n,await loadNhImage(o);else if(originalHref.includes(ASURASCANS)){const e=await getAsImages(n);observeLastImage(e,IMAGE),await loadAsImage(e,o)}}function goToL2(e){document.getElementById(L2_CONTAINER_ID).style.display=FLEX,document.getElementById(e.parentElement.id).remove(),breakLoop=!0,retry=!0,window.scrollTo({top:level2ScrollPosition})}async function loadNhImage(e){if(nextImageHref!==EMPTY_STRING&&!breakLoop){const t=await getResponseDocument(nextImageHref),n=t.getElementById("image-container").children[0].children[0],o=new Image;o.src=n.src,e.appendChild(o);const a=t.querySelector(".next");nextImageHref=null===a?EMPTY_STRING:a.href,o.onload=async()=>{await loadNhImage(e)},o.onerror=async()=>{await onImageLoadError(o)}}}async function getAsImages(e){const t=[],n=await getResponseDocument(e);if(null!==n){const o=[],a=n.getElementById("readerarea").children;for(let e=0;e<a.length;e++)a[e].getAttribute(CLASS)?.includes("ai-viewport-2")&&o.push(e);o.pop();for(const n of o){const o=a[n+2].children[0],r=new Image;r.setAttribute(DATA_HREF,e),r.setAttribute(DATA_SRC,o.getAttribute(DATA_CFSRC)),t.push(r)}}return t}async function loadAsImage(e,t,n=0){if(n<e.length&&!breakLoop){const o=e[n];t.append(o),o.src=o.getAttribute(DATA_SRC),o.onload=async()=>{await loadAsImage(e,t,++n)},o.onerror=async()=>{await onImageLoadError(o)}}else if(n===e.length){const n=(n,o)=>{n.forEach((async n=>{if(n.isIntersecting){const a=n.target;o.unobserve(a),a.removeAttribute(CLASS);const r=getNextChapterHref(e);retry=!1;const i=await getAsImages(r);i.length>0&&(observeLastImage(i,IMAGE),await loadAsImage(i,t))}}))},o={root:null,rootMargin:LOOK_AHEAD},a=new IntersectionObserver(n,o),r=document.querySelector("."+IMAGE);a.observe(r)}}function getNextChapterHref(e){const t=e[0].getAttribute(DATA_HREF).split("-"),n="chapter",o=t.indexOf(n),a=t[o+1],r=a.substring(0,a.length-1);let i;i=a.includes(".")?parseInt(r.split(".")[0])+1:parseInt(r)+1;let c=EMPTY_STRING;for(let e=0;e<o;e++)c+=t[e]+"-";return c+="chapter-"+i+"/",c}function createInfoButton(e,t){const n=document.createElement("div");n.className="info";const o=document.createElement("div");o.className="clicker",infoClicked=!1,o.onclick=()=>{infoClicked=!infoClicked,n.className=infoClicked?"info-clicked":"info"};const a=document.createElement("span");a.className="info-content",a.innerText=e,n.appendChild(a),t.appendChild(n),t.appendChild(o)}`;
    const css = `body{margin: 0;background-color: black}img, video{display: block;width: 100%}video{margin-top: 100px;margin-bottom: 100px}.loading{background-color: hsl(30, 75%, 50%)}.loaded{background-color: hsl(120, 75%, 50%)}.clicked{opacity: 0.5}.go-back-video{width: 100%;height: 100vh;background-color: hsl(0, 50%, 25%)}.refresh{margin-top: 200px;margin-bottom: 200px}.go-back-manga, .go-back{width: 100%;height: 30vh;background-color: hsl(0, 50%, 25%)}.refresh, .chapter-button{font-size: 2rem;line-height: 3;text-align: center}.l2-thumbnail{width: 50%}.go-back{position: fixed;left: 0;top: 0;animation: fadeout 1s linear 0s 1 normal forwards running}@keyframes fadeout{0%{opacity: 1}100%{opacity: 0}}.clicker{background-color: rgba(0, 0, 0, 0.0);z-index: 1}.clicker, .info, .info-clicked{position: fixed;left: 0;top: 30%;height: 30%;width: 100%}.info{display: none}.info-clicked{display: flex;background-color: rgba(0, 0, 0, 0.7);justify-content: center;align-items: center}.info-content{font-size: 1.1rem;font-family: sans-serif;color: white;line-height: 2;margin: 20px}`;

    function createTag(innerHTML: string, tagName: string): HTMLElement {
        const tag: HTMLElement = document.createElement(tagName) as HTMLElement;
        tag.className = "content-enhancer";
        tag.innerHTML = innerHTML;

        return tag;
    }

    const head: HTMLHeadElement = document.head;

    const cssTag: HTMLStyleElement = createTag(css, "style") as HTMLStyleElement;
    head.appendChild(cssTag);

    const SCRIPT = "script";
    const l1Tag: HTMLScriptElement = createTag(l1, SCRIPT) as HTMLScriptElement;
    head.appendChild(l1Tag);

    const l2Tag: HTMLScriptElement = createTag(l2, SCRIPT) as HTMLScriptElement;
    head.appendChild(l2Tag);

    const l3Tag: HTMLScriptElement = createTag(l3, SCRIPT) as HTMLScriptElement;
    head.appendChild(l3Tag);

    // order matters, we call the main function at the very end
    const coreTag: HTMLScriptElement = createTag(core, SCRIPT) as HTMLScriptElement;
    head.appendChild(coreTag);
})();
