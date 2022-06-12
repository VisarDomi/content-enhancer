(() => {
    const core = `let nextSearchResultsHref,originalHref;const L1_CONTAINER_ID="l1-container",THUMBNAIL="observeThumbnail",IMAGE="observeImage",DATA_SRC="data-src",DATA_CFSRC="data-cfsrc",DATA_HREF="data-href",EMPTY_STRING="",ONCLICK="onclick",CLASS="class",DIV="div",BLOCK="block",NONE="none",GO_BACK="go-back",DATA_L2_ID="data-l2-id";let doNotRetry=!1;const TOKYOMOTION="tokyomotion",KISSJAV="kissjav",NHENTAI="nhentai",ASURASCANS="asurascans";function setNextSearchResultsHref(e){let t=null;originalHref.includes(TOKYOMOTION)?t=e.querySelector(".prevnext"):originalHref.includes(KISSJAV)?t=e.querySelector(".pagination-next"):originalHref.includes(NHENTAI)?t=e.querySelector(".next"):originalHref.includes(ASURASCANS)&&(t=e.querySelector(".r")),nextSearchResultsHref=null===t?"":t.href}function getSearchResultsThumbnails(e){const t=[],n=[];if(originalHref.includes(TOKYOMOTION)){const t=e.querySelectorAll(".thumb-popu");n.splice(0,0,...Array.from(t))}else if(originalHref.includes(KISSJAV)){const t=e.querySelector(".videos").children;n.splice(0,0,...Array.from(t))}else if(originalHref.includes(NHENTAI)){const t=e.querySelector(".index-container").children;n.splice(0,0,...Array.from(t))}else if(originalHref.includes(ASURASCANS)){const t=e.querySelectorAll(".imgu");n.splice(0,0,...Array.from(t))}for(const e of n){let n,r;if(originalHref.includes(TOKYOMOTION))n=e,r=n.children[0].children[0];else if(originalHref.includes(KISSJAV)){if(n=e.children[0].children[0].children[0].children[0],r=n?.children[0],void 0===r)continue;null!==r.getAttribute(DATA_SRC)&&(r.src=r.getAttribute(DATA_SRC))}else originalHref.includes(NHENTAI)?(n=e.children[0],r=n.children[0],null!==r.getAttribute(DATA_SRC)&&(r.src=r.getAttribute(DATA_SRC))):originalHref.includes(ASURASCANS)&&(n=e.children[0],r=n.children[0],null!==r.getAttribute(DATA_CFSRC)&&(r.src=r.getAttribute(DATA_CFSRC)));pushThumbnail(r,n,"loadL2",t)}return t}function pushThumbnail(e,t,n,r){const i=new Image;i.setAttribute(DATA_HREF,t.href),i.setAttribute(ONCLICK,n+"(this)"),i.setAttribute(DATA_SRC,e.src),r.push(i)}async function getResponseDocument(e){const t=await getResponse(e);if(null!==t){const e=await t.text();return(new DOMParser).parseFromString(e,"text/html")}return null}async function getResponse(e){const t=await fetch(e);return 200===t.status?t:doNotRetry?null:(await waitFor(5e3),await getResponse(e))}async function waitFor(e){await new Promise((t=>setTimeout(t,e)))}async function onImageLoadError(e){await waitFor(5e3);let t=e.src;const n="?time=",r=t.indexOf(n),i=n+Date.now();-1!==r?t=t.substring(0,r)+i:t+=i,e.src=t}async function loadThumbnail(e,t,n=0){if(n<e.length){const r=e[n];t.appendChild(r),r.src=r.getAttribute(DATA_SRC),r.onload=async()=>{await loadThumbnail(e,t,++n)}}else if(n===e.length&&"l1-container"===t.id){const e=(e,t)=>{e.forEach((async e=>{if(e.isIntersecting){const n=e.target;t.unobserve(n),n.removeAttribute(CLASS),await loadL1()}}))},t=new IntersectionObserver(e,{root:null,rootMargin:100*n/2+"%"}),r=document.querySelector("."+THUMBNAIL);t.observe(r)}}function observeLastImage(e,t){const n=e.pop();n.className=t,e.push(n)}(async()=>{originalHref=location.href,setNextSearchResultsHref(document);let e=getSearchResultsThumbnails(document);const t=document.querySelectorAll(".content-enhancer");document.body.parentElement.remove();const n=document.createElement("html"),r=document.createElement("body"),i=document.createElement("head");for(const e of t)i.appendChild(e);n.appendChild(i),n.appendChild(r),document.appendChild(n);const o=document.createElement(DIV);o.id="l1-container",r.appendChild(o),observeLastImage(e,THUMBNAIL),await loadThumbnail(e,o)})();`;
    const l1 = `async function loadL1(){if(nextSearchResultsHref!==EMPTY_STRING){const e=document.getElementById(L1_CONTAINER_ID),t=await getResponseDocument(nextSearchResultsHref),s=getSearchResultsThumbnails(t);setNextSearchResultsHref(t),observeLastImage(s,THUMBNAIL),await loadThumbnail(s,e)}}`;
    const l2 = `let level1ScrollPosition;const DATA_LOAD_STATUS="data-load-status",LOADED="loaded",LOADING="loading",BUTTON="button";async function loadL2(e){originalHref.includes(TOKYOMOTION)||originalHref.includes(KISSJAV)?await loadVideo(e):(originalHref.includes(NHENTAI)||originalHref.includes(ASURASCANS))&&await loadManga(e)}function goToL1(e){document.getElementById(L1_CONTAINER_ID).style.display=BLOCK,document.getElementById(e).remove(),window.scrollTo({top:level1ScrollPosition})}async function loadVideo(e){const t=e.getAttribute(DATA_HREF),l="l2"+t,o="bg"+t,n=e.getAttribute(DATA_LOAD_STATUS)===LOADED,a=e.getAttribute(DATA_LOAD_STATUS)===LOADING;if(n){level1ScrollPosition=window.scrollY,window.scrollTo({top:0}),e.removeAttribute(DATA_LOAD_STATUS);const t=document.getElementById(o);t.after(e),t.remove(),document.getElementById(L1_CONTAINER_ID).style.display=NONE,document.getElementById(l).style.display=BLOCK}else if(a);else{const n=document.createElement(DIV);e.setAttribute(DATA_LOAD_STATUS,LOADING),n.id=o,n.className=LOADING,e.after(n),e.className="clicked",n.appendChild(e);const a=document.createElement(DIV);a.id=l,a.style.display=NONE,document.body.appendChild(a);const i=document.createElement("video");i.controls=!0,i.preload="auto",i.playsInline=!0,i.muted=!0,i.onloadedmetadata=async()=>{i.onloadedmetadata=null,await waitFor(100),await i.play(),await waitFor(100),i.pause(),e.setAttribute(DATA_LOAD_STATUS,LOADED),n.className=LOADED},i.onerror=async()=>{await waitFor(5e3),i.load()};const c=document.createElement("source"),d=await getResponseDocument(t);let s;t.includes(TOKYOMOTION)?s=d.getElementById("vjsplayer"):t.includes(KISSJAV)&&(s=d.getElementById("player-fluid"));const r=s.querySelectorAll("source");let u=null;for(const e of r)(originalHref.includes(TOKYOMOTION)&&e.src.includes("/hd/")||originalHref.includes(KISSJAV)&&e.src.includes("720p"))&&(u=e.src);null===u&&(u=r[0].src),c.src=u,i.appendChild(c),a.appendChild(i);const A=document.createElement(DIV);A.className="go-video-l1",A.setAttribute(ONCLICK,'goToL1("'+l+'")'),a.appendChild(A);const m=document.createElement(BUTTON);m.className="refresh",m.type=BUTTON,m.onclick=()=>{s.scrollIntoView(),i.load()},m.innerText="Reload the video",a.appendChild(m)}}function createGoToL1(e,t){const l=document.createElement(DIV);l.className=GO_BACK,l.setAttribute(ONCLICK,t+"('"+e.id+"')"),e.appendChild(l)}async function loadManga(e){level1ScrollPosition=window.scrollY,window.scrollTo({top:0});const t=e.getAttribute(DATA_HREF),l="l2"+t,o=document.createElement(DIV);o.id=l,document.body.appendChild(o),document.getElementById(L1_CONTAINER_ID).style.display=NONE,createGoToL1(o,"goToL1");const n=await getResponseDocument(t);if(originalHref.includes(NHENTAI)){const e=getGalleryThumbnails(n);for(const t of e)t.setAttribute(DATA_L2_ID,l);await loadThumbnail(e,o)}else if(originalHref.includes(ASURASCANS)){o.setAttribute("style","display:flex;flex-direction:column;");const e=n.querySelectorAll(".eph-num");for(const t of e){const e=t.children[0],n=document.createElement(BUTTON),a=e.children[0];n.innerText=a.innerText,n.className="chapter-button",n.setAttribute(DATA_HREF,e.href),n.setAttribute(DATA_L2_ID,l),n.onclick=async()=>{await loadL3(n)},o.appendChild(n)}}}function getGalleryThumbnails(e){const t=[],l=Array.from(e.querySelector(".thumbs").children);for(const e of l){const l=e.children[0],o=l.children[0];pushThumbnail(o,l,"loadL3",t)}return t}`;
    const l3 = `let level2ScrollPosition,nextImageHref,breakLoop;async function loadL3(e){breakLoop=!1,level2ScrollPosition=window.scrollY,window.scrollTo({top:0});const t=e.getAttribute(DATA_L2_ID),o=document.getElementById(t),n=e.getAttribute(DATA_HREF),a="l3"+n,r=document.createElement(DIV);if(r.id=a,document.body.appendChild(r),o.style.display=NONE,createGoToL2(o,r,"goToL2"),originalHref.includes(NHENTAI))nextImageHref=n,await loadNhImage(r);else if(originalHref.includes(ASURASCANS)){const e=await getAsImages(n);observeLastImage(e,IMAGE),await loadAsImage(e,r)}}function createGoToL2(e,t,o){const n=document.createElement(DIV);n.className=GO_BACK,n.setAttribute(ONCLICK,o+"('"+e.id+"', '"+t.id+"')"),t.appendChild(n)}function goToL2(e,t){let o;originalHref.includes(NHENTAI)?o=BLOCK:originalHref.includes(ASURASCANS)&&(o="flex"),document.getElementById(e).style.display=o,document.getElementById(t).remove(),breakLoop=!0,doNotRetry=!1,window.scrollTo({top:level2ScrollPosition})}async function loadNhImage(e){if(nextImageHref!==EMPTY_STRING&&!breakLoop){const t=await getResponseDocument(nextImageHref),o=t.getElementById("image-container").children[0].children[0],n=new Image;n.src=o.src,e.appendChild(n);const a=t.querySelector(".next");nextImageHref=null===a?EMPTY_STRING:a.href,n.onload=async()=>{await loadNhImage(e)},n.onerror=async()=>{await onImageLoadError(n)}}}async function getAsImages(e){const t=[],o=await getResponseDocument(e);if(null!==o){const n=[],a=o.getElementById("readerarea").children;for(let e=0;e<a.length;e++)a[e].getAttribute(CLASS)?.includes("ai-viewport-2")&&n.push(e);n.pop();for(const o of n){const n=a[o+2].children[0],r=new Image;r.setAttribute(DATA_HREF,e),r.setAttribute(DATA_SRC,n.getAttribute(DATA_CFSRC)),t.push(r)}}return t}async function loadAsImage(e,t,o=0){if(o<e.length&&!breakLoop){const n=e[o];t.append(n),n.src=n.getAttribute(DATA_SRC),n.onload=async()=>{await loadAsImage(e,t,++o)}}else if(o===e.length){const n=(o,n)=>{o.forEach((async o=>{if(o.isIntersecting){const a=o.target;n.unobserve(a),a.removeAttribute(CLASS);const r=getNextChapterHref(e);doNotRetry=!0;const l=await getAsImages(r);l.length>0&&(observeLastImage(l,IMAGE),await loadAsImage(l,t))}}))},a=new IntersectionObserver(n,{root:null,rootMargin:100*o/2+"%"}),r=document.querySelector("."+IMAGE);a.observe(r)}}function getNextChapterHref(e){const t=e[0].getAttribute(DATA_HREF).split("-"),o="chapter",n=t.indexOf(o),a=t[n+1],r=a.substring(0,a.length-1);let l;l=a.includes(".")?parseInt(r.split(".")[0])+1:parseInt(r)+1;let i=EMPTY_STRING;for(let e=0;e<n;e++)i+=t[e]+"-";return i+="chapter-"+l+"/",i}`;
    const css = `body{margin: 0;background-color: black}img, video{display: block;width: 100%}video{margin-top: 100px;margin-bottom: 100px}.loading{background-color: hsl(30, 75%, 50%)}.loaded{background-color: hsl(120, 75%, 50%)}.clicked{opacity: 0.5}.go-video-l1{width: 100%;height: 100vh;background-color: hsl(0, 50%, 25%)}.go-back{height: 30%;width: 30%;position: fixed;top: 0;left: 0}.go-back:active{background-color: rgba(0, 0, 0, 0.5)}button{font-size: 2rem;line-height: 3;text-align: center}.refresh{margin-top: 200px;margin-bottom: 200px}`;

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
