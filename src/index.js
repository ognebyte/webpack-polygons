import "./styles/style.css";
import "./styles/workplace.css";
import "./components/polygon-item";
import "./components/work-place";

const buffer = document.querySelector(".buffer");
const createPolygonsButton = document.getElementById("create-polygons");
const savePolygonsButton = document.getElementById("save-polygons");
const resetPolygonsButton = document.getElementById("reset-polygons");

window.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        if (polygon) {
            const polygonItem = document.createElement("polygon-item");
            polygon.removeAttribute("transform");
            polygon.removeAttribute("data-id");
            polygon.removeAttribute("class");
            polygonItem.id = polygonId;
            polygonItem.appendChild(polygon);
            buffer.appendChild(polygonItem);
        }
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

const showNotification = (element, newText, timeout = 500) => {
    if (!element) return;

    let prevText = element.textContent;
    element.textContent = newText;
    element.classList.add("success");
    element.disabled = true;
    
    setTimeout(() => {
        element.textContent = prevText;
        element.classList.remove("success");
        element.removeAttribute("disabled");
    }, timeout);
};

const createPolygons = () => {
    buffer.innerHTML = "";
    const polygonCount = getRandomInt(5, 20);
    for (let i = 0; i < polygonCount; i++) {
        const polygon = document.createElement("polygon-item");
        buffer.appendChild(polygon);
    }

    showNotification(createPolygonsButton, "Создано");
};

const savePolygons = () => {
    const content = document.getElementById("workplace-content");
    if (!content) return;

    const polygons = [...content.querySelectorAll("polygon")].map((poly) => ({
        points: poly.getAttribute("points"),
        fill: poly.getAttribute("fill"),
        transform: poly.getAttribute("transform"),
        dataId: poly.getAttribute("data-id"),
    }));

    const data = {
        transform: content.getAttribute("transform"),
        polygons,
    };

    localStorage.setItem("workplace-data", JSON.stringify(data));

    showNotification(savePolygonsButton, "Сохранено");
};

const resetPolygons = () => {
    const content = document.getElementById("workplace-content");
    if (!content) return;

    content.innerHTML = "";
    buffer.innerHTML = "";

    localStorage.clear();

    showNotification(resetPolygonsButton, "Сброшено");
};

createPolygonsButton.addEventListener("click", () => createPolygons());
savePolygonsButton.addEventListener("click", () => savePolygons());
resetPolygonsButton.addEventListener("click", () => resetPolygons());
