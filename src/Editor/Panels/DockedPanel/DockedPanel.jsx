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

import React, { PureComponent } from 'react';
import Draggable from 'react-draggable';
import './_dockedpanel.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class DockedPanel extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      position: { x: 0, y: 0 },
    };

    this.panelRef = React.createRef();
  }

  handleDrag = (event, data) => {
    this.setState({
      position: { x: data.x, y: data.y },
    });
  };

  render() {
    const panelContent = (
      <div className="docked-panel" ref={this.panelRef}>
        {this.props.showOverlay && <div className="docked-panel-overlay" />}
        {this.props.children}
      </div>
    );

    if (!this.props.draggable) {
      return panelContent;
    }
//todo: put all panels on one canvas, make project canvas only draggable with right click while dragging
    return (
      <Draggable
        bounds={false}
        position={this.state.position}
        onDrag={this.handleDrag}
        onStop={this.handleDrag}
      >
        {panelContent}
      </Draggable>
    );
  }
}

export default DockedPanel
