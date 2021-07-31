import * as d3 from "d3";

import { deleteEdge } from "../../controller/edgeController";
import drawObject from "../drawObject";
import { printResult } from "../printResult";


function edgeMouseOver(){
    d3.select(this).attr("stroke","tomato").style("marker-end","url(#endDelete)")
    d3.selectAll(".node").raise();
}

function edgeMouseOut(){
    d3.select(this).attr("stroke","gray").style("marker-end","url(#end)")
    d3.selectAll(".node").raise();
}

function edgeClicked(){
    const edge = d3.select(this);
    const edgeClassName = edge.attr('class');
    deleteEdge(edgeClassName);
    drawObject();
    edge.remove();
    printResult();
}

export {edgeMouseOver, edgeMouseOut, edgeClicked}