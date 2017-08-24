import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import styled from "styled-components";
import { colors } from "./constants";
import { storage, database } from "./index";
var uid = require("uid-safe");

export class Upload extends React.Component<any, any> {
  handleUpload(e) {
    const file = e.nativeEvent.target.files[0];
    const fileName = file.name.replace(
      ".json",
      "_" + Date.now() + ".json"
    );
    const task = storage.ref("data/" + fileName).put(file);

    task.on(
      "state_changed",
      function progress(snap) {
        console.log(snap);
      },
      function error(err) {
        console.log(err);
      },
      function complete() {
        database.ref().child("json_files").push({ fileName: fileName });
      }
    );
  }

  render() {
    return (
      <div>
        <input type="file" onChange={e => this.handleUpload(e)} />
      </div>
    );
  }
}
