require(["d3"], init);


var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var rows = 4;

var cols = 4;

function trans(x, y) {
    return "translate("+ x + "," + y + ")";
}

var all_data 

function init(d3) {
    var xScale = d3.scale.linear()
        .domain([0, cols])
        .range([0, width]);
    
    var yScale = d3.scale.linear()
        .domain([0, rows])
        .range([0, height]);
    var xMapScale, yMapScale;
   

    var svg = d3.select("body").style("text-align", "center").insert("svg", ":first-child")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    d3.select("body").insert("h1", ":first-child").text("Make Boston Square Again");

    
    function draw_selected(d) {
        make_picture(d);
        d.x = cols  / 2;
        d.y = 0;
        map = d3.map(all_data, function(d) { return d.name; });
        data = [d]
        if (d.connectup) {
            var d2 = map.get(d.connectup);
            d2.x = cols;
            d2.y = 0;
            data.push(d2)
        }
        if (d.connectdown) {
            var d2 = map.get(d.connectdown);
            d2.x = 0;
            d2.y = 0;
            data.push(d2);
        }
        if (d.biketo) {
            var d2 = map.get(d.biketo);
            d2.x = cols;
            d2.y = 1;
            data.push(d2)
        }
        if (d.bikefrom) {
            var d2 = map.get(d.bikefrom);
            d2.x = 0;
            d2.y = 1;
            data.push(d2);
        }
        
        draw_grid(data, make_connections([d]), (width / cols)/1.5);
    }

    function make_grid(data) {
        for (i = 0; i < data.length; i++) {
            data[i].x = i % cols;
            data[i].y = Math.floor(i / rows);
        }
    }

    function make_map(data) {
        for (i = 0; i < data.length; i++) {
            data[i].x = xMapScale(data[i].ll[0]);
            data[i].y = yMapScale(data[i].ll[1]);
        }
    }

    function make_connections(data) {
        map = d3.map(all_data, function(d) { return d.name; });
        connections = []
        for (i = 0; i < data.length; i++) {
            var d = data[i]
            if (d.connectup) {
                var d2 = map.get(d.connectup);
                connections.push({type: "subway", from: d, to: d2});
            }
            if (d.connectdown) {
                var d2 = map.get(d.connectdown);
                connections.push({type: "subway", from: d, to: d2});
            }
            if (d.biketo) {
                var d2 = map.get(d.biketo);
                connections.push({type: "bike", from: d, to: d2});
            }
            if (d.bikefrom) {
                var d2 = map.get(d.bikefrom);
                connections.push({type: "bike", from: d, to: d2});
            }
        }
        return connections;
    }

    function make_picture(d) {

        var panorama;
        
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('street-view'),
            {
                position: {lat: d.ll[0], lng: d.ll[1]},
                pov: {heading: 165, pitch: 0},
                zoom: 1
            });
    }
    
    function draw_grid(data, connections, box_size) {
        
        var t = d3.transition()
            .duration(750);        
        
        var lines = svg.selectAll("line")
            .data(connections, function(d) { return d.from.name + " " + d.to.name;} );


        console.log(lines);
        lines.transition()
            .duration(600)
            .attr("x1", function(d) { return xScale(d.from.x); } )
            .attr("y1", function(d) { return yScale(d.from.y); } )
            .attr("x2", function(d) { return xScale(d.to.x) ; } )
            .attr("y2", function(d) { return yScale(d.to.y) ; } );

        lines.enter().insert("line",":first-child")
            .attr("class", function(d) {
                return "connect " + d.type;})            
            .style("opacity", 0)
            .transition()
            .duration(100)
            .style("opacity", 1)
            .attr("x1", function(d) { return xScale(d.from.x); } )
            .attr("y1", function(d) { return yScale(d.from.y); } )
            .attr("x2", function(d) { return xScale(d.from.x) ; } )
            .attr("y2", function(d) { return yScale(d.from.y) ; } )
            .transition()
            .duration(900)            
            .attr("x2", function(d) { return xScale(d.to.x) ; } )
            .attr("y2", function(d) { return yScale(d.to.y) ; } ); 


        
        
        lines.exit().remove();
        
        var g = svg.selectAll("g")
            .data(data, function(data) {return data.name;} );

        function grid(d, i) {
            return trans(xScale(d.x) - box_size/2,
                         yScale(d.y) - box_size/2);
        }

        g.transition()
            .duration(600)
            .attr("transform", grid);
        
        g.enter()
            .append("g")
            .classed("square", true)
            .on("click", function(d) { return draw_selected(d); } )
            .style("opacity", 0)
            .attr("transform", grid)
            .transition()
            .duration(750)
            .style("opacity", 1);


        g.exit().remove();
        draw_box(g, box_size);
    }


    function draw_box(g, box_size) {
        var pad = 10;
        g.append("rect")
            .attr("x", pad)
            .attr("y", pad)
            .style("stroke", function(d) {
                if (d.subway == "red") {
                    return "red";
                } else {
                    return "black";
                }
            })
            .transition()
            .duration(600)
            .attr("height", box_size - 2*pad)
            .attr("width", box_size- 2*pad)
          
        g.append("text")
            .attr("x", box_size/2)
            .attr("y", box_size/2)
            .text(function(d) {return d.name;} );
    }
    

    
    d3.json("data.json", function(error, data) {
        console.log(error);
        all_data = data

        xMapScale = d3.scale.linear()
            .domain(d3.extent(data, function(d) {return d.ll[0];}))
            .range([0, cols]);
    
        yMapScale = d3.scale.linear()
            .domain(d3.extent(data, function(d) {return d.ll[1];}))
            .range([0, rows]);

        // make_grid(all_data);
        make_map(all_data);
        draw_grid(all_data, make_connections(all_data), (width / cols)/2);
    });
}
