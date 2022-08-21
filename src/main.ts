async function load() {
    const href = window.location.href;
    let content: Content = null;
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion();
    } else if (href.includes("kissjav")) {
        content = new KissJav();
    } else if (href.includes("ytboob")) {
        content = new YtBoob();
    } else if (href.includes("wcofun") && !href.includes("/search")) { // e.g.: https://www.wcofun.com/anime/the-penguins-of-madagascar-season-1
        const slashes: number = href.match(/\//g).length;
        if (slashes === 4) {
            content = new WcoFun();
        } else if (slashes === 3) {
            content = new WcoFun(true);
        }
    } else if (href.includes("nhentai.net/search/?") && !href.includes("__cf_chl_rt_tk")) { // don't activate the script when cloudflare is active
        content = new NHentai();
    } else if (href.includes("exhentai.org/?") || href.includes("e-hentai.org/?")) {
        content = new ExHentai();
    } else if (href.includes("isekaiscan")) {
        content = new IsekaiScan();
    } else if (href.includes("1stkissmanga.io")) {
        content = new KissManga();
    } else if (href.includes("mangahub.io/search/")) {
        content = new MangaHub();
    } else if (href.includes("mcreader.net/browse-comics")) {
        content = new McReader();
    } else if (href.includes("readm.org/latest-releases")) {
        content = new ReadM();
    }

    await content?.init();
}
load();
