class WorkPlace extends HTMLElement {
    constructor() {
        super();
        this.scale = 1;
        this.isDragging = false;
        this.startX = this.startY = 0;
        this.offsetX = this.offsetY = 0;
        this.dragDepth = 0;
        this.gridSize = 20;
    }

    connectedCallback() {
        this.render();
        this.loadPolygons();
        this.setupEvents();
        this.updateTransform();
    }

    getTranslateValue(string) {
        const match = string.match(/translate\(([^,]+),\s*([^)]+)\)/);
        return match ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
    }

    getScaleValue(string) {
        const match = string.match(/scale\(([^)]+)\)/);
        return match ? parseFloat(match[1]) : 1;
    }

    render() {
        this.innerHTML = `
            <div class="rulers-container">
                <div class="ruler ruler-corner"></div>
                <div class="ruler ruler-x"></div>
                <div class="ruler ruler-y"></div>
            </div>
            
            <div class="workplace">
                <svg class="grid-pattern" width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="${this.gridSize}" height="${this.gridSize}" patternUnits="userSpaceOnUse">
                            <path d="M ${this.gridSize} 0 L 0 0 0 ${this.gridSize}" fill="none" stroke="currentColor" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                
                <svg class="content-svg" width="100%" height="100%">
                    <g id="workplace-content"></g>
                </svg>
            </div>
        `;
    }

    loadPolygons = () => {
        const content = this.querySelector("#workplace-content");
        if (!content) return;

        const rawData = localStorage.getItem("workplace-data");
        if (!rawData) return;

        const data = JSON.parse(rawData);
        content.innerHTML = "";

        if (data.transform) {
            [this.offsetX, this.offsetY] = this.getTranslateValue(data.transform);
            this.scale = this.getScaleValue(data.transform);
        }

        data.polygons.forEach((p) => {
            const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            poly.setAttribute("points", p.points);
            poly.setAttribute("fill", p.fill);
            poly.setAttribute("transform", p.transform);
            poly.setAttribute("data-id", p.dataId);
            poly.setAttribute("stroke", "currentColor");
            poly.setAttribute("stroke-width", "2");
            poly.classList.add("draggable");

            content.appendChild(poly);
        });
    };

    setupEvents() {
        const workplace = this.querySelector(".workplace");

        workplace.addEventListener("dragenter", () => {
            if (this.dragDepth++ === 0) this.classList.add("dragenter");
        });

        workplace.addEventListener("dragover", (e) => e.preventDefault());

        workplace.addEventListener("dragleave", () => {
            if (--this.dragDepth <= 0) {
                this.dragDepth = 0;
                this.classList.remove("dragenter");
            }
        });

        workplace.addEventListener("drop", (e) => {
            e.preventDefault();
            this.dragDepth = 0;
            this.classList.remove("dragenter");

            const id = e.dataTransfer.getData("text/plain");
            const draggedSvg = document.getElementById(id);
            const polygon = draggedSvg?.querySelector("polygon");

            if (!polygon) return;

            draggedSvg.remove();

            const newPolygon = this.createSVGElement("polygon");
            [...polygon.attributes].forEach((attr) => newPolygon.setAttribute(attr.name, attr.value));

            const rect = workplace.getBoundingClientRect();
            const x = (e.clientX - rect.x - this.offsetX) / this.scale;
            const y = (e.clientY - rect.y - this.offsetY) / this.scale;

            newPolygon.dataset.id = id;
            newPolygon.classList.add("draggable");
            newPolygon.setAttribute("transform", `translate(${x},${y})`);

            this.querySelector("#workplace-content").appendChild(newPolygon);
        });

        workplace.addEventListener(
            "wheel",
            (e) => {
                e.preventDefault();
                const rect = workplace.getBoundingClientRect();
                const mouseX = e.clientX - rect.x;
                const mouseY = e.clientY - rect.y;

                const worldX = (mouseX - this.offsetX) / this.scale;
                const worldY = (mouseY - this.offsetY) / this.scale;

                this.scale = Math.min(Math.max(0.2, this.scale - e.deltaY * 0.001), 10);

                this.offsetX = mouseX - worldX * this.scale;
                this.offsetY = mouseY - worldY * this.scale;

                this.updateTransform();
            },
            { passive: false }
        );

        workplace.addEventListener("mousedown", (e) => {
            if (e.target.tagName === "polygon") {
                this.movePolygon(e);
            } else {
                this.isDragging = true;
                [this.startX, this.startY] = [e.clientX, e.clientY];
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.isDragging) return;
            this.offsetX += e.clientX - this.startX;
            this.offsetY += e.clientY - this.startY;
            [this.startX, this.startY] = [e.clientX, e.clientY];
            this.updateTransform();
        });

        window.addEventListener("mouseup", () => (this.isDragging = false));
        window.addEventListener("resize", () => this.updateTransform());
    }

    createSVGElement(tag, attrs = {}) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    updateTransform() {
        this.querySelector("#workplace-content").setAttribute("transform", `translate(${this.offsetX},${this.offsetY}) scale(${this.scale})`);

        this.updateGrid();
        this.updateRulers();
    }

    updateGrid() {
        const gridPattern = this.querySelector("#grid");
        if (!gridPattern) return;

        var scaledGridSize = this.gridSize * this.scale;
        scaledGridSize *= this.scale >= 0.5 ? 2.5 : 5;
        const offsetX = this.offsetX % scaledGridSize;
        const offsetY = this.offsetY % scaledGridSize;

        gridPattern.setAttribute("width", scaledGridSize);
        gridPattern.setAttribute("height", scaledGridSize);
        gridPattern.setAttribute("x", offsetX);
        gridPattern.setAttribute("y", offsetY);

        const path = gridPattern.querySelector("path");
        path.setAttribute("d", `M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`);
    }

    updateRulers() {
        const rulerX = this.querySelector(".ruler-x");
        const rulerY = this.querySelector(".ruler-y");

        if (!rulerX || !rulerY) return;

        const workplace = this.querySelector(".workplace");
        const { width, height } = workplace.getBoundingClientRect();

        this.updateRulerX(rulerX, width);
        this.updateRulerY(rulerY, height);
    }

    updateRulerX(ruler, width) {
        const step = this.getOptimalStep();
        const scaledStep = step * this.scale;

        const startWorld = -this.offsetX / this.scale;
        const startStep = Math.floor(startWorld / step) * step;

        ruler.innerHTML = "";

        for (let world = startStep; world * this.scale + this.offsetX < width + scaledStep; world += step) {
            const screenX = world * this.scale + this.offsetX;

            if (screenX >= -scaledStep && screenX <= width + scaledStep) {
                const tick = document.createElement("div");
                tick.className = "ruler-tick ruler-tick-x";
                tick.style.left = `${screenX}px`;

                const label = document.createElement("div");
                label.className = "ruler-label ruler-label-x";
                label.style.left = `${screenX}px`;
                label.textContent = Math.round(world);

                ruler.appendChild(tick);
                ruler.appendChild(label);
            }
        }
    }

    updateRulerY(ruler, height) {
        const step = this.getOptimalStep();
        const scaledStep = step * this.scale;

        const startWorld = -this.offsetY / this.scale;
        const startStep = Math.floor(startWorld / step) * step;

        ruler.innerHTML = "";

        for (let world = startStep; world * this.scale + this.offsetY < height + scaledStep; world += step) {
            const screenY = world * this.scale + this.offsetY;

            if (screenY >= -scaledStep && screenY <= height + scaledStep) {
                const tick = document.createElement("div");
                tick.className = "ruler-tick ruler-tick-y";
                tick.style.top = `${screenY}px`;

                const label = document.createElement("div");
                label.className = "ruler-label ruler-label-y";
                label.style.top = `${screenY}px`;
                label.textContent = Math.round(world);

                ruler.appendChild(tick);
                ruler.appendChild(label);
            }
        }
    }

    getOptimalStep() {
        const baseStep = 50;
        const scaledStep = baseStep * this.scale;

        if (scaledStep > 50) return baseStep;
        if (scaledStep > 25) return baseStep * 2;
        if (scaledStep > 10) return baseStep * 4;
        return baseStep * 8;
    }

    movePolygon(e) {
        const target = e.target;
        const workplace = this.querySelector(".workplace");
        const wrapper = workplace.getBoundingClientRect();
        const [startX, startY] = [e.clientX, e.clientY];
        var dx, dy;

        const transform = target.getAttribute("transform") || "";
        let [offsetX, offsetY] = this.getTranslateValue(transform)

        const onMouseMove = (e) => {
            dx = offsetX + (e.clientX - startX) / this.scale;
            dy = e.clientY < wrapper.y ? dy : offsetY + (e.clientY - startY) / this.scale;
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
