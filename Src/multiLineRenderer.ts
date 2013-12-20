///<reference path="../Lib/d3.d.ts" />

module MultiLineRenderer {

    interface ILineRenderer {
        attribute: string;
        line: D3.Svg.Line;
        element: D3.Selection;
    }

    export class MultiLineRenderer {
        private renderArea: D3.Selection;
        private renderers: ILineRenderer[];

        constructor(
            container: D3.Selection,
            private data: IWeatherDatum[],
            private attributes: string[],
            private xScale: D3.Scale.TimeScale,
            private yScale: D3.Scale.LinearScale
        ) {
            this.renderArea = container.append("g").classed("render-area", true);
            this.renderers = this.attributes.map((attribute) => {
                var line = d3.svg.line()
                    .x((d: IWeatherDatum) => this.xScale(d.date))
                    .y((d: IWeatherDatum) => this.yScale(d[attribute]));
                var element = this.renderArea.append("path")
                    .classed("line", true)
                    .classed(attribute, true)
                    .datum(this.data);
                return {
                    attribute: attribute,
                    line: line,
                    element: element
                }
            });
        }

        public render() {
            this.renderers.forEach((r) => {
                r.element.attr("d", r.line);
            });
        }

        public transform(translate: number[], scale: number) {
            this.renderArea.attr("transform", "translate("+translate+") scale("+scale+")");
        }

    }
}
