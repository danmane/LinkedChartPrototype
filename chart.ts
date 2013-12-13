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
    public static margin = { top: 20, right: 20, bottom: 30, left: 30 };
    public static width = 300 - Chart.margin.left - Chart.margin.right;
    public static height = 300 - Chart.margin.top - Chart.margin.bottom;
    private static attributes = ["avg", "avgh", "avgl", "hi", "hih", "hil", "lo", "loh", "lol", "precip", "day"]
    private static parseDate = d3.time.format("%Y-%m-%d").parse;

    public svg: D3.Selection;
    public xScalePlot: D3.Scale.TimeScale;
    public yScalePlot: D3.Scale.LinearScale;
    public xScaleAxis: D3.Scale.TimeScale;
    public yScaleAxis: D3.Scale.LinearScale;
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
            this.initialRender();
        });
    }

    private setupD3Objects() {
        this.xScalePlot = d3.time.scale().range([0, Chart.width]);
        this.xScaleAxis = d3.time.scale().range([0, Chart.width]);
        this.yScalePlot = d3.scale.linear().range([0, Chart.height]);
        this.yScaleAxis = d3.scale.linear().range([0, Chart.height]);

        this.xAxis = d3.svg.axis().scale(this.xScaleAxis).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.yScaleAxis).orient("left");
        var avgLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScalePlot(d.date))
            .y((d: IWeatherDatum) => this.yScalePlot(d.avg));
        var highLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScalePlot(d.date))
            .y((d: IWeatherDatum) => this.yScalePlot(d.hi));
        var lowLine = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScalePlot(d.date))
            .y((d: IWeatherDatum) => this.yScalePlot(d.lo));
        this.lines = [avgLine, highLine, lowLine];

    }

    private setupDOM(container: D3.Selection) {
        this.height -= Chart.margin.top  + Chart.margin.bottom;
        this.width  -= Chart.margin.left + Chart.margin.right;
        this.svg = container.append("svg")
            .attr("height", this.height)
            .attr("width",  this.width);

        this.xAxisEl = this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + Chart.height + ")");

        this.yAxisEl = this.svg.append("g")
            .attr("class", "y-axis");

        this.plot = this.svg.append("g");

        this.avgEl = this.plot.append("path").classed("avg", true);
        this.hiEl = this.plot.append("path").classed("hi", true);
        this.loEl = this.plot.append("path").classed("lo", true);
    }

    private initialRender() {
        var dateDomain = d3.extent(this.data, function(d) { return d.date; });
        var rangeDomain = [100, 0];
        this.xScalePlot.domain(dateDomain);
        this.xScaleAxis.domain(dateDomain);
        this.yScalePlot.domain(rangeDomain);
        this.yScaleAxis.domain(rangeDomain);
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);

        this.avgEl.datum(this.data)
            .attr("class", "line")
            .attr("d", this.lines[0]);
        this.hiEl.datum(this.data)
            .attr("class", "line")
            .attr("d", this.lines[1]);
        this.loEl.datum(this.data)
            .attr("class", "line")
            .attr("d", this.lines[2]);

        // var width =

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
        var width  = window.innerWidth  / chartsToSide;
        var height = window.innerHeight / chartsToSide;
        fileNames = fileNames.slice(0, numCharts);
        fileNames.forEach((fileName: string) => {
            fileName = "Data/" + fileName;
            this.charts.push(new Chart(containerSelection, fileName, height, width));
        });
    }
}

new ChartGen(4);
