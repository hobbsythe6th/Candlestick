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
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import DockedPanel from '../DockedPanel/DockedPanel';

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { x: props.x || 0, y: props.y || 0 };

    this.childPanelData = { classname: null, currentLocation: 'top-default' };
    React.Children.forEach(this.props.children, child => {
      if (child && child.props && child.props.className) {
        this.childPanelData = { classname: child.props.className };
      }
    });

    // visual offsets (panel render will be offset by this many pixels)
    this.yOffset = typeof props.yOffset === 'number' ? props.yOffset : 40;
    this.xOffset = typeof props.xOffset === 'number' ? props.xOffset : 0;

    // native drag bookkeeping (mouse)
    this._nativeDragging = false;
    this._startMouse = { x: 0, y: 0 };
    this._startPos = { x: this.state.x, y: this.state.y };

    // snapping placeholders
    this.snapEnabled = false;
    this.snapGridSize = 16;
    this.snapToBounds = false;

    // bind handlers
    this.onHandleMouseDownCapture = this.onHandleMouseDownCapture.bind(this);
    this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
    this._onWindowMouseUp = this._onWindowMouseUp.bind(this);
  }

  componentDidMount() {
    if (this.props.connectDragPreview) {
      this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this._onWindowMouseMove);
    window.removeEventListener('mouseup', this._onWindowMouseUp);
    document.body.style.userSelect = '';
  }

  get snapZones(){
    let _snapZones = []
    if (this.childPanelData.classname == 'menu-bar-container'){
      _snapZones = ['top-default' , 'bottom']
    }
    else {
      _snapZones = ['top-default' , 'bottom']
    }
  }

  // Capture-phase mousedown to beat other listeners (React-DnD etc.)
  onHandleMouseDownCapture(e) {
    // Only primary mouse button
    if (e.button !== 0) return;

    // stop other handlers from interfering
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }

    this._nativeDragging = true;
    this._startMouse = { x: e.clientX, y: e.clientY };
    this._startPos = { x: this.state.x, y: this.state.y };

    window.addEventListener('mousemove', this._onWindowMouseMove);
    window.addEventListener('mouseup', this._onWindowMouseUp);

    // prevent button selection while dragging
    document.body.style.userSelect = 'none';
  }

  _onWindowMouseMove(e) {
    if (!this._nativeDragging) return;

    const dx = e.clientX - this._startMouse.x;
    const dy = e.clientY - this._startMouse.y;
    let newX = this._startPos.x + dx;
    let newY = this._startPos.y + dy;

    // placeholder for snapping/bounds (no-op unless enabled)
    if (this.snapEnabled) {
      // newX = Math.round(newX / this.snapGridSize) * this.snapGridSize;
      // newY = Math.round(newY / this.snapGridSize) * this.snapGridSize;
    }

    // immediate state update on each mousemove for constant rendering
    this.setState({ x: newX, y: newY });
  }

  _onWindowMouseUp(e) {
    if (!this._nativeDragging) return;
    this._nativeDragging = false;

    window.removeEventListener('mousemove', this._onWindowMouseMove);
    window.removeEventListener('mouseup', this._onWindowMouseUp);

    document.body.style.userSelect = '';

    // placeholder: snapping on release could be applied here
    if (this.snapEnabled) {
      // const snappedX = Math.round(this.state.x / this.snapGridSize) * this.snapGridSize;
      // const snappedY = Math.round(this.state.y / this.snapGridSize) * this.snapGridSize;
      // this.setState({ x: snappedX, y: snappedY });
    }
  }

  render() {
    // connectDragSource is applied to the DockedPanel so the handle is not wrapped.
    const { connectDragSource, connectDropTarget, isDragging } = this.props;

    const wrapperStyle = {
      position: 'absolute',
      left: this.state.x + this.xOffset,
      top: this.state.y + this.yOffset,
      opacity: isDragging ? 0.25 : 1,
      cursor: 'move',
      zIndex: 10
    };

    const handleStyle = {
      position: 'fixed',
      left: this.state.x,
      top: this.state.y + this.yOffset,
      height: 40,
      width: '100%',
      cursor: 'grab',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      zIndex: 100000,
      pointerEvents: 'auto',
      background: 'transparent'
    };

    const handle = (
      <div
        className="panel-drag-handle"
        style={handleStyle}
        onMouseDownCapture={this.onHandleMouseDownCapture}
      />
    );

    const panelContent = connectDragSource(
      <div style={{ display: 'inline-block' }}>
        <DockedPanel>{this.props.children}</DockedPanel>
      </div>
    );

    return connectDropTarget(
      <div style={wrapperStyle}>
        {handle}
        {panelContent}
      </div>
    );
  }
}

// Drag source: return starting x,y and pointerOffset so future DragLayer/snapping can use them 
const panelSource = {
  beginDrag(props, monitor) {
    const sourceClient = monitor.getSourceClientOffset();
    const client = monitor.getClientOffset();
    const pointerOffset = (client && sourceClient)
      ? { x: client.x - sourceClient.x, y: client.y - sourceClient.y }
      : { x: 0, y: 0 };

    return {
      classname: props.classname || (props.childPanelData && props.childPanelData.classname),
      x: props.x || 0,
      y: props.y || 0,
      width: props.width || 320,
      height: props.height || 200,
      pointerOffset
    };
  },

  endDrag(props, monitor, component) {
    const diff = monitor.getDifferenceFromInitialOffset();
    if (diff && component) {
      const newX = component.state.x + diff.x;
      const newY = component.state.y + diff.y;
      component.setState({ x: newX, y: newY });
    }
  }
};

// Drop target: keep hover/drop present for future snapping/dropping logic (currently not working)
const panelTarget = {
  hover(props, monitor, component) {
    // placeholder for future hover/snapping logic
  },
  drop(props, monitor, component) {
    // placeholder for future drop handling
  }
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
    diffOffset: monitor.getDifferenceFromInitialOffset()
  };
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DragSource('PANEL', panelSource, collectSource)(
  DropTarget('PANEL', panelTarget, collectTarget)(PanelWrapper)
);