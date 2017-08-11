import * as React from "react";
// var data = require("../assets/data/data.json"); //easy way to load in data
import * as d3 from "d3"; //typescript uses this to import, instead of the usual import d3 from 'd3'
import * as _ from "lodash";
import styled from "styled-components";
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
  xScale;
  yScale;
  constructor() {
    super();
    this.state = {
      //only change with this.setState({var: newValue})
      time: 0,
      isPlaying: false,
      data: [],
      plotMeta: {},
      links: [],
      propagation: [],
      propagationsOnScreen: []
    };
  }
  componentWillMount() {
    const savedtime = store.get("time") || 0;
    this.setState({ time: savedtime });

    Promise.all([
      fetch("../assets/data/data.json").then(res => res.json()),
      fetch("../assets/data/links.json").then(res => res.json()),
      fetch("../assets/data/propagation.json").then(res => res.json())
    ]).then(json => {
      const data = json[0];
      const links = json[1];
      const propagation = json[2];
      this.setState({ propagation });
      this.setState({ data });
      const { xScale, yScale, ...plotMeta } = plotSetup(
        data,
        svgWidth,
        svgHeight
      );
      this.xScale = xScale;
      this.yScale = yScale;
      this.setState({ plotMeta });

      const scaledLinks = links.map(link => {
        const sx = this.xScale(link.sourcePos[0]);
        const sy = this.yScale(link.sourcePos[1]);
        const tx = this.xScale(link.targetPos[0]);
        const ty = this.yScale(link.targetPos[1]);
        return { sx, sy, tx, ty };
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
    }, 15);
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

    let propagationsOnScreen = _.flatten(this.state.propagation).filter(p => {
      return _.get(p, 'targetActivationTime') >= time && _.get(p, 'sourceActivationTime') < time;
    })
    propagationsOnScreen.forEach((p,i) => {
      const progress = (time - p.sourceActivationTime) / p.timeDiff;
      const pos = d3.interpolateObject(p.sourcePos, p.targetPos)(progress);
      propagationsOnScreen[i].interpPos = [this.xScale(+pos[0]), this.yScale(+pos[1])]
    });
    this.setState({ propagationsOnScreen });
  }

  activationLocationOnScrub(){
    //
  }

  render() {
    const { svgWidth, svgHeight, pos } = this.state.plotMeta;
    const { data, links, propagation, time, propagationsOnScreen } = this.state;
    if (!svgWidth || !svgHeight || !pos || !propagation) return <div>loading</div>;
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
              const { sx, sy, tx, ty } = link;
              return (
                <line
                  key={i}
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke={colors.connector}
                  style={{ opacity: linkOpacity }}
                />
              );
            })}
            {propagationsOnScreen.map((p,i)=> {
              return (
                <circle
                  key={p.id}
                  cx={p.interpPos[0]}
                  cy={p.interpPos[1]}
                  r={8} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  fill={p.sourceType === 'excites' ? colors.excitesPropagation : colors.inhibitsPropagation}
                />
              )
            })}
            {pos.map((xy, i) => {
              //note this pos.map begings and ends with {}
              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.
              const isSpiking = +data[i].spikes[this.state.time] === 1; //data has all the cells, each with {label, spikes, pos} fields
              const activeColor = data[i].type === 'excites'? colors.excitesActive : colors.inhibitsActive;
              const inActiveColor = data[i].type === 'excites'? colors.excitesInActive : colors.inhibitsInActive;

              return (
                //these parens are important in react
                <circle
                  key={i}
                  cx={xy[0]}
                  cy={xy[1]}
                  r={isSpiking ? neuronRadius.active : neuronRadius.inActive} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  name={data[i].label}
                  fill={isSpiking ? activeColor : inActiveColor}
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
