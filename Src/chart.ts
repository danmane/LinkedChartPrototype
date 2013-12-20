///<reference path="../Lib/d3.d.ts" />
///<reference path="../Lib/FPSMeter.d.ts" />
///<reference path="perfdiagnostics.ts" />
///<reference path="axis.ts" />
///<reference path="utils.ts" />

interface IWeatherDatum {
    avg   : number; // Average temperature on date
    avgh  : number;
    avgl  : number;
    hi    : number;
    hih   : number;
    hil   : number;
    lo    : number;
    loh   : number;
    lol   : number;
    precip: number;
    day   : number;
    date  : Date;
}

class Chart {
    private static margin = { top: 20, right: 20, bottom: 30, left: 60 };
    private static dataAttributesToDraw = ["avg", "hi", "lo"];

    public div: D3.Selection;

    private svg: D3.Selection;
    private xAxis: Axis.Axis;
    private yAxis: Axis.Axis;
    private xAxisContiner: D3.Selection;
    private yAxisContiner: D3.Selection;
    private plot: D3.Selection;
    private lineRenderer: MultiLineRenderer.MultiLineRenderer;

    constructor(
        container: D3.Selection,
        private height: number,
        private width: number,
        private xScale: D3.Scale.TimeScale,
        private yScale: D3.Scale.LinearScale,
        private data: IWeatherDatum[]
    ) {
        this.setupDOM(container);
        this.setupD3Objects();
        this.initialRender();
    }

    private setupD3Objects() {
        var formatter = d3.time.format("%b");
        // this.xAxis = new Axis.Axis(this.xAxisContiner, this.xScale, "bottom", formatter);
        this.yAxis = new Axis.Axis(this.yAxisContiner, this.yScale, "left", null);
        this.lineRenderer = new MultiLineRenderer.MultiLineRenderer(this.plot, this.data, Chart.dataAttributesToDraw, this.xScale, this.yScale);
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

        this.xAxisContiner = this.svg.append("g")
            .classed("axis-container", true)
            .classed("x-axis", true)
            .attr("transform", "translate(0," + this.height + ")");

        this.yAxisContiner = this.svg.append("g")
            .classed("axis-container", true)
            .classed("y-axis", true)
            .attr("transform", "translate(25)");

        this.plot = this.svg.append("g").attr("transform", "translate(" + Chart.margin.left + ",0)");
    }

    private initialRender() {
        var dateDomain = d3.extent(this.data, function(d) { return d.date; });
        var rangeDomain = [100, 0];
        this.xScale.domain(dateDomain);
        this.yScale.domain(rangeDomain);

        // this.xAxis.render();
        this.yAxis.render();
        this.lineRenderer.render();
    }

    public rerender(xTicks: any[], yTicks: any[], translate: number[], scale: number) {
        PerfDiagnostics.toggle("axis");
        // this.xAxis.render(translate, scale);
        this.yAxis.transform(translate, scale);
        PerfDiagnostics.toggle("axis");
        PerfDiagnostics.toggle("transform");
        this.lineRenderer.transform(translate, scale);
        PerfDiagnostics.toggle("transform");
    }
}

class ChartGen {
    private charts: Chart[];
    private chartsReady: number; //hackhack
    private zoomCoordinator: ZoomCoordinator;

    constructor(private numCharts: number) {
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
        var readyFunction = Utils.readyCallback(numCharts, () => this.setupZoomCoordinator(xScale, yScale));
        fileNames = fileNames.slice(0, numCharts);
        fileNames.forEach((fileName: string) => {
            fileName = "Data/" + fileName;
            d3.csv(fileName, (error, data) => {
                var parsedData = Utils.processCSVData(data);
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
    private zooms: IZoomWithId[];

    private meter: FPSMeter;

    constructor(private charts: Chart[], private xScale: D3.Scale.TimeScale, private yScale: D3.Scale.LinearScale) {
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
        var translate: any = zoom.translate();
        var scale: any = zoom.scale();
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


