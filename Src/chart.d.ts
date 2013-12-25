///<reference path="chart.ts" />
///<reference path="axis.ts" />
///<reference path="../Lib/d3.d.ts" />

interface Window {
	charts: Chart[];
	chart : Chart;
	xAxis : Axis.Axis;
	yAxis : Axis.Axis;
	xScale: D3.Scale.Scale;
	yScale: D3.Scale.Scale;
}