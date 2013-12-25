///<reference path="../Lib/d3.d.ts" />
///<reference path="../Lib/FPSMeter.d.ts" />
///<reference path="../Lib/lodash.d.ts" />
///<reference path="perfdiagnostics.ts" />
///<reference path="axis.ts" />
///<reference path="utils.ts" />

interface IWeatherDatum {
  avg   : number; // Average temperature on date
  avgh  : number;
  avgl  : number;
  hi  : number;
  hih   : number;
  hil   : number;
  lo  : number;
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
    this.xAxis = new Axis.Axis(this.xAxisContiner, this.xScale, "bottom", formatter);
    this.yAxis = new Axis.Axis(this.yAxisContiner, this.yScale, "left", null);
    this.lineRenderer = new MultiLineRenderer.MultiLineRenderer(this.plot, this.data, Chart.dataAttributesToDraw, this.xScale, this.yScale);
  }

  private setupDOM(container: D3.Selection) {
    this.div = container.append("div")
      .attr("height", this.height)
      .attr("width",  this.width)
      .classed("chart-outer", true);
    this.svg = this.div.append("svg")
      .attr("height", this.height)
      .attr("width",  this.width)
      .classed("chart-inner", true);
    this.height -= Chart.margin.top  + Chart.margin.bottom;
    this.width  -= Chart.margin.left + Chart.margin.right;

    this.plot = this.svg.append("g")
      .classed("plot", true);

    this.xAxisContiner = this.svg.append("g")
      .classed("axis-container", true)
      .classed("x-axis", true)
      .attr("transform", "translate(0," + this.height + ")");

    this.yAxisContiner = this.svg.append("g")
      .classed("axis-container", true)
      .classed("y-axis", true)
      .attr("transform", "translate(25)");

  }

  private initialRender() {
    var dateDomain = d3.extent(this.data, function(d) { return d.date; });
    var rangeDomain = [100, 0];
    this.xScale.domain(dateDomain);
    this.yScale.domain(rangeDomain);

    this.xAxis.render();
    this.yAxis.render();
    this.lineRenderer.render();
  }

  public rerender(translate: number[], scale: number) {
    PerfDiagnostics.toggle("axis");
    this.xAxis.transform(translate, scale);
    this.yAxis.transform(translate, scale);
    PerfDiagnostics.toggle("axis");
    PerfDiagnostics.toggle("transform");
    this.lineRenderer.transform(translate, scale);
    PerfDiagnostics.toggle("transform");
  }
}

class ChartGen {
  private chartsReady: number; //hackhack
  private zoomCoordinator: ZoomCoordinator;
  private chartWidth: number;
  private chartHeight: number;
  public charts: Chart[];

  constructor(fileNames: string[], private meterEnabled: boolean) {
    this.makeCharts(fileNames);
  }

  private setupZoomCoordinator(xScale, yScale) {
    this.zoomCoordinator = new ZoomCoordinator(this.charts, xScale, yScale, this.chartWidth, this.chartHeight, this.meterEnabled);
  }

  public makeCharts(fileNames: string[]) {
    this.charts = [];
    var numCharts = fileNames.length;
    var containerSelection = d3.select("body");
    var chartsToSide = Math.ceil(Math.sqrt(numCharts));
    this.chartWidth  = window.innerWidth  / chartsToSide - 30;
    this.chartHeight = window.innerHeight / chartsToSide - 10;
    var xScale = d3.time.scale().range([0, this.chartWidth]);
    var yScale = d3.scale.linear().range([0, this.chartHeight]);
    var readyFunction = Utils.readyCallback(numCharts, () => this.setupZoomCoordinator(xScale, yScale));
    fileNames = fileNames.slice(0, numCharts);
    fileNames.forEach((fileName: string) => {
      fileName = "Data/" + fileName;
      d3.csv(fileName, (error, data) => {
        var parsedData = Utils.processCSVData(data);
        this.charts.push(new Chart(containerSelection, this.chartHeight, this.chartWidth, xScale, yScale, parsedData));
        readyFunction();
      })
    });
  }
}

interface IZoomWithId extends D3.Behavior.Zoom {
  id: number;
}

interface IChartGenDataFile {
  meterEnabled: boolean;
  cities: ICity[];
}

interface ICity {
  cityName: string;
  fileName: string;
}

class ZoomCoordinator {
  private zooms: IZoomWithId[];
  private meter: FPSMeter;

  constructor(private charts: Chart[], private xScale: D3.Scale.TimeScale, private yScale: D3.Scale.LinearScale, width, height, private meterEnabled = true) {
    this.zooms = charts.map((c, id) => {
      var z = <IZoomWithId> d3.behavior.zoom();
      z.id = id;
      z(c.div);
      z.on("zoom", () => this.synchronize(z));
      z.x(this.xScale);
      z.y(this.yScale);
      (<any> z).size([width, height]);
      return z;
    });
    if (this.meterEnabled) {this.meter = new FPSMeter();}
  }

  public synchronize(zoom: IZoomWithId) {
    PerfDiagnostics.toggle("total");
    var translate: number[] = zoom.translate();
    var scale: number = zoom.scale();
    var hasUniqId = (z: IZoomWithId) => z.id != zoom.id;
    this.zooms.filter(hasUniqId).forEach((z) => {
      z.translate(translate);
      z.scale(scale);
    });
    this.charts.forEach((c) => {
      c.rerender(translate, scale);
    });
    if (this.meterEnabled) this.meter.tick();
    PerfDiagnostics.toggle("total");
  }
}
d3.json("data/chartSettings.json", (error, data: IChartGenDataFile) => {
  var meterEnabled = data.meterEnabled;
  var cities = data.cities;
  var fileNames = _.pluck(cities, "fileName");

  var cg = new ChartGen(fileNames, meterEnabled);
  window.charts = cg.charts;
  
  })
