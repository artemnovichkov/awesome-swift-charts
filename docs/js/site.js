(function () {
    var nav = document.getElementById("localnav");
    var home = document.getElementById("home");
    if (!home) {
        if (nav) nav.classList.add("no-links");
        return;
    }

    var ARROW = "<svg class='row-arrow' viewBox='0 0 11 11' aria-hidden='true'><path d='M2 9L9 2M3.5 2H9v5.5'/></svg>";

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    var nodes = Array.prototype.slice.call(home.children);

    // Hero: everything before the first h2
    var hero = el("div", "hero");
    var heroInner = el("div", "hero-inner");
    hero.appendChild(heroInner);
    var heroImage = null;
    while (nodes.length && nodes[0].tagName !== "H2") {
        var node = nodes.shift();
        var img = node.querySelector && node.querySelector("img");
        if (img && node.textContent.trim() === "") {
            heroImage = el("figure", "hero-image");
            heroImage.appendChild(img);
            node.remove();
        } else {
            if (node.tagName === "H1") node.className = "hero-eyebrow";
            else if (node.tagName === "P") node.className = heroInner.querySelector(".hero-headline") ? "hero-lede" : "hero-headline";
            heroInner.appendChild(node);
        }
    }
    home.insertBefore(hero, home.firstChild);

    // Sections (h2) and groups (h3)
    var sections = [];
    var section, body, groups, group;
    nodes.forEach(function (node) {
        if (node.tagName === "H2") {
            section = el("section", "section");
            section.id = node.id;
            node.removeAttribute("id");
            var inner = el("div", "section-inner");
            var header = el("header", "section-header");
            header.appendChild(node);
            inner.appendChild(header);
            body = el("div", "section-body");
            inner.appendChild(body);
            section.appendChild(inner);
            home.appendChild(section);
            sections.push({ el: section, title: node.textContent, header: header });
            groups = null;
            group = null;
        } else if (!section) {
            return;
        } else if (node.tagName === "P" && !group && !body.children.length) {
            node.className = "section-lede";
            sections[sections.length - 1].header.appendChild(node);
        } else if (node.tagName === "H3") {
            if (!groups) {
                groups = el("div", "groups");
                body.appendChild(groups);
            }
            group = el("div", "group");
            group.id = node.id;
            node.removeAttribute("id");
            group.appendChild(node);
            groups.appendChild(group);
        } else {
            (group || body).appendChild(node);
        }
    });

    // Rows
    function parse(li) {
        var link = li.querySelector("a");
        if (!link) return null;
        var rest = "";
        var n = link.nextSibling;
        while (n) { rest += n.textContent; n = n.nextSibling; }
        var text = rest.replace(/^\s*[—–-]\s*/, "").trim();
        var url;
        try { url = new URL(link.href); } catch (e) { url = null; }
        var host = url ? url.hostname.replace(/^www\./, "") : "";
        var isTag = text && text.length <= 30 && text.indexOf(".") === -1;
        return {
            href: link.getAttribute("href"),
            title: link.textContent,
            desc: isTag ? "" : text,
            tag: isTag ? text : "",
            host: host,
            url: url
        };
    }

    function anchor(item, className) {
        var a = el("a", className);
        a.href = item.href;
        a.target = "_blank";
        a.rel = "noopener";
        return a;
    }

    var PREVIEWS = window.PREVIEWS || {};
    var GLYPHS = {
        code: "<path d='M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5'/>",
        repo: "<path d='M4 7.5L12 3.5l8 4v9l-8 4-8-4z'/><path d='M4 7.5l8 4 8-4M12 11.5v9'/>",
        pen: "<path d='M4 20l1-4.5L16 4.5l3.5 3.5-11 11z'/><path d='M13.5 7l3.5 3.5'/>",
        sparkle: "<path d='M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z'/>",
        doc: "<path d='M6 3.5h8l4 4v13H6z'/><path d='M14 3.5v4h4M9 12.5h6M9 16h6'/>",
        pie: "<path d='M11 4.5a8 8 0 1 0 8.5 8.5H11z'/><path d='M14 3.5a7 7 0 0 1 6.5 6.5H14z'/>",
        scroll: "<path d='M4 12h16M7.5 8.5L4 12l3.5 3.5M16.5 8.5L20 12l-3.5 3.5'/>",
        select: "<circle cx='12' cy='12' r='3'/><path d='M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4'/>",
        access: "<circle cx='12' cy='5.5' r='1.5'/><path d='M5 9l7 1.5L19 9M12 10.5V15l-3 5M12 15l3 5'/>",
        legend: "<circle cx='6' cy='7' r='1.2'/><circle cx='6' cy='12' r='1.2'/><circle cx='6' cy='17' r='1.2'/><path d='M10 7h9M10 12h9M10 17h9'/>",
        sliders: "<path d='M4 7h10M18 7h2M4 17h2M10 17h10'/><circle cx='16' cy='7' r='2'/><circle cx='8' cy='17' r='2'/>",
        cursor: "<path d='M6 4l12 6.5-5.2 1.6L10.5 18z'/>",
        star: "<path d='M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z'/>",
        brush: "<path d='M14.5 4.5l5 5-7 7-5-5z'/><path d='M7.5 11.5C5.5 11.5 4 13 4 15v4.5h4.5c2 0 3.5-1.5 3.5-3.5'/>",
        bars: "<path d='M5 20v-7M10 20V6M15 20v-9M20 20V9'/>"
    };

    // Topic icons, matched against the title, in Apple system colors
    var TOPICS = [
        [/pie|donut/, "pie", "#ff9500"],
        [/scroll/, "scroll", "#30b0c7"],
        [/selection/, "select", "#5856d6"],
        [/accessib/, "access", "#0a84ff"],
        [/legend/, "legend", "#34c759"],
        [/customization/, "sliders", "#8e8e93"],
        [/interaction|hover/, "cursor", "#af52de"],
        [/custom marks/, "star", "#ff2d55"],
        [/styling|gradient/, "brush", "#a2845e"],
        [/basics/, "bars", "#0071e3"]
    ];

    function icon(item, sectionId) {
        var glyph = "doc", color = "#ff9500";
        var title = item.title.toLowerCase();
        var topic = TOPICS.filter(function (t) { return t[0].test(title); })[0];
        if (sectionId === "tools") { glyph = "sparkle"; color = "#af52de"; }
        else if (item.host === "github.com") { glyph = "repo"; color = "#8e8e93"; }
        else if (sectionId === "examples") { glyph = "code"; color = "#0071e3"; }
        else if (/design/.test(item.href)) { glyph = "pen"; color = "#ff2d55"; }
        else if (topic) { glyph = topic[1]; color = topic[2]; }
        var span = el("span", "row-icon");
        span.style.background = color;
        span.innerHTML = "<svg viewBox='0 0 24 24' aria-hidden='true'>" + GLYPHS[glyph] + "</svg>";
        return span;
    }

    function image(src, className, fallback) {
        var img = el("img", className);
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", function () {
            if (fallback) img.replaceWith(fallback());
            else img.classList.add("broken");
        });
        return img;
    }

    function previewFor(item) {
        if (PREVIEWS[item.href]) return PREVIEWS[item.href];
        var id = item.url && item.url.searchParams.get("v");
        return id ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : null;
    }

    var items = [];
    sections.forEach(function (s) {
        var id = s.el.id;
        var kind = id === "books" ? "feature" : (id === "videos" || id === "wwdc-sessions") ? "media" : "list";
        s.el.classList.add("section-" + kind);
        Array.prototype.forEach.call(s.el.querySelectorAll("ul"), function (ul) {
            ul.className = kind === "feature" ? "features" : kind;
            Array.prototype.forEach.call(ul.children, function (li) {
                var item = parse(li);
                if (!item) return;
                var src = previewFor(item);
                var a;
                if (kind === "feature") {
                    a = anchor(item, "feature" + (src ? " has-image" : ""));
                    var text = el("span", "feature-text");
                    text.appendChild(el("span", "feature-eyebrow", "Book"));
                    text.appendChild(el("span", "feature-title", item.title));
                    if (item.desc) text.appendChild(el("span", "feature-desc", item.desc));
                    text.appendChild(el("span", "feature-link more", "Read the book"));
                    a.appendChild(text);
                    if (src) {
                        var figure = el("span", "feature-image");
                        figure.appendChild(image(src));
                        a.appendChild(figure);
                    }
                } else if (kind === "media") {
                    a = anchor(item, "card");
                    var frame = el("span", "card-image");
                    if (src) frame.appendChild(image(src));
                    a.appendChild(frame);
                    if (item.tag) a.appendChild(el("span", "card-eyebrow", item.tag));
                    a.appendChild(el("span", "card-title", item.title));
                    if (!item.tag) a.appendChild(el("span", "card-sub", item.host));
                } else {
                    a = anchor(item, "row");
                    var makeIcon = function () { return icon(item, id); };
                    var thumb = src ? image(src, "row-thumb", makeIcon) : makeIcon();
                    if (src) {
                        // Letterbox previews that are far from 16:9 instead of cropping them
                        thumb.addEventListener("load", function () {
                            var ratio = thumb.naturalWidth / thumb.naturalHeight;
                            if (Math.abs(ratio - 16 / 9) > 0.3) thumb.classList.add("contain");
                        });
                    }
                    a.appendChild(thumb);
                    var rowBody = el("span", "row-body");
                    var rowText = el("span", "row-text");
                    rowText.appendChild(el("span", "row-title", item.title));
                    var sub = [item.desc || item.tag, item.host].filter(Boolean).join(" · ");
                    rowText.appendChild(el("span", "row-sub", sub));
                    rowBody.appendChild(rowText);
                    rowBody.insertAdjacentHTML("beforeend", ARROW);
                    a.appendChild(rowBody);
                }
                li.textContent = "";
                li.appendChild(a);
                li.dataset.search = [item.title, item.desc, item.tag, item.host, s.title].join(" ").toLowerCase();
                items.push(li);
            });
        });
        // Single-item groups span the full width so longer lists pair up
        Array.prototype.forEach.call(s.el.querySelectorAll(".group"), function (g) {
            if (g.querySelectorAll("li").length === 1) g.classList.add("wide");
        });
    });

    // Hero links, search, image
    var links = el("p", "hero-links");
    links.innerHTML =
        "<a class='more' href='#" + (sections[0] ? sections[0].el.id : "") + "'>Browse " + items.length + " resources</a>" +
        "<a class='more' href='https://github.com/artemnovichkov/awesome-swift-charts' target='_blank' rel='noopener'>Suggest a resource</a>";
    heroInner.appendChild(links);

    var search = el("label", "search");
    search.innerHTML =
        "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='11' cy='11' r='7'/><path d='m20 20-3.5-3.5'/></svg>" +
        "<input type='search' placeholder='Search' aria-label='Search resources' autocomplete='off' spellcheck='false'>";
    heroInner.appendChild(search);
    heroInner.appendChild(el("p", "search-hint", "Press / to search"));
    if (heroImage) heroInner.appendChild(heroImage);
    var input = search.querySelector("input");

    var empty = el("p", "empty is-hidden");
    home.appendChild(empty);

    // Local nav
    var navList = nav && nav.querySelector(".localnav-links");
    var navLinks = [];
    sections.forEach(function (s) {
        if (!navList) return;
        var li = el("li");
        var a = el("a", "", s.title);
        a.href = "#" + s.el.id;
        li.appendChild(a);
        navList.appendChild(li);
        navLinks.push({ a: a, li: li, s: s });
    });
    var toggle = nav && nav.querySelector(".localnav-toggle");
    function setOpen(open) {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (toggle) {
        toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
        navList.addEventListener("click", function () { setOpen(false); });
    }

    // Search
    function filter() {
        var q = input.value.trim().toLowerCase();
        var total = 0;
        items.forEach(function (li) {
            var match = !q || li.dataset.search.indexOf(q) !== -1;
            li.classList.toggle("is-hidden", !match);
            if (match) total++;
        });
        Array.prototype.forEach.call(home.querySelectorAll(".group"), function (g) {
            g.classList.toggle("is-hidden", !g.querySelector("li:not(.is-hidden)"));
        });
        navLinks.forEach(function (l) {
            var visible = !!l.s.el.querySelector("li:not(.is-hidden)");
            l.s.el.classList.toggle("is-hidden", !visible);
            l.li.classList.toggle("is-hidden", !visible);
        });
        if (heroImage) heroImage.classList.toggle("is-hidden", !!q);
        empty.textContent = "No results for “" + input.value.trim() + "”.";
        empty.classList.toggle("is-hidden", total > 0);
        onScroll();
    }
    input.addEventListener("input", filter);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { input.value = ""; filter(); input.blur(); }
    });
    document.addEventListener("keydown", function (e) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
            e.preventDefault();
            input.focus();
            input.scrollIntoView({ block: "center" });
        }
    });

    // Scroll spy
    var current = null;
    function onScroll() {
        var offset = window.innerHeight * 0.35;
        var found = null;
        navLinks.forEach(function (l) {
            if (l.s.el.classList.contains("is-hidden")) return;
            if (l.s.el.getBoundingClientRect().top <= offset) found = l.a;
        });
        if (found !== current) {
            if (current) current.classList.remove("current");
            if (found) found.classList.add("current");
            current = found;
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
})();
