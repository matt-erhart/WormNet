module.exports = { contents: "\"use strict\";\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = Object.setPrototypeOf ||\r\n        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nvar __rest = (this && this.__rest) || function (s, e) {\r\n    var t = {};\r\n    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)\r\n        t[p] = s[p];\r\n    if (s != null && typeof Object.getOwnPropertySymbols === \"function\")\r\n        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)\r\n            t[p[i]] = s[p[i]];\r\n    return t;\r\n};\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar React = require(\"react\");\r\n// var data = require(\"../assets/data/data.json\"); //easy way to load in data\r\nvar d3 = require(\"d3\"); //typescript uses this to import, instead of the usual import d3 from 'd3'\r\nvar _ = require(\"lodash\");\r\nvar store = require(\"store\");\r\nvar constants_1 = require(\"./constants\");\r\nvar constants_2 = require(\"./constants\");\r\nvar Controls_1 = require(\"./Controls\");\r\nvar plotSetup = function (neurons, svgWidth, svgHeight) {\r\n    if (svgWidth === void 0) { svgWidth = 1000; }\r\n    if (svgHeight === void 0) { svgHeight = 1000; }\r\n    var xs = neurons.map(function (row) { return +row.pos[0]; }); //create an array of x positions\r\n    var ys = neurons.map(function (row) { return +row.pos[1]; });\r\n    var xRange = d3.extent(xs); // min, max\r\n    var yRange = d3.extent(ys);\r\n    var xScale = d3\r\n        .scaleLinear()\r\n        .domain(xRange)\r\n        .range([0 + constants_1.svgPadding, svgWidth - constants_1.svgPadding]); //convert raw x position data into pixel space\r\n    var yScale = d3\r\n        .scaleLinear()\r\n        .domain(yRange)\r\n        .range([0 + constants_1.svgPadding, svgHeight - constants_1.svgPadding]);\r\n    neurons.forEach(function (neuron, i) {\r\n        neurons[i].posScaled = [xScale(neuron.pos[0]), yScale(neuron.pos[1])];\r\n    });\r\n    // return { xs, ys, xRange, yRange, xScale, yScale, pos, svgWidth, svgHeight };\r\n    return { neurons: neurons, svgWidth: svgWidth, svgHeight: svgHeight };\r\n};\r\n//the <any, any> is a typescript thing. It let's us define the allowed/required props (things passed into it), and the state\r\nvar App = (function (_super) {\r\n    __extends(App, _super);\r\n    function App() {\r\n        var _this = _super.call(this) || this;\r\n        _this.startTimer = function () {\r\n            //d3.interval fires every 35ms\r\n            _this.timer = d3.interval(function (elapsed) {\r\n                //save to this.timer so we can use this.timer.stop()\r\n                if (_this.state.time < _this.state.data[0].spikes.length)\r\n                    _this.setState({ time: _this.state.time + 1 }); //increment time this way so react will rerender on change\r\n                _this.activationLocations(_this.state.propagation, _this.state.time);\r\n            }, 10);\r\n        };\r\n        _this.pauseTimer = function () {\r\n            _this.timer.stop();\r\n            _this.setState({ isPlaying: false });\r\n        };\r\n        _this.toggleTimer = function () {\r\n            if (_this.state.isPlaying) {\r\n                _this.pauseTimer();\r\n            }\r\n            else {\r\n                _this.startTimer();\r\n            }\r\n            _this.setState({ isPlaying: !_this.state.isPlaying });\r\n        };\r\n        _this.setTime = function (value) {\r\n            _this.setState({ time: value });\r\n            _this.activationLocations(_this.state.propagation, value);\r\n        };\r\n        _this.state = {\r\n            //only change with this.setState({var: newValue})\r\n            time: 0,\r\n            isPlaying: false,\r\n            neurons: [],\r\n            plotMeta: {},\r\n            links: [],\r\n            propagation: [],\r\n            propagationsOnScreen: []\r\n        };\r\n        return _this;\r\n    }\r\n    App.prototype.getSourceAndTargetNeurons = function (neurons, sourceId, targetId) {\r\n        var source = _.find(neurons, function (neuron) { return neuron.id.toLowerCase() === sourceId; });\r\n        var target = _.find(neurons, function (neuron) { return neuron.id.toLowerCase() === targetId; });\r\n        return { source: source, target: target };\r\n    };\r\n    App.prototype.componentWillMount = function () {\r\n        var _this = this;\r\n        var savedtime = store.get(\"time\") || 0;\r\n        this.setState({ time: savedtime });\r\n        var dataDir = \"../assets/data\";\r\n        Promise.all([\r\n            fetch(dataDir + \"/feed_json.json\").then(function (res) { return res.json(); })\r\n            // fetch(dataDir + \"/json/links.json\").then(res => res.json()),\r\n            // fetch(dataDir + \"/json/propagation.json\").then(res => res.json())\r\n        ]).then(function (json) {\r\n            var neuronData = json[0].neurons;\r\n            var links = json[0].links;\r\n            var propagation = json[0].propagation;\r\n            _this.setState({ propagation: propagation });\r\n            var _a = plotSetup(neuronData, constants_2.svgWidth, constants_2.svgHeight), neurons = _a.neurons, plotMeta = __rest(_a, [\"neurons\"]);\r\n            _this.setState({ neurons: neurons });\r\n            // this.xScale = xScale;\r\n            // this.yScale = yScale;\r\n            _this.setState({ plotMeta: plotMeta });\r\n            var scaledLinks = links.map(function (link) {\r\n                // const sx = this.xScale(link.sourcePos[0]);\r\n                // const sy = this.yScale(link.sourcePos[1]);\r\n                // const tx = this.xScale(link.targetPos[0]);\r\n                // const ty = this.yScale(link.targetPos[1]);\r\n                var _a = _this.getSourceAndTargetNeurons(neurons, link.source.id.toLowerCase(), link.target.id.toLowerCase()), source = _a.source, target = _a.target;\r\n                var sx = source.posScaled[0];\r\n                var sy = source.posScaled[1];\r\n                var tx = target.posScaled[0];\r\n                var ty = target.posScaled[1];\r\n                return { sx: sx, sy: sy, tx: tx, ty: ty, id: link.id };\r\n            });\r\n            _this.setState({ links: scaledLinks });\r\n        });\r\n    };\r\n    App.prototype.componentDidUpdate = function () {\r\n        store.set(\"time\", this.state.time);\r\n    };\r\n    App.prototype.activationLocations = function (propagation, time) {\r\n        var _this = this;\r\n        if (!propagation || !time)\r\n            return;\r\n        //when time is zero\r\n        // const propagationsStarting = propagation[time] || []; //starting activations\r\n        // const propagationsContinuing = this.state.propagationsOnScreen.filter(p => {\r\n        //       return _.get(p, 'targetActivationTime', 0) >= time && _.get(p, 'sourceActivationTime') < time;\r\n        //     })\r\n        var propagationsOnScreen = this.state.propagation.filter(function (p) {\r\n            return (_.get(p, \"target.activationTime\") >= time &&\r\n                _.get(p, \"source.activationTime\") < time);\r\n        });\r\n        propagationsOnScreen.forEach(function (p, i) {\r\n            var progress = (time - p.source.activationTime) /\r\n                (p.target.activationTime - p.source.activationTime);\r\n            var _a = _this.getSourceAndTargetNeurons(_this.state.neurons, p.source.id, p.target.id), source = _a.source, target = _a.target;\r\n            var pos = d3.interpolateObject(source.posScaled, target.posScaled)(progress);\r\n            propagationsOnScreen[i].pos = pos;\r\n        });\r\n        this.setState({ propagationsOnScreen: propagationsOnScreen });\r\n    };\r\n    App.prototype.activationLocationOnScrub = function () {\r\n        //\r\n    };\r\n    App.prototype.render = function () {\r\n        var _this = this;\r\n        var _a = this.state.plotMeta, svgWidth = _a.svgWidth, svgHeight = _a.svgHeight;\r\n        var _b = this.state, neurons = _b.neurons, links = _b.links, propagation = _b.propagation, time = _b.time, propagationsOnScreen = _b.propagationsOnScreen;\r\n        if (!svgWidth || !svgHeight)\r\n            return React.createElement(\"div\", null, \"loading\");\r\n        var nTimes = 6000; //data[0].spikes.length;\r\n        //render is a react specific function from React.Component.\r\n        return (\r\n        // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.\r\n        //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}\r\n        React.createElement(\"div\", null,\r\n            React.createElement(\"div\", null,\r\n                React.createElement(\"svg\", { width: \"100%\", height: \"100%\", style: { maxHeight: \"80vh\" }, viewBox: \"0,0, \" + svgWidth + \", \" + svgHeight },\r\n                    links.map(function (link, i) {\r\n                        var sx = link.sx, sy = link.sy, tx = link.tx, ty = link.ty, id = link.id;\r\n                        return (React.createElement(\"line\", { key: id, x1: sx, y1: sy, x2: tx, y2: ty, stroke: constants_2.colors.connector, strokeWidth: 2, style: { opacity: constants_2.linkOpacity } }));\r\n                    }),\r\n                    neurons.map(function (neuron, i) {\r\n                        //note this pos.map begings and ends with {}\r\n                        //.map is how we loop over arrays. in this case, we return a circle for each posisiton.\r\n                        var isSpiking = _.includes(neuron.spikes, _this.state.time); //data has all the cells, each with {label, spikes, pos} fields\r\n                        var activeColor = neuron.type === \"excites\"\r\n                            ? constants_2.colors.excitesActive\r\n                            : constants_2.colors.inhibitsActive;\r\n                        var inActiveColor = neuron.type === \"excites\"\r\n                            ? constants_2.colors.excitesInActive\r\n                            : constants_2.colors.inhibitsInActive;\r\n                        return (\r\n                        //these parens are important in react\r\n                        React.createElement(\"circle\", { key: i, cx: neuron.posScaled[0], cy: neuron.posScaled[1], r: isSpiking ? constants_2.neuronRadius.active : constants_2.neuronRadius.inActive, name: neuron.label, fill: isSpiking ? activeColor : inActiveColor }));\r\n                    })),\r\n                React.createElement(Controls_1.Controls, { time: this.state.time, togglePlay: this.toggleTimer, changeTime: this.setTime, isPlaying: this.state.isPlaying, nTimePoints: nTimes }))));\r\n    };\r\n    return App;\r\n}(React.Component));\r\nexports.App = App;\r\n//# sourceMappingURL=App.js.map",
dependencies: ["react","d3","lodash","store","./constants","./constants","./Controls"],
sourceMap: "{\"version\":3,\"file\":\"App.jsx\",\"sourceRoot\":\"\",\"sources\":[\"/src/App.tsx\"],\"names\":[],\"mappings\":\"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\",\"sourcesContent\":[\"import * as React from \\\"react\\\";\\r\\n// var data = require(\\\"../assets/data/data.json\\\"); //easy way to load in data\\r\\nimport * as d3 from \\\"d3\\\"; //typescript uses this to import, instead of the usual import d3 from 'd3'\\r\\nimport * as _ from \\\"lodash\\\";\\r\\nimport styled from \\\"styled-components\\\";\\r\\nimport { neuron, link, propagation, jsonOutput } from \\\"./interfaces\\\";\\r\\nvar store = require(\\\"store\\\");\\r\\nimport { svgPadding as pad } from \\\"./constants\\\";\\r\\nimport {\\r\\n  neuronRadius,\\r\\n  svgWidth,\\r\\n  svgHeight,\\r\\n  colors,\\r\\n  linkOpacity\\r\\n} from \\\"./constants\\\";\\r\\nimport { Controls } from \\\"./Controls\\\";\\r\\n\\r\\nconst plotSetup = (neurons, svgWidth = 1000, svgHeight = 1000) => {\\r\\n  const xs: number[] = neurons.map(row => +row.pos[0]); //create an array of x positions\\r\\n  const ys: number[] = neurons.map(row => +row.pos[1]);\\r\\n  const xRange: number[] = d3.extent(xs); // min, max\\r\\n  const yRange: number[] = d3.extent(ys);\\r\\n  const xScale = d3\\r\\n    .scaleLinear()\\r\\n    .domain(xRange)\\r\\n    .range([0 + pad, svgWidth - pad]); //convert raw x position data into pixel space\\r\\n  const yScale = d3\\r\\n    .scaleLinear()\\r\\n    .domain(yRange)\\r\\n    .range([0 + pad, svgHeight - pad]);\\r\\n\\r\\n  neurons.forEach((neuron, i) => {\\r\\n    neurons[i].posScaled = [xScale(neuron.pos[0]), yScale(neuron.pos[1])];\\r\\n  });\\r\\n  // return { xs, ys, xRange, yRange, xScale, yScale, pos, svgWidth, svgHeight };\\r\\n  return { neurons, svgWidth, svgHeight };\\r\\n};\\r\\n\\r\\n//the <any, any> is a typescript thing. It let's us define the allowed/required props (things passed into it), and the state\\r\\nexport class App extends React.Component<any, any> {\\r\\n  //init class variables\\r\\n  stopId;\\r\\n  timer;\\r\\n  xScale;\\r\\n  yScale;\\r\\n  constructor() {\\r\\n    super();\\r\\n    this.state = {\\r\\n      //only change with this.setState({var: newValue})\\r\\n      time: 0,\\r\\n      isPlaying: false,\\r\\n      neurons: [],\\r\\n      plotMeta: {},\\r\\n      links: [],\\r\\n      propagation: [],\\r\\n      propagationsOnScreen: []\\r\\n    };\\r\\n  }\\r\\n  getSourceAndTargetNeurons(neurons, sourceId, targetId) {\\r\\n    const source = _.find(\\r\\n      neurons,\\r\\n      (neuron: neuron) => neuron.id.toLowerCase() === sourceId\\r\\n    );\\r\\n    const target = _.find(\\r\\n      neurons,\\r\\n      (neuron: neuron) => neuron.id.toLowerCase() === targetId\\r\\n    );\\r\\n    return { source, target };\\r\\n  }\\r\\n\\r\\n  componentWillMount() {\\r\\n    const savedtime = store.get(\\\"time\\\") || 0;\\r\\n    this.setState({ time: savedtime });\\r\\n    const dataDir = \\\"../assets/data\\\";\\r\\n    Promise.all([\\r\\n      fetch(dataDir + \\\"/feed_json.json\\\").then(res => res.json())\\r\\n      // fetch(dataDir + \\\"/json/links.json\\\").then(res => res.json()),\\r\\n      // fetch(dataDir + \\\"/json/propagation.json\\\").then(res => res.json())\\r\\n    ]).then(json => {\\r\\n      let neuronData: neuron[] = json[0].neurons;\\r\\n      const links: link[] = json[0].links;\\r\\n      const propagation: propagation[] = json[0].propagation;\\r\\n      this.setState({ propagation });\\r\\n      const { neurons, ...plotMeta } = plotSetup(\\r\\n        neuronData,\\r\\n        svgWidth,\\r\\n        svgHeight\\r\\n      );\\r\\n      this.setState({ neurons });\\r\\n\\r\\n      // this.xScale = xScale;\\r\\n      // this.yScale = yScale;\\r\\n      this.setState({ plotMeta });\\r\\n      const scaledLinks = links.map(link => {\\r\\n        // const sx = this.xScale(link.sourcePos[0]);\\r\\n        // const sy = this.yScale(link.sourcePos[1]);\\r\\n        // const tx = this.xScale(link.targetPos[0]);\\r\\n        // const ty = this.yScale(link.targetPos[1]);\\r\\n        const { source, target } = this.getSourceAndTargetNeurons(\\r\\n          neurons,\\r\\n          link.source.id.toLowerCase(),\\r\\n          link.target.id.toLowerCase()\\r\\n        );\\r\\n        const sx = source.posScaled[0];\\r\\n        const sy = source.posScaled[1];\\r\\n        const tx = target.posScaled[0];\\r\\n        const ty = target.posScaled[1];\\r\\n        return { sx, sy, tx, ty, id: link.id };\\r\\n      });\\r\\n      this.setState({ links: scaledLinks });\\r\\n    });\\r\\n  }\\r\\n\\r\\n  componentDidUpdate() {\\r\\n    store.set(\\\"time\\\", this.state.time);\\r\\n  }\\r\\n\\r\\n  startTimer = () => {\\r\\n    //d3.interval fires every 35ms\\r\\n    this.timer = d3.interval(elapsed => {\\r\\n      //save to this.timer so we can use this.timer.stop()\\r\\n      if (this.state.time < this.state.data[0].spikes.length)\\r\\n        this.setState({ time: this.state.time + 1 }); //increment time this way so react will rerender on change\\r\\n      this.activationLocations(this.state.propagation, this.state.time);\\r\\n    }, 10);\\r\\n  };\\r\\n\\r\\n  pauseTimer = () => {\\r\\n    this.timer.stop();\\r\\n    this.setState({ isPlaying: false });\\r\\n  };\\r\\n\\r\\n  toggleTimer = () => {\\r\\n    if (this.state.isPlaying) {\\r\\n      this.pauseTimer();\\r\\n    } else {\\r\\n      this.startTimer();\\r\\n    }\\r\\n    this.setState({ isPlaying: !this.state.isPlaying });\\r\\n  };\\r\\n  setTime = value => {\\r\\n    this.setState({ time: value });\\r\\n    this.activationLocations(this.state.propagation, value);\\r\\n  };\\r\\n\\r\\n  activationLocations(propagation, time) {\\r\\n    if (!propagation || !time) return;\\r\\n    //when time is zero\\r\\n    // const propagationsStarting = propagation[time] || []; //starting activations\\r\\n    // const propagationsContinuing = this.state.propagationsOnScreen.filter(p => {\\r\\n    //       return _.get(p, 'targetActivationTime', 0) >= time && _.get(p, 'sourceActivationTime') < time;\\r\\n    //     })\\r\\n\\r\\n    let propagationsOnScreen: propagation[] = this.state.propagation.filter(\\r\\n      p => {\\r\\n        return (\\r\\n          _.get(p, \\\"target.activationTime\\\") >= time &&\\r\\n          _.get(p, \\\"source.activationTime\\\") < time\\r\\n        );\\r\\n      }\\r\\n    );\\r\\n    propagationsOnScreen.forEach((p: any, i) => {\\r\\n      const progress =\\r\\n        (time - p.source.activationTime) /\\r\\n        (p.target.activationTime - p.source.activationTime);\\r\\n      const { source, target } = this.getSourceAndTargetNeurons(\\r\\n        this.state.neurons,\\r\\n        p.source.id,\\r\\n        p.target.id\\r\\n      );\\r\\n      const pos = d3.interpolateObject(source.posScaled, target.posScaled)(progress);\\r\\n      propagationsOnScreen[i].pos = pos;\\r\\n    });\\r\\n    this.setState({ propagationsOnScreen });\\r\\n  }\\r\\n\\r\\n  activationLocationOnScrub() {\\r\\n    //\\r\\n  }\\r\\n\\r\\n  render() {\\r\\n    const { svgWidth, svgHeight } = this.state.plotMeta;\\r\\n    const {\\r\\n      neurons,\\r\\n      links,\\r\\n      propagation,\\r\\n      time,\\r\\n      propagationsOnScreen\\r\\n    } = this.state;\\r\\n    if (!svgWidth || !svgHeight) return <div>loading</div>;\\r\\n    const nTimes = 6000; //data[0].spikes.length;\\r\\n    //render is a react specific function from React.Component.\\r\\n\\r\\n    return (\\r\\n      // the parens after return are important. also need to wrap all this html-like code in one element. a div in this case, as usual.\\r\\n      //the bellow code is jsx which is html tags that work in js. if you want to use variables, functions, or standard js from above put it in {}\\r\\n      <div>\\r\\n        <div>\\r\\n          <svg\\r\\n            width={\\\"100%\\\"}\\r\\n            height={\\\"100%\\\"}\\r\\n            style={{ maxHeight: \\\"80vh\\\" }}\\r\\n            viewBox={`0,0, ${svgWidth}, ${svgHeight}`}\\r\\n          >\\r\\n            {links.map((link, i) => {\\r\\n              const { sx, sy, tx, ty, id } = link;\\r\\n              return (\\r\\n                <line\\r\\n                  key={id}\\r\\n                  x1={sx}\\r\\n                  y1={sy}\\r\\n                  x2={tx}\\r\\n                  y2={ty}\\r\\n                  stroke={colors.connector}\\r\\n                  strokeWidth={2}\\r\\n                  style={{ opacity: linkOpacity }}\\r\\n                />\\r\\n              );\\r\\n            })}\\r\\n            {/* {propagationsOnScreen.map((p,i)=> {\\r\\n              return (\\r\\n                <circle\\r\\n                  key={p.id}\\r\\n                  cx={p.interpPos[0]}\\r\\n                  cy={p.interpPos[1]}\\r\\n                  r={2} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5\\r\\n                  fill={p.sourceType === 'excites' ? colors.excitesPropagation : colors.inhibitsPropagation}\\r\\n                />\\r\\n              )\\r\\n            })} */}\\r\\n            {neurons.map((neuron, i) => {\\r\\n              //note this pos.map begings and ends with {}\\r\\n              //.map is how we loop over arrays. in this case, we return a circle for each posisiton.\\r\\n              const isSpiking = _.includes(neuron.spikes, this.state.time); //data has all the cells, each with {label, spikes, pos} fields\\r\\n              const activeColor =\\r\\n                neuron.type === \\\"excites\\\"\\r\\n                  ? colors.excitesActive\\r\\n                  : colors.inhibitsActive;\\r\\n              const inActiveColor =\\r\\n                neuron.type === \\\"excites\\\"\\r\\n                  ? colors.excitesInActive\\r\\n                  : colors.inhibitsInActive;\\r\\n\\r\\n              return (\\r\\n                //these parens are important in react\\r\\n                <circle\\r\\n                  key={i}\\r\\n                  cx={neuron.posScaled[0]}\\r\\n                  cy={neuron.posScaled[1]}\\r\\n                  r={isSpiking ? neuronRadius.active : neuronRadius.inActive} // this ? : business is called a ternary operator. means if isspiking is true return 20 else return 5\\r\\n                  name={neuron.label}\\r\\n                  fill={isSpiking ? activeColor : inActiveColor}\\r\\n                />\\r\\n              );\\r\\n            })}\\r\\n            {/* {pos.map((xy, i) => {\\r\\n              return (\\r\\n                //these parens are important in react\\r\\n                <text\\r\\n                  key={i + '-text'}\\r\\n                  x={xy[0]}\\r\\n                  y={xy[1] - 15}\\r\\n                  fill={'white'}\\r\\n                > {data[i].label} </text>\\r\\n              );\\r\\n            })} */}\\r\\n          </svg>\\r\\n          <Controls\\r\\n            time={this.state.time}\\r\\n            togglePlay={this.toggleTimer}\\r\\n            changeTime={this.setTime}\\r\\n            isPlaying={this.state.isPlaying}\\r\\n            nTimePoints={nTimes}\\r\\n          />\\r\\n        </div>\\r\\n      </div>\\r\\n    );\\r\\n  }\\r\\n}\\r\\n\"]}",
headerContent: undefined,
mtime: 1503539919870,
devLibsRequired : undefined
};