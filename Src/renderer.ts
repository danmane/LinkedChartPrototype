///<reference path="../Lib/d3.d.ts" />

export class Renderer {
  public renderArea: D3.Selection;

  constructor(
    container: D3.Selection,
    public data: IDatum[],
    public xScale,
    public yScale,
    public tagName: string
  ) {
    this.renderArea = container.append("g").classed("render-area", true);
  }

  public transform(translate: number[], scale: number) {
    return; // no-op
  }

  public render() {
    return; // no-op
  }
}

export class LineRenderer extends Renderer {
  private line: D3.Svg.Line;
  private element: D3.Selection;

  constructor( c, d, x, y, t) {
    super(c, d, x, y, t);
    this.line = d3.svg.line()
      .x((d) => this.xScale(d.date))
      .y((d) => this.yScale(d.y));
    this.element = this.renderArea.append("path")
      .classed("line", true)
      .classed(this.tagName, true)
      .datum(this.data);
  }

  public render() {
    this.element.attr("d", this.line);
  }
}

export class CircleRenderer extends Renderer {
  private circles: D3.Selection;

  constructor(c,d,x,y,t) {
    super(c,d,x,y,t);
    this.circles = this.renderArea.selectAll("circles");;
  }

  public render() {
    this.circles.data(this.data).enter().append("circle")
      .classed(this.tagName, true)
      .attr("cx", (d) => {this.xScale(d.date);})
      .attr("cy", (d) => {this.yScale(d.y);})
      .attr("r", 20);
  }
}

