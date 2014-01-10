
var Chart = (function () {
    function Chart(container, url, height, width) {
        var _this = this;
        this.height = height;
        this.width = width;
        this.setupD3Objects();
        this.setupDOM(container);
        d3.csv(url, function (error, data) {
            _this.data = Chart.processCSVData(data);
            _this.initialRender(container);
        });
    }
    Chart.processCSVData = function (indata) {
        indata.forEach(function (d) {
            var dt = d;
            Chart.attributes.forEach(function (a) {
                dt[a] = +dt[a];
            });
            d.date = Chart.parseDate(d.date);
        });
        return indata;
    };

    Chart.prototype.setupD3Objects = function () {
        var _this = this;
        this.xScale = d3.time.scale().range([0, this.width]);
        this.yScale = d3.scale.linear().range([0, this.height]);

        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
        var avgLine = d3.svg.line().x(function (d) {
            return _this.xScale(d.date);
        }).y(function (d) {
            return _this.yScale(d.avg);
        });
        var highLine = d3.svg.line().x(function (d) {
            return _this.xScale(d.date);
        }).y(function (d) {
            return _this.yScale(d.hi);
        });
        var lowLine = d3.svg.line().x(function (d) {
            return _this.xScale(d.date);
        }).y(function (d) {
            return _this.yScale(d.lo);
        });
        this.lines = [avgLine, highLine, lowLine];
    };

    Chart.prototype.setupDOM = function (container) {
        this.div = container.append("div").attr("height", this.height).attr("width", this.width);
        this.svg = this.div.append("svg").attr("height", this.height).attr("width", this.width);
        this.height -= Chart.margin.top + Chart.margin.bottom;
        this.width -= Chart.margin.left + Chart.margin.right;

        this.xAxisEl = this.svg.append("g").classed("axis", true).classed("x-axis", true).attr("transform", "translate(0," + this.height + ")");

        this.yAxisEl = this.svg.append("g").classed("axis", true).classed("y-axis", true).attr("transform", "translate(25)");

        this.plot = this.svg.append("g").attr("transform", "translate(" + Chart.margin.left + ",0)");

        this.avgEl = this.plot.append("path").classed("avg", true);
        this.hiEl = this.plot.append("path").classed("hi", true);
        this.loEl = this.plot.append("path").classed("lo", true);
    };

    Chart.prototype.initialRender = function (container) {
        var _this = this;
        var dateDomain = d3.extent(this.data, function (d) {
            return d.date;
        });
        var rangeDomain = [100, 0];
        this.xScale.domain(dateDomain);
        this.xScale.domain(dateDomain);
        this.yScale.domain(rangeDomain);
        this.yScale.domain(rangeDomain);
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);

        this.avgEl.datum(this.data).classed("line", true).attr("d", this.lines[0]);
        this.hiEl.datum(this.data).classed("line", true).attr("d", this.lines[1]);
        this.loEl.datum(this.data).classed("line", true).attr("d", this.lines[2]);

        var zoom = d3.behavior.zoom();
        zoom.x(this.xScale);
        zoom.y(this.yScale);
        zoom(this.div);
        zoom.on("zoom", function () {
            return _this.rerender();
        });

        window.zoom = zoom;
    };

    Chart.prototype.rerender = function () {
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);
        this.avgEl.attr("d", this.lines[0]);
        this.hiEl.attr("d", this.lines[1]);
        this.loEl.attr("d", this.lines[2]);
    };
    Chart.margin = { top: 20, right: 20, bottom: 30, left: 60 };
    Chart.attributes = ["avg", "avgh", "avgl", "hi", "hih", "hil", "lo", "loh", "lol", "precip", "day"];
    Chart.parseDate = d3.time.format("%Y-%m-%d").parse;
    return Chart;
})();

var ChartGen = (function () {
    function ChartGen(numCharts) {
        var _this = this;
        this.numCharts = numCharts;
        this.charts = [];
        d3.json("Data/cityNames.json", function (error, data) {
            _this.makeCharts(_this.numCharts, d3.values(data));
        });
    }
    ChartGen.prototype.makeCharts = function (numCharts, fileNames) {
        var _this = this;
        var containerSelection = d3.select("body");
        var chartsToSide = Math.ceil(Math.sqrt(this.numCharts));
        var width = window.innerWidth / chartsToSide - 30;
        var height = window.innerHeight / chartsToSide - 10;
        fileNames = fileNames.slice(0, numCharts);
        fileNames.forEach(function (fileName) {
            fileName = "Data/" + fileName;
            _this.charts.push(new Chart(containerSelection, fileName, height, width));
        });
    };
    return ChartGen;
})();

new ChartGen(9);
