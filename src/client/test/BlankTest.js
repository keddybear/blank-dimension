// codesandbox: https://codesandbox.io/s/oj31j57xq6
// import React from 'react';

// let nodeRef = React.createRef();

// class Node extends React.PureComponent {
//   constructor(props) {
//     super(props);
//     this.ref = React.createRef();
//   }
//   componentDidMount() {
//     console.log('Mounted Node ' + this.props.value.toString());
//     if (this.props.value === 1) {
//       nodeRef = this.ref;
//     }
//   }

//   componentDidUpdate() {
//     console.log('Updated Node ' + this.props.value.toString());
//     if (this.props.value === 1) {
//       if (nodeRef === this.ref) {
//         console.log('<div> of Node 1 simply moved');
//       } else {
//         console.log('<div> of Node 1 re-recreated');
//       }
//     }
//   }

//   componentWillUnmount() {
//     console.log('nodeRef', nodeRef);
//     console.log('Will unmount Node ' + this.props.value.toString());
//   }

//   render() {
//     console.log('Calling render() on Node ' + this.props.value.toString());
//     return (
//       <div ref={this.ref}><span>{`Node ${this.props.value} at ${this.props.at}`}</span></div>
//     );
//   }
// }

// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       list: [1, 2, 3]
//     };
//     this.onClick = () => {
//       this.setState({
//         list: [2, 1, 3]
//       });
//     };
//     this.renderList = (l) => l.map((x, index) => (
//       <Node key={x.toString()} value={x} at={index} />
//     ));
//   }

//   componentDidUpdate() {
//     console.log('Updated on App');
//     console.log('nodeRef', nodeRef);
//   }

//   render() {
//     console.log('render() on App');
//     return (
//       <div>
//         <h1>Hello CodeSandbox</h1>
//         <h2 onClick={this.onClick}>Click me!</h2>
//         {this.renderList(this.state.list)}
//       </div>
//     );
//   }
// }

// export default BlankTest;
