///<reference path="d3.d.ts" />

interface ITimeseriesDatum {
    x: any;
    y: number;
}

interface IWeatherDatum {
    avg : number; // Average temperature on date
    avgh: number;
    avgl: number;
    hi  : number;
    hih : number;
    hil : number;
    lo  : number;
    loh : number;
    lol : number;
    precip: number;
    day: number;
    date: Date;
}


class Chart {
    public static margin = { top: 20, right: 20, bottom: 30, left: 50 };
    public static width = 560 - Chart.margin.left - Chart.margin.right;
    public static height = 500 - Chart.margin.top - Chart.margin.bottom;
    private static attributes = ["avg","avgh","avgl","hi","hih","hil","lo","loh","lol","precip","day"]
    private static parseDate = d3.time.format("%y-%b-%d").parse;

    public svg: D3.Selection;
    public xScalePlot: D3.Scale.TimeScale;
    public yScalePlot: D3.Scale.LinearScale;
    public xScaleAxis: D3.Scale.TimeScale;
    public yScaleAxis: D3.Scale.LinearScale;
    public xAxis: D3.Svg.Axis;
    public yAxis: D3.Svg.Axis;
    public xAxisEl: D3.Selection;
    public yAxisEl: D3.Selection;
    public pathEl: D3.Selection;
    public line: D3.Svg.Line;
    public data: IWeatherDatum[];

    public static processCSVData(indata: any) {
        indata.forEach((d: any) => {
            Chart.attributes.forEach((a: string) => {
                indata[a] = +indata[a];
            });
            d.date = Chart.parseDate(d.date);
        });
        return <IWeatherDatum[]> indata;
    }

    constructor(container: D3.Selection, url: string) {
        this.setupD3Objects();
        this.setupDOM(container);
        d3.csv(url, (error, data) => {
            this.data = Chart.processCSVData(data);
          });

    }

    private setupD3Objects() {
        this.xScalePlot = d3.time.scale().range([0, Chart.width]);
        this.xScaleAxis = d3.time.scale().range([0, Chart.width]);
        this.yScalePlot = d3.scale.linear().range([0, Chart.height]);
        this.yScaleAxis = d3.scale.linear().range([0, Chart.height]);

        this.xAxis = d3.svg.axis().scale(this.xScaleAxis).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.yScaleAxis).orient("left");
        this.line = d3.svg.line()
            .x((d: IWeatherDatum) => this.xScalePlot(d.date))
            .y((d: IWeatherDatum) => this.yScalePlot(d.avg));
    }

    private setupDOM(container: D3.Selection) {
        this.svg = container.append("svg");

        this.xAxisEl = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + Chart.height + ")");

        this.yAxisEl = this.svg.append("g")
            .attr("class", "y axis");

        this.pathEl = this.svg.append("path");
    }

    private initialRender(data: ITimeseriesDatum[]) {
        this.xAxisEl.call(this.xAxis);
        this.yAxisEl.call(this.yAxis);
        this.pathEl.datum(data)
            .attr("class", "line")
            .attr("d", this.line);
    }
}

class ChartGen {
    public containerSelection: D3.Selection;
    public charts: Chart[];

    constructor(public numCharts: number) {
      this.containerSelection = d3.select("body");
      this.charts = [];
      var i=0;
      d3.json("Data/cityNames.json", (error, data) => {

          this.makeCharts(this.numCharts, d3.values(data));

        });
    }

    public makeCharts(numCharts: number, fileNames: string[]){
      fileNames = fileNames.slice(0, numCharts);
      fileNames.forEach((fileName: string) => {
          fileName = "Data/" + fileName;
          this.charts.push(new Chart(this.containerSelection, fileName));
        });
    }
}

new ChartGen(2);
