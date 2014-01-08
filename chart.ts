///<reference path="d3.d.ts" />

interface ITimeseriesDatum {
    x: any;
    y: number;
}

interface IWeatherDatum {
    avg: number; // Average temperature on date
    avgh: number;
    avgl: number;
    hi: number;
    hih: number;
    hil: number;
    lo: number;
    loh: number;
    lol: number;
    precip: number;
    day: number;
    date: Date;
}

class Chart {
    public static margin = { top: 20, right: 20, bottom: 30, left: 60 };
    private static attributes = ["avg", "avgh", "avgl", "hi", "hih", "hil", "lo", "loh", "lol", "precip", "day"]
    private static parseDate = d3.time.format("%Y-%m-%d").parse;

    public div: D3.Selection;
    public svg: D3.Selection;
    public xScale: D3.Scale.TimeScale;
    public yScale: D3.Scale.LinearScale;
    public xAxis: D3.Svg.Axis;
    public yAxis: D3.Svg.Axis;
    public xAxisEl: D3.Selection;
    public yAxisEl: D3.Selection;
    public avgEl: D3.Selection;
    public hiEl: D3.Selection;
    public loEl: D3.Selection;
    public plot: D3.Selection;
    public lines: D3.Svg.Line[];
    public data: IWeatherDatum[];

    public static processCSVData(indata: any) {
        indata.forEach((d: any) => {
            var dt = d; // TIL function arguments arent accessible from an inner-scope closure
            Chart.attributes.forEach((a: string) => {
                dt[a] = +dt[a];
            });
            d.date = Chart.parseDate(d.date);
        });
        return <IWeatherDatum[]> indata;
    }

    constructor(container: D3.Selection, url: string, public height: number, public width: number) {
        this.setupD3Objects();
        this.setupDOM(container);
        d3.csv(url, (error, data) => {
            this.data = Chart.processCSVData(data);
            this.initialRender(container);
        });
    }

    private setupD3Objects() {
        this.xScale = d3.time.scale().range([0, this.width]);
        this.yScale = d3.scale.linear().range([0, this.height]);

        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
        var avgLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScale(d.date))
            .y((d: IWeatherDatum) => this.yScale(d.avg));
        var highLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScale(d.date))
            .y((d: IWeatherDatum) => this.yScale(d.hi));
        var lowLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScale(d.date))
            .y((d: IWeatherDatum) => this.yScale(d.lo));
        this.lines = [avgLine, highLine, lowLine];
    }

    private setupDOM(container: D3.Selection) {
        this.div = container.append("div")
            .attr("height", this.height)
            .attr("width",  this.width);
        this.svg = this.div.append("svg")
            .attr("height", this.height)
            .attr("width",  this.width);
        this.height -= Chart.margin.top  + Chart.margin.bottom;
        this.width  -= Chart.margin.left + Chart.margin.right;

        this.xAxisEl = this.svg.append("g")
            .classed("axis", true)
            .classed("x-axis", true)
            .attr("transform", "translate(0," + this.height + ")");

        this.yAxisEl = this.svg.append("g")
            .classed("axis", true)
            .classed("y-axis", true)
            .attr("transform", "translate(25)");

        this.plot = this.svg.append("g").attr("transform", "translate(" + Chart.margin.left + ",0)");

        this.avgEl = this.plot.append("path").classed("avg", true);
        this.hiEl = this.plot.append("path").classed("hi", true);
        this.loEl = this.plot.append("path").classed("lo", true);
    }

    private initialRender(container) {
        var dateDomain = d3.extent(this.data, function(d) { return d.date; });
        var rangeDomain = [100, 0];
        this.xScale.domain(dateDomain);
        this.xScale.domain(dateDomain);
        this.yScale.domain(rangeDomain);
        this.yScale.domain(rangeDomain);
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);

        this.avgEl.datum(this.data)
            .classed("line", true)
            .attr("d", this.lines[0]);
        this.hiEl.datum(this.data)
            .classed("line", true)
            .attr("d", this.lines[1]);
        this.loEl.datum(this.data)
            .classed("line", true)
            .attr("d", this.lines[2]);

        var zoom = d3.behavior.zoom();
        zoom.x(this.xScale);
        zoom.y(this.yScale);
        zoom(this.div);
        zoom.on("zoom", () => this.rerender());
        // zoom.zoom(this.plot);
        (<any> window).zoom = zoom;
    }

    private rerender() {
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);
        this.avgEl.attr("d", this.lines[0]);
        this.hiEl .attr("d", this.lines[1]);
        this.loEl .attr("d", this.lines[2]);
    }
}

class ChartGen {
    public charts: Chart[];
    constructor(public numCharts: number) {
        this.charts = [];
        d3.json("Data/cityNames.json", (error, data) => {
            this.makeCharts(this.numCharts, d3.values(data));
        });
    }

    public makeCharts(numCharts: number, fileNames: string[]) {
        var containerSelection = d3.select("body");
        var chartsToSide = Math.ceil(Math.sqrt(this.numCharts));
        var width  = window.innerWidth  / chartsToSide - 30;
        var height = window.innerHeight / chartsToSide - 10;
        fileNames = fileNames.slice(0, numCharts);
        fileNames.forEach((fileName: string) => {
            fileName = "Data/" + fileName;
            this.charts.push(new Chart(containerSelection, fileName, height, width));
        });
    }
}

new ChartGen(9);
