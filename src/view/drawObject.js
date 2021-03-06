import * as d3 from "d3";

import { getNodeData, getEdgeData } from "../data/data.js"

import * as nodeInteraction from "./interaction/nodeInteraction.js"
import * as edgeInteraction from "./interaction/edgeInteraction.js"
import { getNextNodeAccuracy } from "../data/recommendNextNode.js";
import { getRecommendEdgeData, getRecommendNodeData } from "../data/recommendCellData.js";
import { colorScheme } from "./designPreference.js";


async function drawNextEdge(clickedNode) {
    let recommendEdgeData = null;
    if (clickedNode == null) {
        recommendEdgeData = [];
    }
    else {
        recommendEdgeData = await getNextNodeAccuracy(clickedNode);
    }
    const recommendEdgeGroup = d3.select("#architecture").selectAll(".recommendLine").data(recommendEdgeData);

    //ENTER
    const recommendEdgeGroupEnter = recommendEdgeGroup.enter().append("g")
        .attr("class", "recommendLine")

    recommendEdgeGroupEnter
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "10,10")
        .attr("d", "M5 40 l215 0")
        .attr("stroke", "gray")
        .style("marker-end", d => {
            if (d.label == 0 || d.source.index == 0 && d.target.index == 1) return "url(#endRecommend)";
            else return null;
        })

    recommendEdgeGroupEnter
        .append("text")
        .text(d => {
            if (d.label == 0) {
                return "";
            }
            else return new String(d.testAccuracy).slice(0, 5);

        })
        .attr("fill", "gray")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("transform", d => "translate(" + [(d.source.x + d.target.x) / 2, (d.source.y + d.target.y) / 2] + ")");


    //EXIT
    recommendEdgeGroup.exit().remove()
}

function drawEdge(target = 0) {
    let edgeData, edgeGroup;
    if (target == 0) {
        edgeData = getEdgeData();
        edgeGroup = d3.select("#architecture").selectAll(".edge").data(edgeData);
    }
    else {
        edgeData = getRecommendEdgeData(target);
        edgeGroup = d3.select("#recommend" + target).selectAll(".edge").data(edgeData);
    }

    //UPDATE
    edgeGroup
        .select("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", (d) => {
            if (d.sharpleyValue == null) {
                return 'black';
            }
            else if (d.sharpleyValue > 0) {
                return colorScheme.positive;
            }
            else if (d.sharpleyValue < 0) {
                return colorScheme.negative;
            }
            else {
                return 'black';
            }
        })
        .style("marker-end", (d) => {
            if (d.sharpleyValue == null) {
                return 'url(#end)'
            }
            else if (d.sharpleyValue > 0) {
                return 'url(#endPositive)'
            }
            else if (d.sharpleyValue < 0) {
                return 'url(#endNegative)';
            }
            else {
                return 'black';
            }
        })
        .attr("opacity", (d) => {
            if (d.isExt) return 0.2;
            else return 1;
        });



    //ENTER
    const edgeGroupEnter = edgeGroup.enter().append("g")
        .attr("class", "edge")


    edgeGroupEnter
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke-width", 4)
        .attr("opacity", (d) => {
            if (d.isExt) return 0.2;
            else return 1;
        })
        .attr("stroke", (d) => {
            if (d.sharpleyValue == null) {
                return 'black';
            }
            else if (d.sharpleyValue > 0) {
                return colorScheme.positive;
            }
            else if (d.sharpleyValue < 0) {
                return colorScheme.negative;
            }
            else {
                return 'black';
            }
        })
        .style("marker-end", (d) => {
            if (d.sharpleyValue == null) {
                return 'url(#end)'
            }
            else if (d.sharpleyValue > 0) {
                return 'url(#endPositive)'
            }
            else if (d.sharpleyValue < 0) {
                return 'url(#endNegative)';
            }
            else {
                return 'black';
            }
        })
        .on("mouseover", edgeInteraction.edgeMouseOver)
        .on("mouseout", edgeInteraction.edgeMouseOut)
        .on("click", edgeInteraction.edgeClicked);


    //EXIT
    edgeGroup.exit().remove()
}


function drawNode(target = 0) {
    let nodeData, nodeGroups;
    if (target == 0) {
        nodeData = getNodeData();
        nodeGroups = d3.select("#architecture").selectAll(".node").data(nodeData);
    }
    else {
        nodeData = getRecommendNodeData(target);
        nodeGroups = d3.select("#recommend" + target).selectAll(".node").data(nodeData);
    }
    const radius = 40;
    //INIT

    //UPDATE
    nodeGroups
        .attr("id", d => "node" + d.index)
        .attr("transform", d => "translate(" + [d.x, d.y] + ")")


    nodeGroups.select("text")
        .text(d => d.name);

    nodeGroups.select("circle")
        .attr("opacity", (d) => {
            if (d.status == 'ext') return 0.4;
            else return 1;
        })
        .attr("fill", (d) => {
            if (d.type == "input" || d.type == "output") {
                return colorScheme.gray;
            }
            else if (d.type == "conv1x1-bn-relu") {
                return colorScheme.conv11;
            }
            else if (d.type == "conv3x3-bn-relu") {
                return colorScheme.conv33;
            }
            else if (d.type == "maxpool3x3") {
                return colorScheme.pool33;
            }
        })
        .style("filter", (d) => {
            if (d.status == null) {
                return null;
            }
            // else if (d.status == 'ext') {
            //     return "url(#drop-shadow-ext)"
            // }
            else if (d.status == 'clicked') {
                return "url(#drop-shadow-start)"
            }
            else {
                return null;
            }
        });

    //ENTER
    const nodeGroupsEnter = nodeGroups.enter().append("g")
        .attr("id", d => "node" + d.index)
        .attr("transform", d => "translate(" + [d.x, d.y] + ")")
        .attr("class", "node")
        .call(
            d3.drag()
                .on("start", nodeInteraction.dragNodeStart)
                .on("drag", nodeInteraction.dragNode)
                .on("end", nodeInteraction.dragNodeEnd)
        )
        .on("click", nodeInteraction.clickedNode);

    nodeGroupsEnter.append("circle")
        .attr("r", radius)
        .attr("opacity", (d) => {
            if (d.status == 'ext') return 0.4;
            else return 1;
        })
        .attr("fill", (d) => {
            if (d.type == "input" || d.type == "output") {
                return colorScheme.gray;
            }
            else if (d.type == "conv1x1-bn-relu") {
                return colorScheme.conv11;
            }
            else if (d.type == "conv3x3-bn-relu") {
                return colorScheme.conv33;
            }
            else if (d.type == "maxpool3x3") {
                return colorScheme.pool33;
            }
        })
        .style("filter", (d) => {
            if (d.status == null) {
                return null;
            }
            // else if (d.status == 'ext') {
            //     return "url(#drop-shadow-ext)"
            // }
            else if (d.status == 'clicked') {
                return "url(#drop-shadow-start)"
            }
            else{
                return null;
            }
        });

    nodeGroupsEnter.append("text")
        .text(d => d.name)
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("font-size", 11);

    //EXIT
    nodeGroups.exit().remove();
}


export default async function drawObject(clickedNode, target = 0) {
    drawNode(target);
    drawEdge(target);
    d3.selectAll(".node").raise();
    await drawNextEdge(clickedNode);
    d3.selectAll(".node").raise();
}

export function drawObjectwithForce(clickedNode, target = 0) {
    calaulateForce(target);
    drawNode(target);
    drawEdge(target);
    d3.selectAll(".node").raise();
}

export function calaulateForce(target) {
    let nodeData, edgeData;

    if (target) {
        nodeData = getRecommendNodeData(target);
        edgeData = getRecommendEdgeData(target);
    }
    else {
        nodeData = getNodeData();
        edgeData = getEdgeData();
    }

    const simulation = d3.forceSimulation(nodeData)
        .force('charge', d3.forceManyBody())
        .force('collison', d3.forceCollide(120))
        .force('link', d3.forceLink(edgeData))
        .force('center', d3.forceCenter(400, 300))
        .stop()
        .tick(10000)

}

