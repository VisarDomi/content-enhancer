async function load() {
    const href = location.href;
    let content: Content = null;
    if (href.includes("tokyomotion")) {
        content = new TokyoMotion();
    } else if (href.includes("kissjav")) {
        content = new KissJav();
    } else if (href.includes("ytboob")) {
        content = new YtBoob();
    } else if (href.includes("nhentai")) {
        if (href.match(/\//g).length !== 6) {
            content = new NHentai();
        } else {
            content = new NHentai(true);
        }
    } else if (href.includes("exhentai") || href.includes("e-hentai")) {
        if (href.match(/\//g).length !== 5) {
            content = new ExHentai();
        } else {
            content = new ExHentai(true);
        }
    } else if (href.includes("kissmanga")) {
        content = new KissManga();
    }

    await content?.init();
}
load();
