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
import { Upload } from "./Upload";
import { Files } from "./Files";

import Drawer from "material-ui/Drawer";
import IconButton from "material-ui/IconButton";
import NavigationMenu from "material-ui/svg-icons/navigation/menu";
import ChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import ChevronLeft from "material-ui/svg-icons/navigation/chevron-left";

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
      propagations: [],
      propagationsOnScreen: [],
      fileName: "",
      open: true
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
    this.setTime(savedtime);
    const dataDir = "../assets/data";
  }

  prepareData = json => {
    let neuronData: neuron[] = json.neurons;
    const links: link[] = json.links;
    const propagations: propagation[] = json.propagations;
    this.setState({ propagations });
    const { neurons, ...plotMeta } = plotSetup(neuronData, svgWidth, svgHeight);
    this.setState({ neurons });

    this.setState({ plotMeta });
    const scaledLinks = links.map(link => {
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
  };
  componentDidUpdate() {
    store.set("time", this.state.time);
  }

  startTimer = () => {
    //d3.interval fires every 35ms
    this.timer = d3.interval(elapsed => {
      //save to this.timer so we can use this.timer.stop()
      if (this.state.time < 6000) this.setTime(this.state.time + 1);
      //   this.setState({ time: this.state.time + 1 }); //increment time this way so react will rerender on change
      // this.activationLocations(this.state.propagation, this.state.time);
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
    this.activationLocations(this.state.propagations, value);
  };

  activationLocations(propagations, time) {
    if (!propagations || !time) return;
    //when time is zero
    // const propagationsStarting = propagation[time] || []; //starting activations
    // const propagationsContinuing = this.state.propagationsOnScreen.filter(p => {
    //       return _.get(p, 'targetActivationTime', 0) >= time && _.get(p, 'sourceActivationTime') < time;
    //     })

    let propagationsOnScreen: propagation[] = this.state.propagations.filter(
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
      const pos = d3.interpolateObject(source.posScaled, target.posScaled)(
        progress
      );
      propagationsOnScreen[i].pos = { current: pos, source: source.posScaled };
      propagationsOnScreen[i].type = source.type;
      propagationsOnScreen[i].id = source.id + "-" + target.id;
    });

    this.setState({ propagationsOnScreen });
  }
  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    const { svgWidth, svgHeight } = this.state.plotMeta;
    const {
      neurons,
      links,
      propagation,
      time,
      propagationsOnScreen
    } = this.state;

    if (!svgWidth || !svgHeight)
      return (
        <div>
          <Upload />
          <Files prepareData={this.prepareData} />
        </div>
      );
    const nTimes = 6000; //data[0].spikes.length;
    //render is a react specific function from React.Component.

    return (
      // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.
      //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}
      <div>
        <IconButton
          tooltip="Load Data"
          style={{ position: "absolute", top: 0, right: 0 }}
          onClick={this.handleToggle}
        >
          <NavigationMenu color="white" />
        </IconButton>
        <Drawer width={300} openSecondary={true} open={this.state.open} style={{backgroundColor: 'grey'}}>
          <Upload />{" "}
          <IconButton
            onClick={this.handleToggle}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: 0
            }}
            iconStyle={{
              width: 40,
              height: 40,
              top: -5
            }}
          >
            <ChevronRight />
          </IconButton>
          <Files prepareData={this.prepareData} />
        </Drawer>
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
            {propagationsOnScreen.map((p, i) => {
              return (
                <circle
                  key={i + "-circle"}
                  cx={p.pos.current[0]}
                  cy={p.pos.current[1]}
                  r={2} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  fill={
                    p.type === "excites"
                      ? colors.excitesInActive
                      : colors.inhibitsInActive
                  }
                />
              );
            })}
            {propagationsOnScreen.map((p, i) => {
              return (
                <line
                  key={p.id + "-line"}
                  x1={p.pos.current[0]}
                  y1={p.pos.current[1]}
                  x2={p.pos.source[0]}
                  y2={p.pos.source[1]}
                  stroke={
                    p.type === "excites"
                      ? colors.excitesInActive
                      : colors.inhibitsInActive
                  }
                  strokeWidth={1}
                />
              );
            })}
            {neurons.map((neuron, i) => {
              //note this pos.map begings and ends with {}
              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.
              const isSpiking = _.includes(neuron.spikeTimes, this.state.time); //data has all the cells, each with {label, spikes, pos} fields

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
                  key={neuron.id}
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
