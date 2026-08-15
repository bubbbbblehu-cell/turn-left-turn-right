import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Signal Earth product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>向左转向右转 \/ Signal Earth<\/title>/i);
  assert.match(html, /Turn left,/);
  assert.match(html, /turn right/);
  assert.match(html, /世界向左 我们向右/);
  assert.match(html, /lyric lyric-title landing-title/);
  assert.match(html, /lyric intro-copy/);
  assert.match(html, /全球绿灯/);
  assert.match(html, /特别信号档案/);
  assert.match(html, /柏林/);
  assert.match(html, /上海/);
  assert.match(html, /台北/);
  assert.match(html, /东京/);
  assert.match(html, /纽约/);
  assert.match(html, /伦敦/);
  assert.match(html, /首尔/);
  assert.match(html, /悉尼/);
  assert.match(html, /维也纳/);
  assert.match(html, /阿姆斯特丹/);
  assert.match(html, /巴黎/);
  assert.match(html, /哥本哈根/);
  assert.match(html, /里斯本/);
  assert.match(html, /布拉格/);
  assert.match(html, /新加坡/);
  assert.match(html, /曼谷/);
  assert.match(html, /香港/);
  assert.match(html, /墨西哥城/);
  assert.match(html, /圣保罗/);
  assert.match(html, /开普敦/);
  assert.match(html, /SOUND/);
  assert.match(html, /OFF/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps the realistic globe, difference-first locations, twelve special signals and ensemble in the product", async () => {
  const [component, css] = await Promise.all([
    readFile(new URL("../app/signal-earth.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    access(new URL("../public/brand/traffic-light-illustration.png", import.meta.url)),
    access(new URL("../public/characters/berlin-green.svg", import.meta.url)),
    access(new URL("../public/city-photos/prague-01.jpg", import.meta.url)),
    access(new URL("../public/city-photos/prague-02.jpg", import.meta.url)),
    access(new URL("../public/signal-sources/prague-ztohoven.jpg", import.meta.url)),
    access(new URL("../public/signal-stories/utrecht-miffy.jpg", import.meta.url)),
    access(new URL("../public/signal-stories/mainz-mainzel.png", import.meta.url)),
    access(new URL("../public/signal-stories/munich-pumuckl.jpg", import.meta.url)),
    access(new URL("../public/signal-stories/rotterdam-red-panda.jpg", import.meta.url)),
    access(new URL("../public/characters/utrecht-miffy-led.svg", import.meta.url)),
    access(new URL("../public/characters/mainz-det-led.svg", import.meta.url)),
    access(new URL("../public/characters/munich-pumuckl-led.svg", import.meta.url)),
    access(new URL("../public/map-signals/edinburgh-pride-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/geneva-tram-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/wellington-carmen.jpg", import.meta.url)),
    access(new URL("../public/map-signals/taipei-little-green-man.jpg", import.meta.url)),
    access(new URL("../public/map-signals/stockholm-same-sex-signals.jpg", import.meta.url)),
    access(new URL("../public/map-signals/madrid-pride-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/india-udagamandalam-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/lugano-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/dublin-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/milan-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/kuala-lumpur-countdown-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/manila-street-signals.jpg", import.meta.url)),
    access(new URL("../public/map-signals/brussels-crossing-button.jpg", import.meta.url)),
    access(new URL("../public/map-signals/athens-crosswalk-button.jpg", import.meta.url)),
    access(new URL("../public/map-signals/johannesburg-traffic-light.jpg", import.meta.url)),
    access(new URL("../public/map-signals/santiago-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../public/map-signals/buenos-aires-signals.jpg", import.meta.url)),
    access(new URL("../public/map-signals/countries/south-africa-green-man.jpg", import.meta.url)),
    access(new URL("../public/map-signals/countries/south-africa-red-man.jpg", import.meta.url)),
  ]);

  assert.match(component, /type CityId = "berlin" \| "shanghai" \| "taipei" \| "tokyo" \| "newyork" \| "london" \| "seoul" \| "sydney" \| "vienna" \| "amsterdam" \| "paris" \| "copenhagen" \| "lisbon" \| "prague" \| "singapore" \| "bangkok" \| "hongkong" \| "mexicocity" \| "saopaulo" \| "capetown"/);
  assert.match(component, /SoundLayer/);
  assert.match(component, /soundOn, setSoundOn\] = useState\(false\)/);
  assert.match(component, /CobeGlobe/);
  assert.match(component, /createGlobe/);
  assert.match(component, /type Globe/);
  assert.match(component, /type Marker/);
  assert.match(component, /onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  assert.match(component, /CityPreview/);
  assert.match(component, /EnsembleStage/);
  assert.match(component, /cityIds\.map/);
  assert.match(component, /CharacterGraphic/);
  assert.match(component, /mapSamples:18000/);
  assert.match(component, /markerElevation/);
  assert.match(component, /assetKind/);
  assert.match(component, /ensembleLayout/);
  assert.match(component, /playSignal\(id, true\)/);
  assert.match(component, /aria-pressed=\{soundLayers\[layer\]\}/);
  assert.match(component, /zoom, setZoom/);
  assert.match(component, /positionAnchor/);
  assert.match(component, /--cobe-visible-/);
  assert.match(component, /scale\(\$\{Number\(\(1\/zoom\)\.toFixed\(4\)\)\}\)/);
  assert.match(component, /Math\.min\(3\.4/);
  assert.doesNotMatch(component, /map-signal-mini/);
  assert.doesNotMatch(component, /className="globe-legend"/);
  assert.match(component, /baseColor:\[1,1,1\]/);
  assert.match(component, /primeMapTexture/);
  assert.match(component, /requestAnimationFrame\(primeMapTexture\)/);
  assert.match(component, /useState\(1\.08\)/);
  assert.match(component, /onPointerLeave=\{\(event\)\s*=>\s*event\.currentTarget\.blur\(\)\}/);
  assert.match(component, /prague-01\.jpg/);
  assert.match(component, /source-character/);
  assert.match(component, /const signalStories: SignalStory\[\]/);
  assert.match(component, /const mapPoints: MapPoint\[\]/);
  assert.match(component, /const catalogCitySeeds/);
  assert.match(component, /const MAP_POINT_COUNT=mapPoints\.length/);
  assert.match(component, /const COUNTRY_COUNT=195/);
  assert.match(component, /country-coverage\.json/);
  assert.match(component, /CountryCoveragePreview/);
  assert.match(component, /country-map-pin/);
  assert.match(component, /countryCoverage\.map/);
  assert.match(component, /查看\$\{country\.country\}的行人信号收集状态/);
  assert.match(component, /data-collision-radius/);
  assert.doesNotMatch(component, /\["beijing","北京"/);
  assert.match(component, /世界向左 我们向右/);
  assert.match(component, /<span>Turn left,<\/span><span>turn right<\/span>/);
  assert.match(component, /CatalogCityPreview/);
  assert.match(component, /SIGNAL EXISTS/);
  assert.match(component, /COUNTRY REFERENCE/);
  assert.match(component, /london-pride/);
  assert.match(component, /edinburgh-pride/);
  assert.match(component, /trier-marx/);
  assert.match(component, /wellington-carmen/);
  assert.match(component, /hameln-pied-piper/);
  assert.match(component, /ARCHIVE PHOTO \/ 实拍档案/);
  assert.match(component, /hasAnimatedCharacter/);
  assert.match(component, /const mapFeatureCards: MapFeatureCard\[\]/);
  assert.match(component, /catalog-dublin/);
  assert.match(component, /city-taipei/);
  assert.match(component, /catalog-kualalumpur/);
  assert.match(component, /catalog-buenosaires/);
  assert.match(component, /catalog-johannesburg/);
  assert.match(component, /zoom<=1\.5/);
  assert.match(component, /geneva-tram-signal/);
  assert.match(component, /tilt, setTilt/);
  assert.match(component, /event\.clientY/);
  assert.match(component, /TracedSignalCharacter/);
  assert.match(component, /REAL LED TRACE/);
  assert.match(component, /special-pin/);
  assert.match(component, /selectedStoryId/);
  assert.match(component, /signal-app raw-doodle-ui/);
  assert.match(component, /color:\[0,0,0\]/);
  assert.match(component, /markerColor:\[0,0,0\]/);
  assert.match(component, /traffic-light-illustration\.png/);
  assert.match(component, /type FontMode = "fusion" \| "trackpad"/);
  assert.match(component, /className="font-switch"/);
  assert.match(component, /useState<FontMode>\("trackpad"\)/);
  assert.match(component, /onClick=\{\(\)=>setFontMode\("trackpad"\)\}>TRACKPAD/);
  assert.match(component, /www\.notyourtype\.nl\/typefaces\/testtype/);
  assert.match(component, /Xiaoyuan Gao \/ notyourtypefoundry/);
  assert.match(css, /traffic-mark-illustration/);
  assert.match(component, /SignalStoryPreview/);
  assert.match(component, /SpecialPixelCharacter/);
  assert.match(component, /pixel-miffy/);
  assert.match(component, /pixel-paws/);
  assert.match(component, /thumbnailZoom/);
  assert.match(component, /focalPoint/);
  assert.match(component, /lat: 52\.0907, lon: 5\.1214/);
  assert.match(component, /SignalArchive/);
  assert.match(component, /乌得勒支/);
  assert.match(component, /Mainzelmännchen/);
  assert.match(component, /Pumuckl/);
  assert.match(component, /小红熊猫/);
  assert.match(component, /context\.resume\(\)\.then\(startTone\)/);
  assert.match(component, /selectSemanticPoints/);
  assert.match(component, /pointDisplayPriority/);
  assert.match(component, /reflowMapPoints/);
  assert.match(component, /clearPointOffsets/);
  assert.match(component, /data-map-point/);
  assert.match(component, /--point-x/);
  assert.match(component, /requestAnimationFrame\(reflowMapPoints\)/);
  assert.match(component, /safeDistance=zoom<1\.2\?48:zoom<1\.8\?42:34/);
  assert.match(component, /maxOffset=zoom<1\.2\?160:zoom<1\.8\?138:104/);
  assert.match(component, /iteration<18/);
  assert.match(component, /--connector-length/);
  assert.match(component, /--connector-angle/);
  assert.match(component, /far-separated/);
  assert.doesNotMatch(component, /map-cluster/);
  assert.doesNotMatch(component, /pin-leader/);
  assert.match(component, /搜索地图国家或城市/);
  assert.match(component, /searchResults/);
  assert.match(component, /locatePoint/);
  assert.match(component, /autoRotate,setAutoRotate\]=useState\(true\)/);
  assert.match(component, /setInterval\(\(\)=>setRotation/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /spotlightCandidates/);
  assert.match(component, /NOW PASSING/);
  assert.match(component, /自动巡游中/);
  assert.match(component, /行人与自行车在同一根灯杆上等绿灯/);
  assert.match(component, /setSoundLayers\(\{ signal: true, ambient: true, performance: true \}\)/);
  assert.doesNotMatch(component, /view === "city"/);
  assert.match(css, /taipei-run/);
  assert.match(css, /techno-dance/);
  assert.match(css, /shanghai-flight/);
  assert.match(css, /metro-tokyo/);
  assert.match(css, /metro-newyork/);
  assert.match(css, /metro-london/);
  assert.match(css, /metro-seoul/);
  assert.match(css, /metro-sydney/);
  assert.match(css, /metro-vienna/);
  assert.match(css, /metro-amsterdam/);
  assert.match(css, /metro-paris/);
  assert.match(css, /metro-copenhagen/);
  assert.match(css, /metro-singapore/);
  assert.match(css, /metro-capetown/);
  assert.match(css, /arm-swing/);
  assert.match(css, /leg-swing/);
  assert.match(css, /prague-photo-city/);
  assert.match(css, /source-character/);
  assert.match(css, /globe-controls>strong/);
  assert.match(css, /city-preview/);
  assert.match(css, /ensemble-character/);
  assert.match(css, /signal-archive/);
  assert.match(css, /story-card/);
  assert.match(css, /cobe-map-pin/);
  assert.match(css, /active:not\(:hover\):not\(:focus-visible\)>span/);
  assert.match(css, /MAP-FIRST PIXEL LANDING/);
  assert.match(css, /intro-panel h1\.landing-title/);
  assert.match(css, /catalog-pin/);
  assert.match(css, /map-pin\.cobe-map-pin\{width:28px;height:28px/);
  assert.match(css, /map-feature-card/);
  assert.match(css, /border-radius:50%/);
  assert.match(css, /catalog-found-photo/);
  assert.match(css, /catalog-city-preview/);
  assert.match(css, /photo-only-badge/);
  assert.match(css, /special-pin/);
  assert.match(css, /special-preview/);
  assert.match(css, /globe-legend/);
  assert.match(css, /WHITE PIXEL THEME/);
  assert.match(css, /background-color:#f7f4e9/);
  assert.match(css, /PIXEL SIGNAL CHARACTERS/);
  assert.match(css, /pixel-hop/);
  assert.match(css, /pixel-march/);
  assert.match(css, /pixel-run/);
  assert.match(css, /paw-step/);
  assert.match(css, /COBE WEBGL GLOBE/);
  assert.match(css, /\.globe-shell::after\{display:none\}/);
  assert.match(css, /pixel-pin/);
  assert.match(css, /PHOTO-TRACED LED SVG CHARACTERS/);
  assert.match(css, /real-pumuckl-run/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /CONTINUOUS GLOBE TOUR/);
  assert.match(css, /globe-tour-breathe/);
  assert.match(css, /signal-card-reveal/);
  assert.match(css, /signal-soft-pulse/);
  assert.match(css, /SEMANTIC ZOOM \+ PERSISTENT COLLISION AVOIDANCE/);
  assert.match(css, /auto-separated/);
  assert.match(css, /RAW NAIVE INK UI/);
  assert.match(css, /Marker Felt/);
  assert.match(css, /FULL-SITE PIXEL TYPOGRAPHY/);
  assert.match(css, /@font-face\{font-family:"Fusion Pixel 12px"/);
  assert.match(css, /@font-face\{font-family:"testType trackpad";src:url\("\/fonts\/testtype-trackpad\/testtype-trackpad\.woff"\)/);
  assert.match(css, /fusion-pixel-12px-proportional-zh_hans\.ttf\.woff2/);
  assert.match(css, /--font-pixel:"Fusion Pixel 12px","SFMono-Regular",Consolas,monospace/);
  assert.match(css, /font-family:var\(--font-hand\)!important/);
  assert.match(css, /FUSION PIXEL INTERFACE RHYTHM/);
  assert.match(css, /\.lyric\{font-family:var\(--font-pixel\)!important;font-size:28px;font-weight:400;letter-spacing:\.04em;line-height:1\.55;transform:none;opacity:1\}/);
  assert.match(css, /DYNAMIC CITY COLLISION \+ HAND-DRAWN LEADERS/);
  assert.match(css, /far-separated::before/);
  assert.match(css, /LOCAL FONT SWITCH: FUSION PIXEL \/ TESTTYPE TRACKPAD/);
  assert.match(css, /font-trackpad\{--font-hand:"testType trackpad",var\(--font-pixel\)\}/);
  assert.match(css, /QUIETER FRAME \+ BORDERLESS CONTROLS/);
  assert.match(css, /\.raw-doodle-ui \.app-header\{border-bottom:0;transform:none\}/);
  assert.match(css, /\.raw-doodle-ui \.app-header::after\{display:none\}/);
  assert.match(css, /font-switch button\.active\{color:#000;background:transparent\}/);
  assert.match(css, /intro-panel h1\.lyric\.lyric-title\{max-width:300px;font-size:clamp\(38px,4\.1vw,62px\)/);
  assert.match(css, /landing-title>span\{display:block;width:max-content;max-width:100%;white-space:nowrap\}/);
  assert.match(css, /text-transform:none/);
  assert.match(css, /COLOR-PRESERVED PHOTOGRAPHY/);
  assert.match(css, /\.raw-doodle-ui \.preview-stage\{filter:none\}/);
  assert.match(css, /\.raw-doodle-ui \.story-card figure img,\.raw-doodle-ui \.story-card:hover figure img\{filter:none!important;mix-blend-mode:normal!important\}/);
  assert.match(css, /--green:#000/);
  assert.match(css, /content:"✶"/);
  assert.match(css, /story-card figure img\{filter:grayscale\(1\) contrast\(2\.5\)/);
  assert.match(css, /map-feature-card img\{filter:grayscale\(1\) contrast\(2\.4\)/);
  assert.doesNotMatch(css, /lens-active/);
  assert.doesNotMatch(css, /map-cluster/);
  assert.doesNotMatch(css, /spider-pin/);
});

test("bundles the Fusion Pixel Chinese font and its upstream licenses", async () => {
  await Promise.all([
    access(new URL("../public/fonts/fusion-pixel-12px/fusion-pixel-12px-proportional-zh_hans.ttf.woff2", import.meta.url)),
    access(new URL("../public/fonts/fusion-pixel-12px/OFL.txt", import.meta.url)),
    access(new URL("../public/fonts/fusion-pixel-12px/LICENSES/ark-pixel/OFL.txt", import.meta.url)),
    access(new URL("../public/fonts/fusion-pixel-12px/LICENSES/cubic-11/OFL.txt", import.meta.url)),
    access(new URL("../public/fonts/fusion-pixel-12px/LICENSES/galmuri/LICENSE.txt", import.meta.url)),
  ]);
  const license = await readFile(new URL("../public/fonts/fusion-pixel-12px/OFL.txt", import.meta.url), "utf8");
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
});

test("bundles the user-downloaded Trackpad webfont and its local-use license", async () => {
  await Promise.all([
    access(new URL("../public/fonts/testtype-trackpad/testtype-trackpad.woff", import.meta.url)),
    access(new URL("../public/fonts/testtype-trackpad/nytf_freetousebutbenice_ver_1_1.pdf", import.meta.url)),
  ]);
});

test("keeps the landing title complete and the city list in a non-overlapping flex column", async () => {
  const [component, css] = await Promise.all([
    readFile(new URL("../app/signal-earth.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(component, /<span>Turn left,<\/span><span>turn right<\/span>/);
  assert.match(component, /<b>\{cities\[id\]\.city\}<\/b>/);
  assert.match(css, /LANDING COLUMN: NO CLIPPED TITLE OR PHANTOM EMPTY LIST AREA/);
  assert.match(css, /\.raw-doodle-ui \.intro-panel\{display:flex;flex-direction:column;overflow:hidden\}/);
  assert.match(css, /\.raw-doodle-ui \.city-shortcuts\{flex:1 1 150px/);
  assert.match(css, /\.raw-doodle-ui \.status-row\{position:static/);
});

test("publishes researched signal assets in the local material library", async () => {
  const [html, rawCatalog] = await Promise.all([
    readFile(new URL("../../assets/traffic-light-svg/index.html", import.meta.url), "utf8"),
    readFile(new URL("../../assets/traffic-light-svg/catalog.json", import.meta.url), "utf8"),
    access(new URL("../../assets/traffic-light-svg/photos/edinburgh-pride-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/geneva-tram-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/london-pride-signals.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/trier-karl-marx.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/wellington-carmen.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/hameln-pied-piper.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/taipei-little-green-man.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/stockholm-same-sex-signals.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/madrid-pride-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/india-udagamandalam-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/lugano-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/svg/sweden-pedestrian-green.svg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/dublin-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/milan-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/kuala-lumpur-countdown-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/manila-street-signals.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/brussels-crossing-button.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/athens-crosswalk-button.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/johannesburg-traffic-light.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/santiago-pedestrian-signal.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/buenos-aires-signals.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/south-africa-green-man.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/south-africa-red-man.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/suriname-green-paramaribo.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/suriname-red-paramaribo.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/turkmenistan-ashgabat.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/photos/countries/uzbekistan-tashkent-pedestrian.jpg", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/audit.html", import.meta.url)),
    access(new URL("../../assets/traffic-light-svg/country-coverage.js", import.meta.url)),
  ]);
  const catalog = JSON.parse(rawCatalog);
  assert.equal(catalog.length, 30);
  assert.match(html, /实拍档案 20/);
  assert.match(html, /搜索素材库/);
  assert.match(html, /爱丁堡 · Pride Signals/);
  assert.match(html, /日内瓦 · Tram Signal/);
  assert.match(html, /台北 · Little Green Man/);
  assert.match(html, /斯德哥尔摩 · Same Sex Signals/);
  assert.match(html, /马德里 · Pride Signal/);
  assert.match(html, /都柏林 · Modern Green/);
  assert.match(html, /吉隆坡 · Countdown Signal/);
  assert.match(html, /布宜诺斯艾利斯 · Walk \+ Cycle/);
  assert.match(html, /发布前复核/);
});

test("covers all 195 sovereign-country records without pretending every asset is verified", async () => {
  const raw = await readFile(new URL("../public/data/country-coverage.json", import.meta.url), "utf8");
  const countries = JSON.parse(raw);
  assert.equal(countries.length, 195);
  assert.equal(new Set(countries.map((country) => country.code)).size, 195);
  assert.ok(countries.some((country) => country.code === "VAT"));
  assert.ok(countries.some((country) => country.code === "PSE"));
  assert.equal(countries.find((country) => country.code === "ZAF")?.status, "verified-photo");
  assert.ok(countries.some((country) => country.status === "traffic-category"));
  assert.deepEqual([...new Set(countries.map((country) => country.continent))].sort(), ["亚洲", "欧洲", "美洲", "非洲", "大洋洲"].sort());
});

test("syncs newly verified country evidence into the archive and globe preview", async () => {
  const [component, evidence, archive] = await Promise.all([
    readFile(new URL("../app/signal-earth.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../assets/traffic-light-svg/country-evidence.json", import.meta.url), "utf8"),
    readFile(new URL("../../assets/traffic-light-svg/index.html", import.meta.url), "utf8"),
  ]);
  const items = JSON.parse(evidence);
  assert.ok(items.length >= 14);
  assert.ok(items.some((item) => item.code === "ARM" && item.status === "verified-photo"));
  assert.ok(items.some((item) => item.code === "UKR" && item.asset.endsWith("ukr-pedestrian-signal.jpg")));
  assert.ok(items.some((item) => item.code === "COL" && item.status === "supplementary-only"));
  assert.match(component, /country\.asset\.startsWith\("photos\/countries\/"\)/);
  assert.match(archive, /country-evidence\.js/);
});
