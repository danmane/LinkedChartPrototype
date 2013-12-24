///<reference path="../Lib/d3.d.ts" />

module Axis {
  export class Axis {
    public d3axis: D3.Svg.Axis;
    public axisEl: D3.Selection;
    private cachedScale: number;
    private cachedTranslate: number;
    private isXAligned: boolean;

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
      var g = this.axisEl;
      var ticks = this.scale.ticks(10);
      var tickFormat = this.scale.tickFormat(10);
      var tick = g.selectAll(".tick").data(ticks, this.scale);
      var tickEnter = tick.enter().insert("g", ".domain")
        .attr("class", "tick").style("opacity", 1e-6);
      var tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove();
      var tickUpdate = d3.transition(tick).style("opacity", 1);
      var range = this.scale.range();
      var path = g.selectAll(".domain").data([0]);
      var pathUpdate = (path.enter().append("path").attr("class", "domain"), d3.transition(path));
      
      tickEnter.append("line");
      tickEnter.append("text");

      var lineEnter  = tickEnter .select("line");
      var lineUpdate = tickUpdate.select("line");
      var text = tick.select("text").text(tickFormat);
      var textEnter  = tickEnter .select("text");
      var textUpdate = tickUpdate.select("text");
      var tickTransform;
      var orient = this.orientation;
      switch (orient) {
        case "bottom": {
          tickTransform = d3_svg_axisX;
          lineEnter.attr("y2", innerTickSize);
          textEnter.attr("y", Math.max(innerTickSize, 0) + tickPadding);
          lineUpdate.attr("x2", 0).attr("y2", innerTickSize);
          textUpdate.attr("x", 0).attr("y", Math.max(innerTickSize, 0) + tickPadding);
          text.attr("dy", ".71em").style("text-anchor", "middle");
          pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
          break;
        }
        case "top": {
          tickTransform = d3_svg_axisX;
          lineEnter.attr("y2", -innerTickSize);
          textEnter.attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
          lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
          textUpdate.attr("x", 0).attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
          text.attr("dy", "0em").style("text-anchor", "middle");
          pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
          break;
        }
        case "left": {
          tickTransform = d3_svg_axisY;
          lineEnter.attr("x2", -innerTickSize);
          textEnter.attr("x", -(Math.max(innerTickSize, 0) + tickPadding));
          lineUpdate.attr("x2", -innerTickSize).attr("y2", 0);
          textUpdate.attr("x", -(Math.max(innerTickSize, 0) + tickPadding)).attr("y", 0);
          text.attr("dy", ".32em").style("text-anchor", "end");
          pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
          break;
        }
        case "right": {
          tickTransform = d3_svg_axisY;
          lineEnter.attr("x2", innerTickSize);
          textEnter.attr("x", Math.max(innerTickSize, 0) + tickPadding);
          lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
          textUpdate.attr("x", Math.max(innerTickSize, 0) + tickPadding).attr("y", 0);
          text.attr("dy", ".32em").style("text-anchor", "start");
          pathUpdate.attr("d", "M" + outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + outerTickSize);
          break;
        }
      }


      this.axisEl.attr("transform","");
    }

    public transform(translatePair: number[], scale: number) {
      var translate = this.isXAligned ? translatePair[0] : translatePair[1];
      if (scale != null && scale != this.cachedScale) {
        this.cachedTranslate = translate;
        this.render();
      } else {
        translate -= this.cachedTranslate;
        var transform = this.transformString(translate, scale);
        this.axisEl.attr("transform", transform);
      }
      this.cachedScale = scale;
    }
  }
}
