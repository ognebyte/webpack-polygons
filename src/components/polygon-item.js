class PolygonItem extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        const { points, bbox } = this.generatePolygon();

        const polygonId = `polygon-${crypto.randomUUID()}`; // генерируем уникальный id
        this.id = polygonId;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", bbox.width + 10);
        svg.setAttribute("height", bbox.height + 10);
        svg.setAttribute("viewBox", `${bbox.minX - 5} ${bbox.minY - 5} ${bbox.width + 10} ${bbox.height + 10}`);

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
        polygon.setAttribute("fill", randomColor());
        polygon.setAttribute("stroke", "currentColor");
        polygon.setAttribute("stroke-width", "2");

        svg.appendChild(polygon);
        this.appendChild(svg);

        this.draggable = true;
        this.classList.add('draggable');
        this.addEventListener("dragstart", this.onDragStart);
    }

    generatePolygon() {
        const vertexCount = getRandomInt(4, 8);
        const radius = getRandomInt(40, 80);
        const cx = 0;
        const cy = 0;
        const points = [];

        for (let i = 0; i < vertexCount; i++) {
            const angle = ((Math.PI * 2) / vertexCount) * i + Math.random() * 0.5;
            const r = radius * (0.2 + Math.random());
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points.push({ x, y });
        }

        const bbox = this.getBoundingBox(points);

        return { points, bbox };
    }

    getBoundingBox(points) {
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        return {
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    onDragStart(e) {
        e.dataTransfer.setData("text/plain", this.id);
    }
}

if (!customElements.get("polygon-item")) {
    customElements.define("polygon-item", PolygonItem);
}
