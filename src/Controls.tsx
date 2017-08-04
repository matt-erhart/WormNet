import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import styled from "styled-components";
import { colors } from "./constants";
interface ControlProps {
  time: number;
  togglePlay: Function;
  changeTime: Function;
  isPlaying: boolean;
}
console.log(IconButton);
// const FlexContainer = styled.div`
//   display: flex;
//   flex-flow: row;
//   align-content: center;
//   align-items: center;
//   justify-content: center;
// `;

// const Play = styled(PlayArrow)`
// width: 100;
// height: 100;
// display: 'inline-block';
// `;

const IconStyles = { width: 100, height: 100, display: "inline-block" };

const PlayPause = isPlaying => {
  if (isPlaying) {
    return (
      <Pause
        color={colors.controls}
        style={{ width: 100, height: 100, display: "inline-block", padding: 0 }}
      />
    );
  } else {
    return (
      <PlayArrow
        color={colors.controls}
        style={{ width: 100, height: 100, display: "inline-block", padding: 0 }}
      />
    );
  }
};

export const Controls: React.SFC<ControlProps> = (props: ControlProps) => {
  return (
    <div style={{ display: "flex", alignContent: 'center', justifyContent: "center" }}>
      <div>
        {props.isPlaying &&
          <Pause
            onClick={e => props.togglePlay(e.target.value)}
            color={colors.controls}
            style={IconStyles}
          />}
        {!props.isPlaying &&
          <PlayArrow
            onClick={e => props.togglePlay(e.target.value)}
            color={colors.controls}
            style={IconStyles}
          />}
        <Slider
          style={{ width: "50vw", display: "inline-block", height: "83px" }}
          min={0}
          max={6000}
          step={1}
          value={props.time}
          onChange={(event, value) => {
            props.changeTime(value);
          }}
        />
              <div style={{color: colors.neuronInActive, textAlign: 'center', fontSize: '16pt'}}>{props.time} / 6000 </div>

      </div>

    </div>
  );
};
