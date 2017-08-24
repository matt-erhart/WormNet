import * as React from "react";
// var data = require("../assets/data/data.json"); //easy way to load in data
import * as d3 from "d3"; //typescript uses this to import, instead of the usual import d3 from 'd3'
import * as _ from "lodash";
import styled from "styled-components";
import { neuron, link, propagation, jsonOutput } from "./interfaces";
var store = require("store");
import { svgPadding as pad } from "./constants";
import {
  neuronRadius,
  svgWidth,
  svgHeight,
  colors,
  linkOpacity
} from "./constants";
import { Controls } from "./Controls";

const plotSetup = (neurons, svgWidth = 1000, svgHeight = 1000) => {
  const xs: number[] = neurons.map(row => +row.pos[0]); //create an array of x positions
  const ys: number[] = neurons.map(row => +row.pos[1]);
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

  neurons.forEach((neuron, i) => {
    neurons[i].posScaled = [xScale(neuron.pos[0]), yScale(neuron.pos[1])];
  });
  // return { xs, ys, xRange, yRange, xScale, yScale, pos, svgWidth, svgHeight };
  return { neurons, svgWidth, svgHeight };
};

//the <any, any> is a typescript thing. It let's us define the allowed/required props (things passed into it), and the state
export class App extends React.Component<any, any> {
  //init class variables
  stopId;
  timer;
  xScale;
  yScale;
  constructor() {
    super();
    this.state = {
      //only change with this.setState({var: newValue})
      time: 0,
      isPlaying: false,
      neurons: [],
      plotMeta: {},
      links: [],
      propagation: [],
      propagationsOnScreen: []
    };
  }
  getSourceAndTargetNeurons(neurons, sourceId, targetId) {
    const source = _.find(
      neurons,
      (neuron: neuron) => neuron.id.toLowerCase() === sourceId
    );
    const target = _.find(
      neurons,
      (neuron: neuron) => neuron.id.toLowerCase() === targetId
    );
    return { source, target };
  }

  componentWillMount() {
    const savedtime = store.get("time") || 0;
    this.setState({ time: savedtime });
    const dataDir = "../assets/data";
    Promise.all([
      fetch(dataDir + "/feed_json.json").then(res => res.json())
      // fetch(dataDir + "/json/links.json").then(res => res.json()),
      // fetch(dataDir + "/json/propagation.json").then(res => res.json())
    ]).then(json => {
      let neuronData: neuron[] = json[0].neurons;
      const links: link[] = json[0].links;
      const propagation: propagation[] = json[0].propagation;
      this.setState({ propagation });
      const { neurons, ...plotMeta } = plotSetup(
        neuronData,
        svgWidth,
        svgHeight
      );
      this.setState({ neurons });

      // this.xScale = xScale;
      // this.yScale = yScale;
      this.setState({ plotMeta });
      const scaledLinks = links.map(link => {
        // const sx = this.xScale(link.sourcePos[0]);
        // const sy = this.yScale(link.sourcePos[1]);
        // const tx = this.xScale(link.targetPos[0]);
        // const ty = this.yScale(link.targetPos[1]);
        const { source, target } = this.getSourceAndTargetNeurons(
          neurons,
          link.source.id.toLowerCase(),
          link.target.id.toLowerCase()
        );
        const sx = source.posScaled[0];
        const sy = source.posScaled[1];
        const tx = target.posScaled[0];
        const ty = target.posScaled[1];
        return { sx, sy, tx, ty, id: link.id };
      });
      this.setState({ links: scaledLinks });
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
      this.activationLocations(this.state.propagation, this.state.time);
    }, 10);
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
    this.activationLocations(this.state.propagation, value);
  };

  activationLocations(propagation, time) {
    if (!propagation || !time) return;
    //when time is zero
    // const propagationsStarting = propagation[time] || []; //starting activations
    // const propagationsContinuing = this.state.propagationsOnScreen.filter(p => {
    //       return _.get(p, 'targetActivationTime', 0) >= time && _.get(p, 'sourceActivationTime') < time;
    //     })

    let propagationsOnScreen: propagation[] = this.state.propagation.filter(
      p => {
        return (
          _.get(p, "target.activationTime") >= time &&
          _.get(p, "source.activationTime") < time
        );
      }
    );
    propagationsOnScreen.forEach((p: any, i) => {
      const progress =
        (time - p.source.activationTime) /
        (p.target.activationTime - p.source.activationTime);
      const { source, target } = this.getSourceAndTargetNeurons(
        this.state.neurons,
        p.source.id,
        p.target.id
      );
      const pos = d3.interpolateObject(source.posScaled, target.posScaled)(progress);
      propagationsOnScreen[i].pos = pos;
    });
    this.setState({ propagationsOnScreen });
  }

  activationLocationOnScrub() {
    //
  }

  render() {
    const { svgWidth, svgHeight } = this.state.plotMeta;
    const {
      neurons,
      links,
      propagation,
      time,
      propagationsOnScreen
    } = this.state;
    if (!svgWidth || !svgHeight) return <div>loading</div>;
    const nTimes = 6000; //data[0].spikes.length;
    //render is a react specific function from React.Component.

    return (
      // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.
      //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}
      <div>
        <div>
          <svg
            width={"100%"}
            height={"100%"}
            style={{ maxHeight: "80vh" }}
            viewBox={`0,0, ${svgWidth}, ${svgHeight}`}
          >
            {links.map((link, i) => {
              const { sx, sy, tx, ty, id } = link;
              return (
                <line
                  key={id}
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke={colors.connector}
                  strokeWidth={2}
                  style={{ opacity: linkOpacity }}
                />
              );
            })}
            {/* {propagationsOnScreen.map((p,i)=> {
              return (
                <circle
                  key={p.id}
                  cx={p.interpPos[0]}
                  cy={p.interpPos[1]}
                  r={2} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  fill={p.sourceType === 'excites' ? colors.excitesPropagation : colors.inhibitsPropagation}
                />
              )
            })} */}
            {neurons.map((neuron, i) => {
              //note this pos.map begings and ends with {}
              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.
              const isSpiking = _.includes(neuron.spikes, this.state.time); //data has all the cells, each with {label, spikes, pos} fields
              const activeColor =
                neuron.type === "excites"
                  ? colors.excitesActive
                  : colors.inhibitsActive;
              const inActiveColor =
                neuron.type === "excites"
                  ? colors.excitesInActive
                  : colors.inhibitsInActive;

              return (
                //these parens are important in react
                <circle
                  key={i}
                  cx={neuron.posScaled[0]}
                  cy={neuron.posScaled[1]}
                  r={isSpiking ? neuronRadius.active : neuronRadius.inActive} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  name={neuron.label}
                  fill={isSpiking ? activeColor : inActiveColor}
                />
              );
            })}
            {/* {pos.map((xy, i) => {
              return (
                //these parens are important in react
                <text
                  key={i + '-text'}
                  x={xy[0]}
                  y={xy[1] - 15}
                  fill={'white'}
                > {data[i].label} </text>
              );
            })} */}
          </svg>
          <Controls
            time={this.state.time}
            togglePlay={this.toggleTimer}
            changeTime={this.setTime}
            isPlaying={this.state.isPlaying}
            nTimePoints={nTimes}
          />
        </div>
      </div>
    );
  }
}
