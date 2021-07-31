import * as d3 from "d3";
import { cellSainityCheck } from "../data/dataProcessing";
import getAccuracy from "../service/getAccuracy";



export function printResult(){
    const cellStatus = cellSainityCheck();
    let checker = 0;
    
    if(cellStatus.numEdge > 9){
        d3.select("#analytics").attr("class", "visually-hidden")
        d3.select("#edgeNumberAlert")
            .attr("class", "notcell alert alert-danger")
        checker++;
    }
    if(!cellStatus.isConnected){
        d3.select("#analytics").attr("class", "visually-hidden")
        d3.select("#connectAlert")
            .attr("class", "notcell alert alert-warning")
        checker++;
    }
    if(cellStatus.extraneous.length > 0){
        d3.select("#analytics").attr("class", "visually-hidden")
        d3.select("#extraneousAlert")
            .attr("class", "notcell alert alert-warning")
        checker++;
    }
    if(!checker){
        d3.selectAll(".notcell")
            .attr("class", "visually-hidden")
        getAccuracy(cellStatus.matrix);
    }

}
