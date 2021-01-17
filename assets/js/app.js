// Set chart area
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
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
function axisScale(data, chosenAxis) {

    var linearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenAxis]) * 0.8,
            d3.max(data, d => d[chosenAxis]) * 1.2
        ]);

    return linearScale;
}

// Set transition for changing x-axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return [xAxis, yAxis];
}

// Set circle transition
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Call tooltips to display data when cursor hovers over points
function updateToolTip(chosenXAxis, circlesGroup) {

    var xLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "In Poverty (%):";
    } else if (chosenXAxis === "age") {
        xLabel = "Median Age:";
    } else if (chosenXAxis === "income") {
        xLabel = "Median Household Income:"
    }

    var yLabel;

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacking Healthcare (%):";
    } else if (chosenYAxis === "obesity") {
        yLabel = "Obesity (%):";
    } else if (chosenYAxis === "smokes") {
        yLabel = "Smokers (%):";
    }

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
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Call xScale function
    var xLinearScale = axisScale(censusData, chosenXAxis)
        .range([0, width]);

    // Create y-scale function
    var yLinearScale = axisScale(censusData, chosenYAxis)
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y-axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("class", "stateCircle");

    // var statesGroup = chartGroup.selectAll("div")
    //     .data(censusData)
    //     .enter()
    //     .append("div")
    //     .attr("x", d => xLinearScale(d[chosenXAxis]))
    //     .attr("y", d => yLinearScale(d[chosenYAxis]))
    //     .attr("class", "stateText")
    //     .text(d => d.abbr);


    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Append poverty label
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    // Append age label
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age");

    // Append income label
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Median Household Income ($)");


    // Append y-axis label
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacking Healthcare (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Population Obesity (%)");

    var smokersLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokers (%)");

    // Call updateTooltip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // Update data if x-axis label clicked
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;

                xLinearScale = axisScale(censusData, chosenXAxis)
                    .range([0, width]);

                xAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis)[0];
                yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis)[1];

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // Change class based on active x-axis
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);

                } else if (chosenXAxis === "poverty") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);

                } else if (chosenXAxis === "income") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })

    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;

                yLinearScale = axisScale(censusData, chosenYAxis)
                    .range([height, 0]);

                xAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis)[0];
                yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis)[1];

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // Change class based on active y-axis
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokersLabel
                        .classed("active", false)
                        .classed("inactive", true);

                } else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokersLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    
                } else if (chosenYAxis === "healthcare") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokersLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        })

}).catch(function(error) {
    console.log(error);
});
