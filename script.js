const DATA_URL = "data.json";

const elements = {
  label: document.getElementById("session-label"),
  slide: document.getElementById("slide"),
  content: document.getElementById("slide-content"),
  loading: document.getElementById("loading-state"),
  error: document.getElementById("error-state"),
  count: document.getElementById("slide-count"),
  progress: document.getElementById("progress-track"),
  fill: document.getElementById("progress-fill"),
  previous: document.getElementById("previous-button"),
  next: document.getElementById("next-button"),
  notes: document.getElementById("notes-button")
};

let session;
let currentIndex = 0;
let notesVisible = false;

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addBlock(block, parent) {
  if (!block || typeof block !== "object") return;
  if (block.type === "paragraph") {
    parent.append(makeElement("p", "body-copy", block.text || ""));
  } else if (block.type === "list" || block.type === "questions") {
    const list = makeElement(block.type === "questions" ? "ol" : "ul", block.type === "questions" ? "question-list" : "content-list");
    (block.items || []).forEach(item => list.append(makeElement("li", "", item)));
    parent.append(list);
  } else if (block.type === "cards") {
    const grid = makeElement("div", "card-grid");
    (block.items || []).forEach(item => {
      const card = makeElement("article", "content-card");
      if (item.title) card.append(makeElement("h3", "", item.title));
      if (item.text) card.append(makeElement("p", "", item.text));
      grid.append(card);
    });
    parent.append(grid);
  } else if (block.type === "callout") {
    parent.append(makeElement("aside", "callout", block.text || ""));
  }
}

function addImages(images, parent) {
  if (!Array.isArray(images)) return;
  const imagesWithPaths = images.filter(image =>
    image && typeof image.src === "string" && image.src.trim() !== ""
  );
  if (imagesWithPaths.length === 0) return;

  const details = makeElement("details", "image-details");
  details.append(makeElement("summary", "", "Show images"));
  const gallery = makeElement("div", "image-gallery");
  imagesWithPaths.forEach(image => {
    const figure = makeElement("figure", "image-figure");
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt || "";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      figure.replaceChildren(makeElement("figcaption", "", `Image not found: ${image.src}`));
    }, { once: true });
    figure.append(img);
    if (image.caption) figure.append(makeElement("figcaption", "", image.caption));
    gallery.append(figure);
  });
  details.append(gallery);
  parent.append(details);
}

function renderSlide() {
  const slideData = session.slides[currentIndex];
  elements.content.replaceChildren();
  if (slideData.section) elements.content.append(makeElement("p", "eyebrow", slideData.section));
  const heading = makeElement(currentIndex === 0 ? "h1" : "h2", "", slideData.title || "Discussion");
  elements.content.append(heading);
  if (slideData.subtitle) elements.content.append(makeElement("p", "lead", slideData.subtitle));
  if (slideData.articleDetails) {
    const meta = makeElement("div", "article-meta");
    const author = makeElement("strong", "", slideData.articleDetails.authors || "");
    if (author.textContent) meta.append(author, document.createElement("br"));
    [slideData.articleDetails.publication, slideData.articleDetails.context].filter(Boolean).forEach((line, index) => {
      if (index) meta.append(document.createElement("br"));
      meta.append(document.createTextNode(line));
    });
    elements.content.append(meta);
  }
  (slideData.blocks || []).forEach(block => addBlock(block, elements.content));
  addImages(slideData.images, elements.content);

  const notes = slideData.notes;
  if (notesVisible && notes) {
    const panel = makeElement("aside", "notes-panel");
    panel.append(makeElement("h3", "", "Facilitator notes"));
    panel.append(makeElement("p", "", notes));
    elements.content.append(panel);
  }
  elements.count.textContent = `${currentIndex + 1} / ${session.slides.length}`;
  const percentage = ((currentIndex + 1) / session.slides.length) * 100;
  elements.fill.style.width = `${percentage}%`;
  elements.progress.setAttribute("aria-valuenow", String(Math.round(percentage)));
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === session.slides.length - 1;
  document.title = `${slideData.title || "Reading Circle"} — ${session.title || "Reading Circle"}`;
  elements.slide.scrollTop = 0;
}

function navigate(step) {
  if (!session) return;
  const nextIndex = Math.max(0, Math.min(session.slides.length - 1, currentIndex + step));
  if (nextIndex !== currentIndex) {
    currentIndex = nextIndex;
    renderSlide();
  }
}

async function start() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status})`);
    session = await response.json();
    if (!Array.isArray(session.slides) || session.slides.length === 0) throw new Error("Add at least one slide to data.json.");
    elements.label.textContent = session.sessionLabel || "Discussion session";
    elements.loading.hidden = true;
    elements.slide.hidden = false;
    renderSlide();
  } catch (error) {
    console.error(error);
    elements.loading.hidden = true;
    elements.error.hidden = false;
  }
}

elements.previous.addEventListener("click", () => navigate(-1));
elements.next.addEventListener("click", () => navigate(1));
elements.notes.addEventListener("click", () => {
  notesVisible = !notesVisible;
  elements.notes.setAttribute("aria-pressed", String(notesVisible));
  elements.notes.textContent = notesVisible ? "Hide notes" : "Presenter notes";
  if (session) renderSlide();
});
document.getElementById("print-button").addEventListener("click", () => window.print());
document.getElementById("fullscreen-button").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) { console.warn("Fullscreen is not available in this browser.", error); }
});
document.addEventListener("keydown", event => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); navigate(1); }
  else if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); navigate(-1); }
  else if (event.key.toLowerCase() === "n") elements.notes.click();
  else if (event.key.toLowerCase() === "f") document.getElementById("fullscreen-button").click();
  else if (event.key === "Home" && session) { currentIndex = 0; renderSlide(); }
  else if (event.key === "End" && session) { currentIndex = session.slides.length - 1; renderSlide(); }
});

start();
