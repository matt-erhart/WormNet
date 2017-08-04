import * as React from "react";
// var data = require("../assets/data/data.json"); //easy way to load in data
import * as d3 from "d3"; //typescript uses this to import, instead of the usual import d3 from 'd3'
import * as _ from "lodash";
import styled from "styled-components";
var store = require("store");
import { svgPadding as pad } from "./constants";
import { neuronRadius, svgWidth, svgHeight, colors } from "./constants";

import Neuron from "./Neuron";
import {Controls} from "./Controls";

const plotSetup = (data, svgWidth = 1000, svgHeight = 1000) => {
  const xs: number[] = data.map(row => +row.pos[0]); //create an array of x positions
  const ys: number[] = data.map(row => +row.pos[1]);
  const xRange: number[] = d3.extent(xs); // min, max
  const yRange: number[] = d3.extent(ys);
  const xScale = d3
    .scaleLinear()
    .domain(xRange)
    .range([0 + pad, svgWidth - pad]); //convert raw x position data into pixel space
  const yScale = d3
    .scaleLinear()
    .domain(yRange)
    .range([0 + pad, svgHeight - pad]);
  const pos = xs.map((x, i) => {
    //position array to loop over and create a circle for each point
    return [xScale(x), yScale(ys[i])];
  });

  return { xs, ys, xRange, yRange, xScale, yScale, pos, svgWidth, svgHeight };
};

//the <any, any> is a typescript thing. It let's us define the allowed/required props (things passed into it), and the state
export class App extends React.Component<any, any> {
  //init class variables
  stopId;
  timer;
  xScale; yScale;
  constructor() {
    super();
    this.state = {
      //only change with this.setState({var: newValue})
      time: 0,
      isPlaying: false,
      data: [],
      plotMeta: {},
      links: []
    };
  }
  componentWillMount() {
    const savedtime = store.get("time") || 0;
    this.setState({ time: savedtime });

    fetch("../assets/data/data.json").then(res => res.json()).then(data => {
      this.setState({ data });
      const {xScale, yScale, ...plotMeta} = plotSetup(data, svgWidth, svgHeight);
      this.xScale = xScale;
      this.yScale = yScale;
      this.setState({ plotMeta });
      fetch("../assets/data/links.json").then(res => res.json()).then(links => {
      const scaledLinks = links.map(link => {
        const sx = this.xScale(link.sourcePos[0]);
        const sy = this.yScale(link.sourcePos[1]);
        const tx = this.xScale(link.targetPos[0]);
        const ty = this.yScale(link.targetPos[1]);
        return {sx, sy, tx, ty}
      })
      this.setState({ links: scaledLinks });
    });
    });
    
  }

  componentDidUpdate() {
    store.set("time", this.state.time);
  }

  startTimer = () => {
    //d3.interval fires every 35ms
    this.timer = d3.interval(elapsed => {
      //save to this.timer so we can use this.timer.stop()
      if (this.state.time < this.state.data[0].spikes.length)
        this.setState({ time: this.state.time + 1 }); //increment time this way so react will rerender on change
    }, 35);
  };

  pauseTimer = () => {
    this.timer.stop();
    this.setState({ isPlaying: false });
  };

  toggleTimer = () => {
    if (this.state.isPlaying) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
    this.setState({ isPlaying: !this.state.isPlaying });
  };
  setTime = value => {
    this.setState({ time: value });
  };

  render() {
    const { svgWidth, svgHeight, pos } = this.state.plotMeta;
    const { data, links } = this.state;
    if (!svgWidth || !svgHeight || !pos) return <div>loading</div>;
    //render is a react specific function from React.Component.
    return (
      // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.
      //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}
      <div>
        <div>
          <svg
            width={"100%" }
            height={"100%"}
            style={{maxHeight: '80vh'}}
            viewBox={`0,0, ${svgWidth}, ${svgHeight}`}
          >
            {links.map((link,i) => {
                const {sx,sy, tx, ty} = link
                return (
                  <line key={i} x1={sx} y1={sy} x2={tx} y2={ty} stroke={colors.connector}></line>
                )
            })}
            {pos.map((xy, i) => {
              //note this pos.map begings and ends with {}
              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.
              const isSpiking = +data[i].spikes[this.state.time] === 1; //data has all the cells, each with {label, spikes, pos} fields
              return (
                //these parens are important in react
                <Neuron
                  key={i}
                  cx={xy[0]}
                  cy={xy[1]}
                  r={isSpiking ? neuronRadius.active : neuronRadius.inActive} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  name={data[i].label}
                  active={isSpiking}
                />
              );
            })}
          </svg>
           <Controls
            time={this.state.time}
            togglePlay={this.toggleTimer}
            changeTime={this.setTime}
            isPlaying={this.state.isPlaying}
          /> 
        </div>
      </div>
    );
  }
}
