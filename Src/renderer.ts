///<reference path="../Lib/d3.d.ts" />

module Renderer {

  interface IDatum{
    date: Date;
    y: number;
  }

  export class Renderer {
    public renderArea: D3.Selection;

    constructor(
      container: D3.Selection,
      private data: IDatum[],
      public xScale,
      public yScale
    ) {
      this.renderArea = container.append("g").classed("render-area", true);
      });

    public transform(translate: number[], scale: number) {
      this.renderArea.attr("transform", "translate("+translate+") scale("+scale+")");
    }
  }

  export class LineRenderer extends Renderer {
    private line: D3.Svg.Line;
    private element: D3.Selection;

    constructor( c, d, x, y ) {
      super(c,d,x,y);
      this.line = d3.svg.line()
        .x((d) => this.xScale(d.date))
        .y((d) => this.yScale(d.y));
      this.element = this.renderArea.append("path")
        .classed("line", true)
        .classed(attribute, true)
        .datum(this.data);
      });
      this.element.attr("d", this.line);
    }
  }

  export class CircleRenderer extends Renderer {
    private circles: D3.Selection;
    constructor(c,d,x,y) {
      super(c,d,x,y);
      this.circles = this.renderArea.selectAll("circles").data(this.data);
      this.circles.enter().append("circle")
        .attr("cx", (d) => {this.xScale(d.date)})
        .attr("cy", (d) => {this.yScale(d.y)})
        .attr("r", 20);
    }



  }
}
