///<reference path="d3.d.ts" />
///<reference path="FPSMeter.d.ts" />

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


class PerfDiagnostics {
    private static diagnostics: { [measurementName: string]: PerfDiagnostics; } = {};
    private total: number;
    private start: number;

    public static toggle(measurementName: string) {
        if (PerfDiagnostics.diagnostics[measurementName] != null) {
            var diagnostic = PerfDiagnostics.diagnostics[measurementName];
        } else {
            var diagnostic = new PerfDiagnostics();
            PerfDiagnostics.diagnostics[measurementName] = diagnostic;
        }
        diagnostic.toggle();
    }

    private static getTime() {
        if (performance.now) {
            return performance.now();
        } else {
            return Date.now();
        }
    }

    public static logResults() {
        var grandTotal = PerfDiagnostics.diagnostics["total"] ? PerfDiagnostics.diagnostics["total"].total : null;
        var measurementNames: string[] = Object.keys(PerfDiagnostics.diagnostics);
        measurementNames.forEach((measurementName: string) => {
            var result = PerfDiagnostics.diagnostics[measurementName].total;
            console.log(measurementName);
            console.group();
            console.log("Time:", result);
            (grandTotal && measurementName !== "total") ? console.log("%   :", Math.round(result/grandTotal * 10000) / 100) : null;
            console.groupEnd();
        });
        
    }

    constructor() {
        this.total = 0;
        this.start = null;
    }

    public toggle() {
        if (this.start == null) {
            this.start = PerfDiagnostics.getTime();
        } else {
            this.total += PerfDiagnostics.getTime() - this.start;
            this.start = null;
        }
    }
}

(<any> window).report = PerfDiagnostics.logResults;

class Chart {
    public static margin = { top: 20, right: 20, bottom: 30, left: 60 };

    public div: D3.Selection;
    public svg: D3.Selection;
    public xAxis: D3.Svg.Axis;
    public yAxis: D3.Svg.Axis;
    public xAxisEl: D3.Selection;
    public yAxisEl: D3.Selection;
    public avgEl: D3.Selection;
    public hiEl: D3.Selection;
    public loEl: D3.Selection;
    public plot: D3.Selection;
    public lines: D3.Svg.Line[];
    public render: D3.Selection;

    constructor(
        container: D3.Selection,
        public height: number,
        public width: number,
        public xScale: D3.Scale.TimeScale,
        public yScale: D3.Scale.LinearScale,
        public data: IWeatherDatum[]
    ) {
        this.setupD3Objects();
        this.setupDOM(container);
        this.initialRender();
    }

    private setupD3Objects() {
        var formatter = d3.time.format("%b");
        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom").tickFormat(formatter);
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
        this.render = this.plot.append("g").classed("render", true);
        this.avgEl = this.render.append("path").classed("avg", true);
        this.hiEl  = this.render.append("path").classed("hi", true);
        this.loEl  = this.render.append("path").classed("lo", true);
    }

    private initialRender() {
        var dateDomain = d3.extent(this.data, function(d) { return d.date; });
        var rangeDomain = [100, 0];
        this.xScale.domain(dateDomain);
        this.yScale.domain(rangeDomain);

        this.avgEl.datum(this.data)
            .classed("line", true);
        this.hiEl.datum(this.data)
            .classed("line", true);
        this.loEl.datum(this.data)
            .classed("line", true);
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);
        this.avgEl.attr("d", this.lines[0]);
        this.hiEl .attr("d", this.lines[1]);
        this.loEl .attr("d", this.lines[2]);
    }

    public rerender(xTicks: any[], yTicks: any[], translate, scale) {
        PerfDiagnostics.toggle("axis");
        this.xAxisEl.call(this.xAxis.tickValues(xTicks));
        this.yAxisEl.call(this.yAxis.tickValues(yTicks));
        PerfDiagnostics.toggle("axis");
        PerfDiagnostics.toggle("transform");
        this.render.attr("transform", "translate("+translate+") scale("+scale+")");
        PerfDiagnostics.toggle("transform");
    }
}

var readyCallback = (numToTrigger: number, callbackWhenReady: () => any) => {
    var timesCalled = 0;
    return () => {
           timesCalled++;
        if (timesCalled === numToTrigger) {
            callbackWhenReady();
        }
    }
}

class CSVParser {
	private static attributes = ["avg", "avgh", "avgl", "hi", "hih", "hil", "lo", "loh", "lol", "precip", "day"]
	private static parseDate = d3.time.format("%Y-%m-%d").parse;

	public static processCSVData(indata: any) {
	    indata.forEach((d: any) => {
	        var dt = d; // TIL function arguments arent accessible from an inner-scope closure
	        CSVParser.attributes.forEach((a: string) => {
	            dt[a] = +dt[a];
	        });
	        d.date = CSVParser.parseDate(d.date);
	    });
	    return <IWeatherDatum[]> indata;
	}
}

class ChartGen {
    public charts: Chart[];
    private chartsReady: number; //hackhack
    private zoomCoordinator: ZoomCoordinator;


    constructor(public numCharts: number) {
        this.charts = [];
        d3.json("Data/cityNames.json", (error, data) => {
            this.makeCharts(this.numCharts, d3.values(data));
        });
    }

    private setupZoomCoordinator(xScale, yScale) {
        this.zoomCoordinator = new ZoomCoordinator(this.charts, xScale, yScale);
    }
    public makeCharts(numCharts: number, fileNames: string[]) {
        var containerSelection = d3.select("body");
        var chartsToSide = Math.ceil(Math.sqrt(this.numCharts));
        var width  = window.innerWidth  / chartsToSide - 30;
        var height = window.innerHeight / chartsToSide - 10;
        var xScale = d3.time.scale().range([0, width]);
        var yScale = d3.scale.linear().range([0, height]);
        var readyFunction = readyCallback(numCharts, () => this.setupZoomCoordinator(xScale, yScale));
        fileNames = fileNames.slice(0, numCharts);
        fileNames.forEach((fileName: string) => {
            fileName = "Data/" + fileName;
            d3.csv(fileName, (error, data) => {
            	var parsedData = CSVParser.processCSVData(data);        	
	            this.charts.push(new Chart(containerSelection, height, width, xScale, yScale, parsedData));
	            readyFunction();
        	})
        });
    }
}

interface IZoomWithId extends D3.Behavior.Zoom {
    id: number;
}

class ZoomCoordinator {
    public zooms: IZoomWithId[];

    public meter: FPSMeter;

    constructor(public charts: Chart[], public xScale: D3.Scale.TimeScale, public yScale: D3.Scale.LinearScale) {
        this.zooms = charts.map((c, id) => {
            var z = <IZoomWithId> d3.behavior.zoom();
            z.id = id;
            z(c.div);
            z.on("zoom", () => this.synchronize(z));
            z.x(this.xScale);
            z.y(this.yScale);
            return z;
        });
        this.meter = new FPSMeter();
    }

    public synchronize(zoom: IZoomWithId) {
        PerfDiagnostics.toggle("total");
        var translate = zoom.translate();
        var scale = zoom.scale();
        var hasUniqId = (z: IZoomWithId) => z.id != zoom.id;
        this.zooms.filter(hasUniqId).forEach((z) => {
            z.translate(translate);
            z.scale(scale);
        });
        var xTicks = this.xScale.ticks(10);
        var yTicks = this.yScale.ticks(10);
        this.charts.forEach((c) => {
            c.rerender(xTicks, yTicks, translate, scale);
        });
        this.meter.tick();
        PerfDiagnostics.toggle("total");
    }
}

new ChartGen(9);


