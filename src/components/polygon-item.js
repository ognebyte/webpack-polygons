class PolygonItem extends HTMLElement {
    connectedCallback() {
        const polygon = this.querySelector("polygon");

        if (polygon && !this.querySelector("svg")) {
            this.measurePolygon(polygon).then((bbox) => this.wrapInSvg(polygon, bbox));
        } else if (!polygon) {
            this.render();
        } else {
            this.setup();
        }
    }

    async measurePolygon(polygonElement) {
        const tempSvg = this.createSVGElement("svg", {
            width: "0",
            height: "0",
            style: "position:absolute;opacity:0;pointer-events:none;z-index:-1",
        });

        tempSvg.appendChild(polygonElement.cloneNode(true));
        document.body.appendChild(tempSvg);

        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const bbox = tempSvg.firstChild.getBBox();
                tempSvg.remove();
                resolve(bbox);
            });
        });
    }

    createSVGElement(tag, attrs = {}) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === "style") {
                el.style.cssText = value;
            } else {
                el.setAttribute(key, value);
            }
        });
        return el;
    }

    wrapInSvg(polygon, bbox) {
        const svg = this.createSVGElement("svg", {
            width: bbox.width + 10,
            height: bbox.height + 10,
            viewBox: `${bbox.x - 5} ${bbox.y - 5} ${bbox.width + 10} ${bbox.height + 10}`,
        });

        polygon.remove();
        svg.appendChild(polygon);
        this.appendChild(svg);
        this.setup();
    }

    setup() {
        this.id ||= `polygon-${crypto.randomUUID()}`;
        this.draggable = true;
        this.classList.add("draggable");
        this.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", this.id));
    }

    render() {
        const { points, bbox } = this.generatePolygon();
        this.id = `polygon-${crypto.randomUUID()}`;

        const svg = this.createSVGElement("svg", {
            width: bbox.width + 10,
            height: bbox.height + 10,
            viewBox: `${bbox.minX - 5} ${bbox.minY - 5} ${bbox.width + 10} ${bbox.height + 10}`,
        });

        const polygon = this.createSVGElement("polygon", {
            points: points.map((p) => `${p.x},${p.y}`).join(" "),
            fill: "rgb(145 0 35)",
            stroke: "currentColor",
            "stroke-width": "2",
        });

        svg.appendChild(polygon);
        this.appendChild(svg);
        this.setup();
    }

    generatePolygon() {
        const vertexCount = getRandomInt(3, 10);
        const radius = getRandomInt(40, 80);
        const points = [];

        for (let i = 0; i < vertexCount; i++) {
            const angle = ((Math.PI * 2) / vertexCount) * i + Math.random() * 0.5;
            const r = radius * (0.2 + Math.random());
            points.push({
                x: r * Math.cos(angle),
                y: r * Math.sin(angle),
            });
        }

        return { points, bbox: this.getBoundingBox(points) };
    }

    getBoundingBox(points) {
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
        const [maxX, maxY] = [Math.max(...xs), Math.max(...ys)];

        return {
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
}

if (!customElements.get("polygon-item")) {
    customElements.define("polygon-item", PolygonItem);
}
