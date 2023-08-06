const width = window.innerWidth - 30;
const height = window.innerHeight - 200;

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
        this.circle = svg.append('circle')
            .attr('cx', this.cx) // X coordinate of the center
            .attr('cy', this.cy) // Y coordinate of the center
            .attr('r', this.radius) // Radius of the circle
            .attr('fill', 'grey') // Fill color
            .attr('stroke', 'black') // Stroke color
            .attr('stroke-width', 1); // Stroke width

        this.text = svg.append('text')
            .attr('x', this.cx) // X coordinate of the center
            .attr('y', this.cy) // Y coordinate of the center
            .attr('text-anchor', 'middle') // Center the label horizontally
            .attr('dy', '.40em') // Center the label vertically
            .text(this.label)
            .attr('fill', 'white'); // Label color
    }

    visit(delay) {
        setTimeout(() => {
            this.circle
                .attr('fill', 'green');
        }, delay);
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

        let startX = x1 + r * Math.cos(angle);
        let startY = y1 + r * Math.sin(angle);
        let endX = x2 - r * Math.cos(angle);
        let endY = y2 - r * Math.sin(angle);

        this.line = svg.append('line')
            .attr('x1', startX)
            .attr('y1', startY)
            .attr('x2', endX)
            .attr('y2', endY)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
    }

    traverse(delay) {
        setTimeout(() => {
            this.line.transition()
                .attr('stroke', 'red');
        }, delay);
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
        let baseR = 250;
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


let drawBtn = document.getElementById("draw-graph");
drawBtn.addEventListener("click", () => {
    // nodes
    let n = document.getElementById("nodes").value;
    let adj = {};
    let nodes = [];
    for (let i = 0; i < n; i++) {
        adj[i] = [];
        nodes.push(new Node(100, 100, 15, `${i}`));
    }

    // edges
    let edgesInput = document.getElementById("edges").value;
    let edgesLineInput = edgesInput.split('\n');
    let edges = [];
    let nodeToEdgeMap = new Map();
    for (let i = 0; i < edgesLineInput.length; i++) {
        if (edgesLineInput[i].includes("->") === true) {
            let edge = edgesLineInput[i].split("->");
            edges.push(new DiEdge(nodes[parseInt(edge[0])], nodes[parseInt(edge[1])]));
            continue;
        }
        let edge = edgesLineInput[i].split(' ');

        adj[parseInt(edge[0])].push(parseInt(edge[1]));
        adj[parseInt(edge[1])].push(parseInt(edge[0]));

        let realEdge = new Edge(nodes[parseInt(edge[0])], nodes[parseInt(edge[1])]);
        edges.push(realEdge);
        nodeToEdgeMap.set('n'+edge[0]+'n'+edge[1], realEdge);
        nodeToEdgeMap.set('n'+edge[1]+'n'+edge[0], realEdge);
    }

    let grp = new Graph(nodes, edges);
    svgRef.selectAll("*").remove();
    grp.draw(svgRef);

    let tm = 0;
    function dfs(u, vis={}, p=-1, tim={}) {
        vis[u] = true;
        
        //render start
        if(p!==-1) {
            tim[u]=tm++;
            nodeToEdgeMap.get('n'+p+'n'+u).traverse(tim[u]*800);
            nodes[u].visit(tim[u]*800);
        } else {
            tim[u]=tm++;
            nodes[u].visit(100);
        }
        //render end

        const neighbours = adj[u];  
        neighbours.forEach(v => {
            if(!vis[v]) {
                dfs(v, vis, u, tim);
            }
        })
    }

    dfs(0);
})