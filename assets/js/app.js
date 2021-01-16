var svgWidth = 1000;
var svgHeight = 600;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transfomr", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";

function xScale(statesData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(statesData, d => d[chosenXAxis]),
            d3.max(statesData, d => d[chosenXAxis])
        ])
        .range([0, width]);

        return xLinearScale;
}

function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

d3.csv("assets/data/data.csv").then(function(statesData, err) {
    if(err) throw err;
    console.log(statesData);
})