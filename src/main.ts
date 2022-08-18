async function load() {
    const href = location.href;
    let content: Content = null;
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion();
    } else if (href.includes("kissjav")) {
        content = new KissJav();
    } else if (href.includes("ytboob")) {
        content = new YtBoob();
    } else if (href.includes("nhentai") && !href.includes("__cf_chl_rt_tk")) {
        content = new NHentai();
    } else if (href.includes("exhentai") || href.includes("e-hentai") && !href.includes(".php")) {
        content = new ExHentai();
    } else if (href.includes("kissmanga")) {
        content = new KissManga();
    } else if (href.includes("mcreader")) {
        content = new McReader();
    } else if (href.includes("mangahub")) {
        content = new MangaHub();
    } else if (href.includes("readm")) {
        content = new ReadM();
    } else if (href.includes("isekaiscan")) {
        content = new IsekaiScan();
    }

    await content?.init();
}
load();
