import * as React from "react";
// var data = require("../assets/data/data.json"); //easy way to load in data
import * as d3 from "d3"; //typescript uses this to import, instead of the usual import d3 from 'd3'
import * as _ from "lodash";
import styled from "styled-components";
import {colors} from "./constants";

interface NeuronProps {
  active?: boolean;
}

let NeuronCss = styled.circle`
  fill: ${(p: NeuronProps) =>
    p.active ? colors.neuronActive : colors.neuronInActive};
`;

export default NeuronCss;
