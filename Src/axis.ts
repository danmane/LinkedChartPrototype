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
            // var scaleS     = this.isXAligned ? ""+scale     : "0," + scale;
            // console.log(translateS);
            return "translate(" + translateS + ") scale(" + scale + ")";
        }

        public render() {
            this.axisEl.call(this.d3axis);
            this.axisEl.attr("transform","");
        }

        public transform(translatePair: number[], scale: number) {
            var translate = this.isXAligned ? translatePair[0] : translatePair[1];
            // var scale     = this.isXAligned ? scalePair[0]     : scalePair[1];
            if (scale != null && scale != this.cachedScale) {
              this.render();
            } else {
              var transform = this.transformString(translate, scale);
              this.axisEl.attr("transform", transform);
            }
            this.cachedTranslate = translate;
            this.cachedScale = scale;
        }
    }
}
