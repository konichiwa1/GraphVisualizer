const width = window.innerWidth - 20;
const height = window.innerHeight - 100;

const svgRef = d3.select('#d3frame')
    .append('svg')
    .attr('width', width)
    .attr('height', height);


class Node {
    constructor(cx, cy, radius, label) {
        this.cx = cx;
        this.cy = cy;
        this.radius = radius;
        this.label = label;
    }

    draw(svg) {
        svg.append('circle')
            .attr('cx', this.cx) // X coordinate of the center
            .attr('cy', this.cy) // Y coordinate of the center
            .attr('r', this.radius) // Radius of the circle
            .attr('fill', 'grey') // Fill color
            .attr('stroke', 'black') // Stroke color
            .attr('stroke-width', 1); // Stroke width

        svg.append('text')
            .attr('x', this.cx) // X coordinate of the center
            .attr('y', this.cy) // Y coordinate of the center
            .attr('text-anchor', 'middle') // Center the label horizontally
            .attr('dy', '.40em') // Center the label vertically
            .text(this.label)
            .attr('fill', 'white'); // Label color
    }
}

class DiEdge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    draw(svg) {
        const x1 = this.node1.cx, y1 = this.node1.cy, l1 = this.node1.label;
        const x2 = this.node2.cx, y2 = this.node2.cy, l2 = this.node2.label;
        let r = this.node1.radius;
        if (x1 > x2) r = -1 * r;
        const angle = Math.atan((y1 - y2) / (x1 - x2));

        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead' + l1 + '-' + l2)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'black');

        svg.append('line')
            .attr('x1', x1 + r * Math.cos(angle)) // X coordinate of the starting point
            .attr('y1', y1 + r * Math.sin(angle)) // Y coordinate of the starting point
            .attr('x2', x2 - r * Math.cos(angle)) // X coordinate of the ending point
            .attr('y2', y2 - r * Math.sin(angle)) // Y coordinate of the ending point
            .attr('stroke', 'black') // Line color
            .attr('stroke-width', 2) // Line width
            .attr('marker-end', 'url(#' + 'arrowhead' + l1 + '-' + l2 + ')'); // Attach the arrowhead marker
    }
}

class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    draw(svg) {
        const x1 = this.node1.cx, y1 = this.node1.cy, l1 = this.node1.label;
        const x2 = this.node2.cx, y2 = this.node2.cy, l2 = this.node2.label;
        let r = this.node1.radius;
        if (x1 >= x2) r = -1 * r;
        const angle = Math.atan((y1 - y2) / (x1 - x2));

        svg.append('line')
            .attr('x1', x1 + r * Math.cos(angle)) // X coordinate of the starting point
            .attr('y1', y1 + r * Math.sin(angle)) // Y coordinate of the starting point
            .attr('x2', x2 - r * Math.cos(angle)) // X coordinate of the ending point
            .attr('y2', y2 - r * Math.sin(angle)) // Y coordinate of the ending point
            .attr('stroke', 'black') // Line color
            .attr('stroke-width', 2) // Line width
    }
}

class Graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    draw(svg) {
        let totalNodes = this.nodes.length;
        let baseAngle = 2 * Math.PI / totalNodes;
        let baseX = width / 2, baseY = height / 2;
        let baseR = 300;
        let pAngle = 0;
        this.nodes.map((node, idx) => {
            node.cx = baseX - baseR * Math.cos(pAngle);
            node.cy = baseY - baseR * Math.sin(pAngle);
            node.draw(svg);
            pAngle += baseAngle;
        })

        this.edges.map((edge, idx) => {
            edge.draw(svg);
        })
    }

}

let nodes = [];
const n = 5;
for (let i = 0; i < n; i++) {
    nodes.push(new Node(100, 100, 15, `${i}`));
}

let edges = [];
for(let i=0; i<n; i++) {
    for(let j=i+1; j<n; j++) {
        edges.push(new Edge(nodes[i], nodes[j]));
    }
}

let grp = new Graph(nodes, edges);
grp.draw(svgRef);