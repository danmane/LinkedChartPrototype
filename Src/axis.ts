///<reference path="../Lib/d3.d.ts" />

module Axis {
	export class Axis {
		public d3axis: D3.Svg.Axis;
		public axisEl: D3.Selection;
		
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
		}

		public render() {
			this.axisEl.call(this.d3axis);
		}
	}
}