import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import styled from "styled-components";
import { colors } from "./constants";
import { storage, database } from "./index";
var uid = require("uid-safe");
import * as _ from "lodash";
export class Files extends React.Component<any, any> {
  fbListener;
  constructor() {
    super();
    this.state = { fileNames: [] };
  }

  componentDidMount() {
    var ref = database.ref("json_files");
    this.fbListener = ref.on("value", snap => {
      this.setState({ fileNames: _.map(snap.val(), x => (x as any).fileName) });
      if (this.state.fileNames[0]) this.handleDownload({}, this.state.fileNames[0]);
    });
  }
  handleDownload(e, fileName) {
    storage.ref("data/" + fileName).getDownloadURL().then(url => {
      fetch(url).then(res => res.json()).then(json => {
        this.props.prepareData(json);
      });
    });
  }
  componentWillUnmount() {
    if (typeof this.fbListener.off === 'function') this.fbListener.off();
  }

  render() {
    return (
      <ul>
        {this.state.fileNames &&
          this.state.fileNames.map(fileName => {
            return (
              <li
                key={fileName}
                style={{ color: "black" }}
                onClick={e => this.handleDownload(e, fileName)}
              >
                {fileName}
              </li>
            );
          })}
      </ul>
    );
  }
}
