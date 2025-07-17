import "./styles/style.css";
import "./styles/workplace.css";
import "./components/polygon-item";
import "./components/work-place";

const buffer = document.querySelector(".buffer");
const createPolygonsButton = document.getElementById("create-polygons");

window.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

window.randomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 40 + Math.random() * 20;
    const lightness = 60 + Math.random() * 15;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

var isDragging, polygonId;

window.addEventListener("mousedown", (e) => {
    const target = e.target;
    if (target.tagName === "polygon" && target.dataset.id) {
        isDragging = true;
        polygonId = target.dataset.id;
    }
});

window.addEventListener("mouseup", () => {
    if (buffer.classList.contains("dragenter") && polygonId) {
        const polygon = document.querySelector(`#workplace-content polygon[data-id="${polygonId}"]`);
        const polygonItem = document.createElement("polygon-item");
        polygon.removeAttribute("transform");
        polygon.removeAttribute("data-id");
        polygon.removeAttribute("class");
        polygonItem.id = polygonId;
        polygonItem.appendChild(polygon);
        buffer.appendChild(polygonItem);
    }
    polygonId = null;
    isDragging = false;
    buffer.classList.remove("dragenter");
});

buffer.addEventListener("mouseenter", (e) => {
    if (!isDragging) return;
    buffer.classList.add("dragenter");
});

buffer.addEventListener("mouseleave", () => {
    buffer.classList.remove("dragenter");
});

const createPolygon = () => {
    buffer.innerHTML = "";
    const polygonCount = getRandomInt(5, 20);
    for (let i = 0; i < polygonCount; i++) {
        const polygon = document.createElement("polygon-item");
        buffer.appendChild(polygon);
    }
};

createPolygonsButton.addEventListener("click", () => createPolygon());
