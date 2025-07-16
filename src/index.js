import "./styles/style.css";
import "./components/polygon-item";
import "./components/work-place";


const buffer = document.querySelector(".buffer");
const createPolygonsButton = document.getElementById("create-polygons");

window.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

window.randomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
};

const createPolygon = () => {
    buffer.innerHTML = "";
    const polygonCount = getRandomInt(5, 20);
    for (let i = 0; i < polygonCount; i++) {
        const polygon = document.createElement("polygon-item");
        buffer.appendChild(polygon);
    }
};


createPolygonsButton.addEventListener("click", () => createPolygon());