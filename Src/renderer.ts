///<reference path="../Lib/d3.d.ts" />

class Renderer {
  public renderArea: D3.Selection;

  constructor(
    container: D3.Selection,
    public data: IDatum[],
    public xScale,
    public yScale,
    public tagName: string
  ) {
    this.renderArea = container.append("g").classed("render-area", true).classed(this.tagName, true);
  }

  public transform(translate: number[], scale: number) {
    return; // no-op
  }

  public render() {
    return; // no-op
  }
}

class LineRenderer extends Renderer {
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

class CircleRenderer extends Renderer {
  private circles: D3.Selection;

  constructor(c,d,x,y,t) {
    super(c,d,x,y,t);
    this.circles = this.renderArea.selectAll("circle");
  }

  public render() {
    this.circles.data(this.data).enter().append("circle")
      .attr("cx", (d) => {return this.xScale(d.date);})
      .attr("cy", (d) => {return this.yScale(d.y) + Math.random() * 10 - 5;})
      .attr("r", 0.5);
  }
}

class ResizingCircleRenderer extends CircleRenderer {
  public transform(translate: number[], scale: number) {
    console.log("xform");
    this.renderArea.selectAll("circle").attr("r", 0.5/scale);
  }
}

