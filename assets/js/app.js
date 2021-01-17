// Set chart area
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Create svg wrapper and append chart group
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Set initial conditions
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Set scale of x-axis
function xScale(censusData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// Call tooltips to display data when cursor hovers over points
function updateToolTip(chosenXAxis, circlesGroup) {

    var xLabel = "In Poverty (%):";
    var yLabel = "Lacking Healthcare (%):";

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>
            ${xLabel} ${d[chosenXAxis]}<br>
            ${yLabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

    return circlesGroup;
}

// Read CSV and load charts
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Call xScale function
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y-scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d[chosenYAxis])])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y-axis
    chartGroup.append("g")
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("class", "stateCircle");

    // Append x-axis label
    chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .classed("aText", true)
        .text("In Poverty (%)");

    // Append y-axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Lacking Healthcare (%)");

    // Call updateTooltip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

}).catch(function(error) {
    console.log(error);
});
