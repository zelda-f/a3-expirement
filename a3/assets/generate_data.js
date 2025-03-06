
// Generate the random data
function generateData() {
  var data = [];
  for (var i = 0; i < 5; i++) {
    var x = Math.random() * 3;
    x = x.toFixed(2);
    data.push(x);
  }
  return data;
}

function generateDataSet() {
  var dataSet = [];
  for (var i = 0; i < 5; i++) {
    dataSet.push(generateData());
  }
  return dataSet;
}

// Make svg
function makeSvg() {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", 700)
    .attr("height", 500);
  return svg;
}

// make box plots
function generateBoxPlot() {
  var dataSet = generateDataSet();
  // TODO: make a d3 box plot
  svg = makeSvg();
    for (var i = 0; i < dataSet.length; i++) {
        svg.append("g")
        .selectAll("rect")
        .data(dataSet[i])
        .enter()
        .append("rect")
        .attr("x", function(d) { return d.x * 10; })
        .attr("y", i * 100 + 50)
        .attr("width", 10)
        .attr("height", 10);
    }


}


// make scatter plots
function generateScatterPlot() {
  var dataSet = generateDataSet();
  svg = makeSvg();
  for (var i = 0; i < dataSet.length; i++) {
    svg.append("g")
      .selectAll("dot")
      .data(dataSet[i])
      .enter()
      .append("circle")
      .attr("cy", function(d) { return d.x; })
      .attr("cx", i * 100 + 50)
      .attr("r", 5);
  }
  svg.append('g')
  .attr('transform', `translate(0, 700)`)
  .call(xAxis)
  .attr('class', 'x-axis')
  .attr('stroke', 'black');

}



// make histograms
function generateHistogram() {
  var dataSet = generateDataSet();

  //TODO: this is wrong, fix it
  svg = makeSvg();
  for (var i = 0; i < dataSet.length; i++) {
    svg.append("g")
      .selectAll("rect")
      .data(dataSet[i])
      .enter()
      .append("rect")
      .attr("x", function(d) { return d.x * 10; })
      .attr("y", i * 100 + 50)
      .attr("width", 10)
      .attr("height", 10);
  }


}


