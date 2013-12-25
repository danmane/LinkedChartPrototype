///<reference path="../Lib/d3.d.ts" />

module Axis {
  export class Axis {
    public d3axis: D3.Svg.Axis;
    public axisEl: D3.Selection;
    private cachedScale: number;
    private cachedTranslate: number;
    private isXAligned: boolean;

    private static axisXTransform(selection, x) {
      selection.attr("transform", function(d) {
        return "translate(" + x(d) + ",0)";
      });
    }

    private static axisYTransform(selection, y) {
      selection.attr("transform", function(d) {
        return "translate(0," + y(d) + ")";
      });
    }

    constructor(
      public container: D3.Selection,
      public scale: D3.Scale.Scale,
      public orientation: string,
      public formatter: any
    ) {
      this.d3axis = d3.svg.axis().scale(this.scale).orient(this.orientation);
      this.axisEl = this.container.append("g").classed("axis", true);
      if (this.formatter != null) {
        this.d3axis.tickFormat(formatter);
      }
      this.cachedScale = 1;
      this.cachedTranslate = 0;
      this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
    }

    private transformString(translate: number, scale: number) {
      var translateS = this.isXAligned ? ""+translate : "0," + translate;
      return "translate(" + translateS + ")";
    }

    public render() {
      this.axisEl.call(this.d3axis);
      this.axisEl.attr("transform","");
    }

    public rescale() {
      var tickTransform = this.isXAligned ? Axis.axisXTransform : Axis.axisYTransform;
      var tickSelection = this.axisEl.selectAll(".tick");
      (<any> tickSelection).call(tickTransform, this.scale);
    }
  }
}
