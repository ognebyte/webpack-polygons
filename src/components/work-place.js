class WorkPlace extends HTMLElement {
    constructor() {
        super();
        this.scale = 1;
        this.isDragging = false;
        this.startX, this.startY;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
        this.updateRulers();
    }

    render() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const content = document.createElementNS("http://www.w3.org/2000/svg", "g");
        content.id = "workplace-content";

        const rulerX = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rulerX.id = "ruler-x";

        const rulerY = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rulerY.id = "ruler-y";

        svg.append(content, rulerX, rulerY);
        this.appendChild(svg);
    }

    setupEvents() {
        this.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        this.addEventListener("drop", (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            const draggedSvg = document.getElementById(id);
            const polygon = draggedSvg.querySelector("polygon");
            draggedSvg.remove();

            if (polygon) {
                const newPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

                for (let attr of polygon.attributes) {
                    newPolygon.setAttribute(attr.name, attr.value);
                }

                newPolygon.setAttribute("data-id", id);
                newPolygon.setAttribute("draggable", "true");

                let rect = this.getBoundingClientRect();
                let x = e.clientX - rect.x;
                let y = e.clientY - rect.y;

                newPolygon.setAttribute("transform", `translate(${x},${y})`);
                newPolygon.classList.add("draggable");

                const content = this.querySelector("#workplace-content");
                content.appendChild(newPolygon);
            }
        });

        this.addEventListener(
            "wheel",
            (e) => {
                e.preventDefault();
                const delta = -e.deltaY * 0.001;
                this.scale += delta;
                this.scale = Math.min(Math.max(0.2, this.scale), 5);
                this.updateTransform();
            },
            { passive: false }
        );

        this.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            if (e.target.tagName == "polygon") {
                this.movePolygon(e);
                return;
            }
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            this.offsetX += dx;
            this.offsetY += dy;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.updateTransform();
        });

        window.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }

    updateTransform() {
        const transformStr = `translate(${this.offsetX},${this.offsetY}) scale(${this.scale})`;
        const workplaceContent = this.querySelector("#workplace-content");
        workplaceContent.setAttribute("transform", transformStr);

        this.updateRulers();
    }

    updateRulers() {
        const rulerX = this.querySelector("#ruler-x");
        const rulerY = this.querySelector("#ruler-y");

        rulerX.innerHTML = "";
        rulerY.innerHTML = "";

        const svg = this.querySelector("svg");
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const step = 100;

        for (let x = step; x < width; x += step) {
            const realX = (x - this.offsetX) / this.scale;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("x2", x);
            line.setAttribute("y1", 18);
            line.setAttribute("y2", 24);
            line.setAttribute("stroke", "#aaa");
            rulerX.appendChild(line);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", 4);
            text.setAttribute("font-size", "14");
            text.setAttribute("fill", "#999");
            text.textContent = Math.round(realX);
            rulerX.appendChild(text);
        }

        for (let y = step; y < height; y += step) {
            const realY = (y - this.offsetY) / this.scale;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 18);
            line.setAttribute("x2", 24);
            line.setAttribute("y1", y);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#aaa");
            rulerY.appendChild(line);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 8);
            text.setAttribute("y", y);
            text.setAttribute("font-size", "14");
            text.setAttribute("fill", "#999");
            text.textContent = Math.round(realY);
            rulerY.appendChild(text);
        }
    }

    movePolygon(e) {
        const target = e.target;
        let startX = e.clientX;
        let startY = e.clientY;
        let offsetX = 0, offsetY = 0;

        const origTransform = target.getAttribute("transform") || "";
        if (origTransform) {
            const match = origTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);

            if (match) {
                offsetX = parseFloat(match[1]);
                offsetY = parseFloat(match[2]);
            }
        }

        const onMouseMove = (polyE) => {
            const dx = offsetX + (polyE.clientX - startX) / this.scale;
            const dy = offsetY + (polyE.clientY - startY) / this.scale;
            target.setAttribute("transform", `translate(${dx},${dy})`);
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
}

if (!customElements.get("work-place")) {
    customElements.define("work-place", WorkPlace);
}
