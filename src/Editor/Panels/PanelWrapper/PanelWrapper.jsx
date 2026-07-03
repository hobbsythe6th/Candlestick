/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import DockedPanel from '../DockedPanel/DockedPanel';

class PanelWrapper extends Component {
  
    constructor(props) {
    super(props);
    this.state = { x: null, y: null, dragging: false };
    this.snapX = 0;
    this.snapY = 0;
    this.childPanelData = {classname: null , currentLocation: 'top-default'};
    React.Children.forEach(this.props.children, child => {
      if (child.props && child.props.className) {
        this.childPanelData = {classname: child.props.className};
    }
  });
}

  onMouseDown = (e) => {
    if (e.target.classList.contains("panel-drag-handle")) {
      this.setState({ dragging: true });
      this.snapX = e.clientX - this.state.x;
      this.snapY = e.clientY - this.state.y;
      //enable dragging, add snapping
    }
  };

  onMouseMove = (e) => {
    if (!this.state.dragging) return;
    this.setState({
      x: e.clientX - this.snapX,
      y: e.clientY - this.snapY,
    });
  };

  onMouseUp = () => {
    this.setState({ dragging: false });
    
  };

  getDivToReturn = () => {
      var height = null, width = '100%';
      if(this.childPanelData.classname === "menu-bar-container"){
        height = 24
      }
      if(this.childPanelData.classname === "timeline-container"){
        height = null
      }
      else{
        height = null
      }
      var dragHandle = <div className="panel-drag-handle" style={{
            height: height,
            width: width,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100,
            pointerEvents: 'auto'
            }}/>
      return dragHandle
  };

  render() {
    return (
      <div
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseUp}
        style={{
          position: 'absolute',
          left: this.state.x,
          top: this.state.y,
          zIndex: 10,
          cursor: this.state.dragging ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          display: 'inline-block',
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
        }}
      >
        {this.getDivToReturn()}
        <div style={{ width: 'auto', height: 'auto', pointerEvents: 'auto' }}>
          <DockedPanel>
            {this.props.children}
          </DockedPanel>
        </div>
      </div>
    );
  }
}

export default PanelWrapper