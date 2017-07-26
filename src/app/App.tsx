import * as React from "react";
var data = require("../assets/data/data.json");
import * as d3 from "d3";
const xs: number[] = data.map(row => +row.pos[0]);
const ys: number[] = data.map(row => +row.pos[1]);
const xRange: number[] = d3.extent(xs);
const yRange: number[] = d3.extent(ys);
const svgWidth = 1000;
const svgHeight = 1000;
const xScale = d3.scaleLinear().domain(xRange).range([0, svgWidth]);
const yScale = d3.scaleLinear().domain(yRange).range([0, svgHeight]);
const pos = xs.map((x, i) => {
  console.log(x, i);
  return [xScale(x), yScale(ys[i])];
});

export class App extends React.Component<any, any> {
  stopId;
  constructor() {
    super();
    this.state = {
      time: 0,
      toggle: false
    };
  }

  raf = timestamp => {
    if (this.state.time < data[0].spikes.length)
      this.setState({ time: this.state.time + 1 });
    setTimeout(() => {
      this.stopId = window.requestAnimationFrame(this.raf);
    }, 1000 / 15);
  };

  toggleAnimation = () => {
    console.log(this.state);
    if (!this.state.toggle) {
      window.requestAnimationFrame(this.raf);
    } else {
      cancelAnimationFrame(this.stopId);
    }
    this.setState({ toggle: !this.state.toggle });
  };

  render() {
    return (
      <div>
        <button onClick={this.toggleAnimation}>Toggle Animation</button>
        <svg width={svgWidth} height={svgHeight}>
          {pos.map((xy, i) => {
            const isSpiking = +data[i].spikes[this.state.time] === 1;
            return (
              <circle
                key={i}
                cx={xy[0]}
                cy={xy[1]}
                r={isSpiking ? 20 : 5}
                name={data[i].label}
                fill={isSpiking ? "green" : "grey"}
              />
            );
          })}
        </svg>
      </div>
    );
  }
}
