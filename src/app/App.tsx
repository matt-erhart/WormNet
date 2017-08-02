import * as React from "react";
// var data = require("../assets/data/data.json"); //easy way to load in data
import * as d3 from "d3"; //typescript uses this to import, instead of the usual import d3 from 'd3'
import * as _ from 'lodash'
const plotSetup = (data, svgWidth = 1000, svgHeight = 1000) => {
  const xs: number[] = data.map(row => +row.pos[0]); //create an array of x positions
  const ys: number[] = data.map(row => +row.pos[1]);
  const xRange: number[] = d3.extent(xs); // min, max
  const yRange: number[] = d3.extent(ys);
  const xScale = d3.scaleLinear().domain(xRange).range([0, svgWidth]); //convert raw x position data into pixel space
  const yScale = d3.scaleLinear().domain(yRange).range([0, svgHeight]);
  const pos = xs.map((x, i) => {
    //position array to loop over and create a circle for each point
    return [xScale(x), yScale(ys[i])];
  });
  const timeSample = (2.5 * 10) ^ -6;
  return {xs, ys, xRange, yRange, xScale, yScale, pos, svgWidth, svgHeight}
};

//the <any, any> is a typescript thing. It let's us define the allowed/required props (things passed into it), and the state
export class App extends React.Component<any, any> {
  //init class variables
  stopId;
  timer;
  
  constructor() {
    super();
    this.state = {
      //only change with this.setState({var: newValue})
      time: 0,
      toggle: false,
      data: [],
      plotMeta: {}
    };
  }
  componentWillMount() {
    fetch("../assets/data/data.json")
      .then(res => res.json())
      .then(data => {
        this.setState({data})
        const plotMeta = plotSetup(data, 1000, 1000);
        this.setState({plotMeta})
      });
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
    if (this.timer) this.timer.stop();
  };

  render() {
    const {svgWidth, svgHeight, pos} = this.state.plotMeta;
    const {data} = this.state;
    if (!svgWidth || !svgHeight || !pos) return <div>loading</div>
    //render is a react specific function from React.Component.
    return (
      // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.
      //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}
      <div>
        <div>
          <svg width={svgWidth} height={svgHeight}>
            {pos.map((xy, i) => {
              //note this pos.map begings and ends with {}
              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.
              const isSpiking = +data[i].spikes[this.state.time] === 1; //data has all the cells, each with {label, spikes, pos} fields
              return (
                //these parens are important in react
                <circle
                  key={i}
                  cx={xy[0]}
                  cy={xy[1]}
                  r={isSpiking ? 20 : 5} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5
                  name={data[i].label}
                  fill={isSpiking ? "blue" : "grey"} //isSpiking changes from the timer which give us the animation
                />
              );
            })}
          </svg>
        </div>
        <button onClick={this.startTimer}>Play</button>{" "}
        <button onClick={this.pauseTimer}>Pause</button>{" "}
        <span>{this.state.time} / 6000 </span>{" "}
        {/*note how the variable from the class is in {}*/}
        <input
          type="range" //note how you can use a string
          min={0} //or you can put anything else in {}
          max={5999}
          value={this.state.time}
          onChange={e => {
            this.setState({ time: +e.target.value }); //the + converts strings to numbers
          }}
        />
      </div>
    );
  }
}
