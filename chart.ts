
export class Chart {
  public static margin = {top: 20, right: 20, bottom: 30, left: 50};
  public static width  = 560 - Chart.margin.left - Chart.margin.right;
  public static height = 500 - Chart.margin.top  - Chart.margin.bottom;

  public svg: D3.Selection;
  public xScalePlot: D3.Scale.TimeScale;
  public yScalePlot: D3.Scale.LinearScale;
  public xScaleAxis: D3.Scale.TimeScale;
  public yScaleAxis: D3.Scale.TimeScale;
  public xAxis: D3.Svg.Axis;
  public yAxis: D3.Svg.Axis;
  public lineGenerator: D3.Svg.Line;

  constructor(public container: D3.Selection, json: string) {
    this.setupD3Objects();

    this.svg = this.container.append("svg");

    this.xAxisEl = this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + Chart.height + ")")
      .call(this.xAxis);

    this.yAxisEl = this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis);

    this.pathEl = this.svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", this.line);
  }

  public setupD3Objects(){
    this.xScalePlot = d3.time.scale()  .range([0, Chart.width]);
    this.xScaleAxis = d3.time.scale()  .range([0, Chart.width]);
    this.yScalePlot = d3.scale.linear().range([0, Chart.height]);
    this.yScaleAxis = d3.scale.linear().range([0, Chart.height]);

    this.xAxis = d3.svg.axis().scale(this.xScaleAxis).orient("bottom");
    this.yAyis = d3.svg.axis().scale(this.yScaleAxis).orient("left");
    this.line = d3.svg.line()
      .x((d: IDatum) => this.xScalePlot(d.x))
      .y((d: IDatum) => this.yScalePlot(d.y));

  }
}
