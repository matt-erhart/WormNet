import * as React from "react"


export class Line extends React.Component<any,any> {

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.nLoaded !== nextProps.nLoaded
  }
  
  render(){
    const {nLoaded, ...props} = this.props;
    return (
      <line {...props} />
    )
  }
}
export class PropagationCircle extends React.Component<any,any> {

  shouldComponentUpdate(nextProps, nextState) {
    const keys = ['cx', 'cy'];
    const update = keys.map(k => {
      return this.props[k] !== nextProps[k]
    }).some((element, index, array) => {return element})
    
    return update
  }
  
  render(){
    const {cx, cy, ...props} = this.props;
    return (
      <circle cx={0} cy={0} style={{transform: `translate(${cx}px,${cy}px)`, backfaceVisibility: 'hidden'}} {...props} />
    )
  }
}
export class PropagationLine extends React.Component<any,any> {

  shouldComponentUpdate(nextProps, nextState) {
    const keys = ['x1', 'y1'];
    const update = keys.map(k => {
      return this.props[k] !== nextProps[k]
    }).some((element, index, array) => {return element})
    
    return update
  }
  
  render(){
    const {...props} = this.props;
    return (
      <line {...props} />
    )
  }
}
export class Neuron extends React.Component<any,any> {

  shouldComponentUpdate(nextProps, nextState) {
    const keys = ['r'];
    const update = keys.map(k => {
      return this.props[k] !== nextProps[k]
    }).some((element, index, array) => {return element})
    
    return update
  }
  
  render(){
    const {...props} = this.props;
    return (
      <circle {...props} />
    )
  }
}
