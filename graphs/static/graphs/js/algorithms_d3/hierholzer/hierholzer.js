let mode = "auto";

function renderAdjMatrix(matrix, nodes) {

    let html = `<table class="matrix-table">`;

    html += `<tr><th class="top-left"></th>`;
    nodes.forEach(n => {
        html += `<th class="matrix-header">${n}</th>`;
    });
    html += `</tr>`;

    matrix.forEach((row, i) => {
        html += `<tr>`;

        html += `<th class="matrix-row-header">${nodes[i]}</th>`;

        row.forEach(val => {
            html += `<td>${val}</td>`;
        });

        html += `</tr>`;
    });

    html += `</table>`;
    return html;
}



function renderAdjList(adjList) {
    let html = `
        <table style="
            width:100%;
            border-collapse:collapse;
            font-size:15px;
            margin-top:5px;
            text-align:left;
        ">
            <tr>
                <th style="border:1px solid #888; padding:6px; background:#1d2b57; width:30%;">Đỉnh</th>
                <th style="border:1px solid #888; padding:6px; background:#1d2b57;">Đỉnh kề</th>
            </tr>
    `;

    Object.keys(adjList).forEach(node => {
        const neighbors = adjList[node].join(", ");
        html += `
            <tr>
                <td style="border:1px solid #888; padding:6px;">${node}</td>
                <td style="border:1px solid #888; padding:6px;">${neighbors}</td>
            </tr>
        `;
    });

    html += `</table>`;
    return html;
}

function setMode(m) {
    mode = m;
}

function runHierholzerFinal() {
    const nodes = document.getElementById("nodes").value.split(",");
    const startNode = document.getElementById("startNode").value.trim();

    fetch("/api/graph/hierholzer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nodes: nodes,
            edges: document.getElementById("edges").value.split(","),
            startNode: startNode || null,
            mode: selectedMode
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        drawGraph(data.nodes, data.edges, data.result);
        animateHierholzer(data.result);

        updateInfo({
            mode: selectedMode,
            ...data.analysis,
            hierholzer_path: data.result.path,
            hierholzer_steps: data.result.steps,
            is_eulerian_path: checkEulerPath(data.analysis),
            is_eulerian_circuit: checkEulerCircuit(data.analysis)
        });
    })
    .catch(err => console.error(err));
}


function drawGraph(nodes, edges, resultPath) {
    const svg = d3.select("#graphArea");
    svg.selectAll("*").remove();

    const svgElement = document.getElementById("graphArea");
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;

    edges = edges.map(e => {
        if (typeof e === "string" && e.includes("-")) {
            const [s, t] = e.split("-");
            return { source: s.trim(), target: t.trim() };
        }
        return e;
    });

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id).distance(180))
        .force("charge", d3.forceManyBody().strength(-450))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.08))
        .force("y", d3.forceY(height / 2).strength(0.08));


    const link = svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter().append("line")
        .attr("stroke", "#00ff88")
        .attr("stroke-width", 4)


    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 22)
        .attr("class", "node")
        .attr("fill", "#ffcc00");

    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("fill", "#ffffff")
        .attr("font-size", "20px")
        .attr("dy", 5)
        .attr("text-anchor", "middle");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}


function updateInfo(info) {
    const box = document.getElementById("infoContent");

    let adjRows = "";
    for (const [node, neighbors] of Object.entries(info.adj_list)) {
        adjRows += `
            <tr>
                <td>${node}</td>
                <td>${neighbors.join(", ")}</td>
            </tr>
        `;
    }

    let adjListTable = `
        <table border="1" cellspacing="0" cellpadding="6" style="width:100%; color:white; border-collapse: collapse;">
            <tr style="background:#1a237e;">
                <th>Đỉnh</th>
                <th>Đỉnh kề</th>
            </tr>
            ${adjRows}
        </table>
    `;

    const nodes = Object.keys(info.adj_list);
    let headerRow = `<tr><th></th>${nodes.map(n => `<th>${n}</th>`).join("")}</tr>`;
    let matrixRows = "";

    nodes.forEach((rowNode, i) => {
        matrixRows += `<tr><th>${rowNode}</th>` +
            info.adj_matrix[i].map(v => `<td>${v}</td>`).join("") +
            `</tr>`;
    });

    let matrixTable = `
        <table border="1" cellspacing="0" cellpadding="6" style="width:100%; color:white; border-collapse: collapse;">
            ${headerRow}
            ${matrixRows}
        </table>
    `;

    box.innerHTML = `
        <p><b>Mode:</b> ${info.mode.toUpperCase()}</p>

        <p><b>Số đỉnh:</b> ${info.num_nodes}</p>
        <p><b>Số cạnh:</b> ${info.num_edges}</p>

        <hr>

        <p><b>Bậc từng đỉnh:</b></p>
        <pre>${JSON.stringify(info.degree, null, 2)}</pre>

        <p><b>Danh sách kề:</b></p>
        ${adjListTable}

        <p><b>Ma trận kề:</b></p>
        ${matrixTable}

        <hr>

        <p><b>Chu trình Hierholzer:</b></p>
        <pre>${JSON.stringify(info.hierholzer_path, null, 2)}</pre>

        <p><b>Các bước thuật toán:</b></p>
        <pre>${JSON.stringify(info.hierholzer_steps, null, 2)}</pre>

        <hr>

        <p><b>✔ Có đường đi Euler?</b> 
            <span style="color:${info.is_eulerian_path ? 'lightgreen' : 'red'};">
                ${info.is_eulerian_path}
            </span>
        </p>

        <p><b>✔ Có chu trình Euler?</b> 
            <span style="color:${info.is_eulerian_circuit ? 'lightgreen' : 'red'};">
                ${info.is_eulerian_circuit}
            </span>
        </p>
    `;
}


function animateHierholzer(steps) {
    const svg = d3.select("#graphArea");
    const nodes = svg.selectAll("circle");
    const edges = svg.selectAll("line");

    let i = 0;

    function stepAnim() {
        const s = steps[i];
        if (!s) return;

        nodes.attr("fill", d =>
            d.id === s.current ? "#f7d206" : "#ffcc00"
        );

        edges.each(function(e) {
            const link = d3.select(this);
            const src = typeof e.source === "object" ? e.source.id : e.source;
            const tgt = typeof e.target === "object" ? e.target.id : e.target;

            const match =
                s.used_edge &&
                ((s.used_edge[0] === src && s.used_edge[1] === tgt) ||
                 (s.used_edge[1] === src && s.used_edge[0] === tgt));

            link
                .attr("stroke", match ? "#ff3d00" : "#777")
                .attr("stroke-width", match ? 8 : 3)
                .style("filter", match ? "drop-shadow(0 0 10px #ff3d00)" : "none");
        });

        i++;
        if (i < steps.length) {
            setTimeout(stepAnim, 900);
        } else {
            edges.transition().duration(700)
                .attr("stroke", "#ffcc00")
                .attr("stroke-width", 4)
                .style("filter", "none");

            nodes.transition().duration(600)
                .attr("fill", "#ffcc00");
        }
    }

    stepAnim();
}
