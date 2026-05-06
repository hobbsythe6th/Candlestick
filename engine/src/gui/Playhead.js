/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */
// I JUST BROKE IT XD
//(it's in the paper.js bit)
Wick.GUIElement.Playhead = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
    }

    draw (item , i = 0) {
        super.draw();

        var ctx = this.ctx;

        var margin = 0;
        if(this.project.frameSizeMode === 'small') {
            margin = 2;
        } else if (this.project.frameSizeMode === 'normal') {
            margin = 8;
        } else if (this.project.frameSizeMode === 'large') {
            margin = 20;
        }

        var height = Wick.GUIElement.NUMBER_LINE_HEIGHT - 2;
        var width = this.gridCellWidth - margin * 2;

        if(item == 'playhead'){
        ctx.fillStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;
        ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;;
        ctx.lineWidth = 5,
        ctx.save()
        ctx.translate((this.model.playheadPosition - 1) * this.gridCellWidth, 0);
        // Playhead body (the vertical line)
        var playheadX = this.gridCellWidth / 2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH / 2 + 1.5;
        ctx.strokeStyle = 'Wick.GUIElement.PLAYHEAD_FILL_COLOR';
        ctx.lineWidth = Wick.GUIElement.PLAYHEAD_STROKE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, this.canvas.height);
        ctx.stroke();

        ctx.save();
        ctx.translate(margin, 0);
        // Playhead top (the triangle/rectangle thing on the number line)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 2/3);
        ctx.lineTo(width / 2, height);
        ctx.lineTo(0, height * 2/3);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();

        // (G or K?)nurl handles: the texturing lines on top of the playhead
        var handleMargin = 3;
        var handleSpacing = 4;

        var handleLeft = handleMargin;
        var handleRight = handleLeft + width - handleMargin * 2;

        ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_STROKE_COLOR;
        ctx.lineWidth = 2;
        for (var i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(handleLeft, handleSpacing * (i + 1));
            ctx.lineTo(handleRight, handleSpacing * (i + 1));
            ctx.stroke();
            }
        ctx.restore();
        ctx.restore();
        }

        else if (item == 'leftFolderHandle'){
        for(var x = 0 ; x < this.model.folderStarts.length ; x++){
            ctx.fillStyle = 'rgb(183, 183, 183)';
            ctx.strokeStyle = 'rgb(183, 183, 183)';
            ctx.lineWidth = 5,
            ctx.save()
            ctx.translate((this.model.folderStarts[x].item * this.gridCellWidth - i * this.gridCellWidth) - this.gridCellWidth, 0);

            // Playhead body (the vertical line)
            var playheadX = this.gridCellWidth / 2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH / 2 + 1.5;
            ctx.strokeStyle = 'rgb(183, 183, 183)';
            ctx.lineWidth = Wick.GUIElement.PLAYHEAD_STROKE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, this.canvas.height);
            ctx.stroke();

            ctx.save();
            ctx.translate(margin, 0);

            // Playhead top (the triangle/rectangle thing on the number line)
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height * 2/3);
            ctx.lineTo(width / 2, height);
            ctx.lineTo(0, height * 2/3);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.stroke();

            // Color label: the little red pentagon that shows it starts the folder
            var pentagonMargin = 4;
            var yMargin = 4

            var endLeft = pentagonMargin;
            var endRight = endLeft + width - pentagonMargin * 2;

            ctx.fillStyle = '#F15E5E';
            ctx.strokeStyle = '#F15E5E';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(endLeft, yMargin);
            ctx.lineTo(endRight, yMargin);
            ctx.lineTo(endRight, height * 3/13);
            ctx.lineTo(playheadX / 2 + 1.5, yMargin * 3);
            ctx.lineTo(endLeft, height * 3/13);
            ctx.lineTo(endLeft, yMargin);
            ctx.fill()
            ctx.stroke();
            ctx.restore();
            ctx.restore();
            }
        }
        else if (item == 'rightFolderHandle'){
            for(var x = 0 ; x < this.model.folderStarts.length ; x++){
                ctx.fillStyle = 'rgb(183, 183, 183)';
                ctx.strokeStyle = 'rgb(183, 183, 183)';
                ctx.lineWidth = 5,
                ctx.save()
                if(this.model.folderStarts[x].status == 'open'){
                    ctx.translate((this.model.folderEnds[x] * this.gridCellWidth - i * this.gridCellWidth) - this.gridCellWidth, 0);
                }
                else{
                    ctx.translate((this.model.folderStarts[x].item + 1) * this.gridCellWidth - i * this.gridCellWidth - this.gridCellWidth, 0);
                }
                // Playhead body (the vertical line)
                var playheadX = this.gridCellWidth / 2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH / 2 + 1.5;
                ctx.strokeStyle = 'rgb(183, 183, 183)';
                ctx.lineWidth = Wick.GUIElement.PLAYHEAD_STROKE_WIDTH;
                ctx.beginPath();
                ctx.moveTo(playheadX, 0);
                ctx.lineTo(playheadX, this.canvas.height);
                ctx.stroke();

                ctx.save();
                ctx.translate(margin, 0);

                // Playhead top (the triangle/rectangle thing on the number line)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width, 0);
                ctx.lineTo(width, height * 2/3);
                ctx.lineTo(width / 2, height);
                ctx.lineTo(0, height * 2/3);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();

                // Color label: the little red pentagon that shows it starts the folder
                var pentagonMargin = 4;
                var yMargin = 4

                var endLeft = pentagonMargin;
                var endRight = endLeft + width - pentagonMargin * 2;

                ctx.fillStyle = '#5EDCF1';
                ctx.strokeStyle = '#5EDCF1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(endLeft, yMargin);
                ctx.lineTo(endRight, yMargin);
                ctx.lineTo(endRight, height * 3/13);
                ctx.lineTo(playheadX / 2 + 1.5, yMargin * 3);
                ctx.lineTo(endLeft, height * 3/13);
                ctx.lineTo(endLeft, yMargin);
                ctx.fill()
                ctx.stroke();
                ctx.restore();
                ctx.restore();
            }
        }
    }
}