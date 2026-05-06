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





//To implement folders, we need to work HERE!!!
Wick.GUIElement.NumberLine = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.cursor = 'grab';

        this.canAutoScrollX = true;

        this.playhead = new Wick.GUIElement.Playhead(model);
        this.onionSkinRangeLeft = new Wick.GUIElement.OnionSkinRange(model, 'left');
        this.onionSkinRangeRight = new Wick.GUIElement.OnionSkinRange(model, 'right');

        this.folderStartArray = this.model.folderStarts || []
        this.folderEndArray = this.model.folderEnds || []
        this.folderStart = 1
        this.folderEnd = 2

        this.drawFolderHandles = false
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Shift over 2px for some breathing room
        ctx.save();
        ctx.translate(2,0);

        // Save where the mouse is if the user wants to drag the playhead around
        this.mousePlayheadPosition = Math.floor(this.localMouse.x / this.gridCellWidth) + 1;

        var width = this.canvas.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;

        // Draw number line cells and skip the ones that are part of a closed folder
        var skip = 0
        skip =  Math.round(this.project.scrollX / this.gridCellWidth);
        var currentTranslation = 0 + skip
        var i = -1;
        for(i = -1; i < width / this.gridCellWidth + this.totalGone; i++) {
            //Check if i is in a closed folder
            this.closedFolders.forEach(obj => {
                if(currentTranslation == obj.startTranslation + 2){
                    i = obj.end
                }
            })
            this._drawCell(i + skip + 1 , currentTranslation)
            currentTranslation++;
        }

        // Draw onion skin range
        if(this.model.project.onionSkinEnabled) {
            ctx.save();
            ctx.translate((this.model.playheadPosition - 1) * this.gridCellWidth + this.gridCellWidth/2, 0);
                this.onionSkinRangeLeft.draw();
                this.onionSkinRangeRight.draw();
            ctx.restore();
        }

        if (this.drawFolderHandles == true){

        // Draw folder handles
        this.playhead.draw('leftFolderHandle')
        this.playhead.draw('rightFolderHandle')
        
        }

        // Draw playhead
        this.playhead.draw('playhead');

        ctx.restore();
    }

    // Helper function for drawing each cell of the numberline (draws the border and the number)
    _drawCell (i , currentTranslation) {
        var ctx = this.ctx;

        var highlight = i===0 || (i%5 === 4);

        //Draw background
        this._drawCellBackground(currentTranslation);

        // Draw cell number
        this._drawCellNumbers(i , highlight , currentTranslation);

        // Add light gray rectangle with low opacity on top of the text, to show it's in a folder
        let partOfFolder = this.findIfPartOfFolder(i)
        if(partOfFolder.bool == true && this.folderStartArray[partOfFolder.index].status == 'open'){
            ctx.fillStyle = 'rgba(214, 214, 214, 0.36)';
            ctx.fillRect((currentTranslation - 1) * this.gridCellWidth, 0, this.gridCellWidth, Wick.GUIElement.NUMBER_LINE_HEIGHT);
        }

        // Draw cell wall
        ctx.lineWidth = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH;
        if(highlight) {
            ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_HIGHLIGHT_STROKE_COLOR;
        } else {
            ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR;
        }
        ctx.beginPath();
        var wallX = currentTranslation * this.gridCellWidth;
        ctx.moveTo(wallX, 0);
        ctx.lineTo(wallX, Wick.GUIElement.NUMBER_LINE_HEIGHT);
        ctx.stroke();
    }

    /**
    Helper function drawing number
    */
    _drawCellNumbers (i , highlight , currentTranslation){
        var ctx = this.ctx;

        if(this.project.frameSizeMode !== 'small' || highlight) {
            var fontSize = (i>=99) ? 13 : 16;
            var fontFamily = Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_FAMILY;
            ctx.font = fontSize + "px " + fontFamily;
            if(highlight) {
                ctx.fillStyle = Wick.GUIElement.NUMBER_LINE_NUMBERS_HIGHLIGHT_COLOR;
            } else {
                ctx.fillStyle = Wick.GUIElement.NUMBER_LINE_NUMBERS_COMMON_COLOR;
            }
            var textContent = ""+(i+1);
            var textWidth = ctx.measureText(textContent).width;
            ctx.fillText(textContent, (currentTranslation * this.gridCellWidth) + (this.gridCellWidth / 2) - (textWidth / 2), Wick.GUIElement.NUMBER_LINE_HEIGHT - 5);
        }

    }

    /**
    Helper function drawing cell background
    */
    _drawCellBackground(currentTranslation){
        var ctx = this.ctx;
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(currentTranslation * this.gridCellWidth, 0, this.gridCellWidth, Wick.GUIElement.NUMBER_LINE_HEIGHT);
        ctx.fill();
    }

    get closedFolders(){
        var closedFolders = []
            this.folderStartArray.forEach(folderStart => {
                if(folderStart.status == 'closed'){
                    closedFolders.push({ 
                    start : folderStart.item , 
                    end : this.folderEndArray[this.folderStartArray.indexOf(folderStart)] , 
                    startTranslation : folderStart.translation})
                }
            })
        return closedFolders;
    }

    get totalGone(){
        var gone = 0
        this.closedFolders.forEach(obj => {
            gone += obj.end - obj.start;
        })
        return gone;
    }

    /**
     * Helper function to find if a frame is part of a folder
     */
    findIfPartOfFolder(frame){
        for(var iterator = 0 ; iterator < this.folderEndArray.length; iterator++){
            if(frame > this.folderStartArray[iterator].item && frame < this.folderEndArray[iterator] || frame == this.folderStartArray[iterator].item || frame == this.folderEndArray[iterator]){
                return { bool: true, index: iterator };
            }
        }
        return { bool: false, index: -1 };
    }

    /**
     * Helper function to find the translation of a number on the number line
     */
    currentTranslationAt(input){
        var skip = Math.round(this.project.scrollX / this.gridCellWidth);
        var translation = 0 + skip
        for (var i = -1; i < (this.canvas.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH) / this.gridCellWidth + this.totalGone; i++){
            for(var objIdx = 0 ; objIdx < this.closedFolders.length ; objIdx++){
                var obj = this.closedFolders[objIdx]
                if(i > obj.start && i < obj.end){
                    while(i > obj.start && i < obj.end){
                        if(i != input){i++;}
                        else {return 'in closed folder'}
                    }
                }
            }
        }
        return translation;
    }

    /**
     * Helper function that returns true if the Shift key is currently down.
     */
    _isShiftDown (e) {
        return (e && e.shiftKey)
    }

    /**
     * Helper function that returns if the control/command key is down. 
     */
    _isControlequivalentDown(e){
        return (e && e.ctrlKey)
    }

    onMouseDown (e) {
        if (this._isShiftDown(e)){
            this.folderMade = false
            if(this._isControlequivalentDown(e)){
                if (// Check if the folder start is being clicked on
                    this.folderStartArray.find(obj => obj.item == this.mousePlayheadPosition)?.item == this.mousePlayheadPosition){
                    // folder variable to store the folder being worked with
                    var folder = this.folderStartArray.find(obj => this.folderStartArray[this.findIfPartOfFolder(obj.item)?.index].item == this.mousePlayheadPosition) || 
                    (this.folderStartArray.find(obj => this.findIfPartOfFolder(obj.item).bool == true && 
                    this.folderStartArray[this.findIfPartOfFolder(obj.item).index].status == 'open')) || 
                    { item : -1 , status : 'null'};
                    if (folder.status !== 'null'){
                        folder.status == 'open' ? folder.status = 'closed' : folder.status = 'open';
                    }
                    if (folder.status == 'null'){
                        console.error('folder is undefined: NumberLine.js, line 241')
                    }
                }
            }
            else if(this.folderStartArray.findIndex(obj => obj.item == this.mousePlayheadPosition) == -1){
                //Start making folder while holding shift
                this.folderStart = this.mousePlayheadPosition
                this.folderStartArray = this.model.folderStarts
                this.folderEndArray = this.model.folderEnds

                let makeFolder = true

                //Ensure positioning is legal and does not overlap with existing folders
                if (this.folderStartArray.findIndex(obj => obj.item == this.folderStart) !== -1){
                    makeFolder = false
                }

                this.folderEnd = this.folderStart + 2

                //Ensure positioning is legal and does not overlap with existing folders
                while (this.folderEndArray.indexOf(this.folderEnd) !== -1){
                    if(this.folderStartArray.findIndex(obj => obj.item == this.folderStart) < this.folderStartArray[this.folderEndArray.indexOf(this.folderEnd)]){
                        this.folderEnd = this.mousePlayheadPosition
                        }
                    else{
                        this.folderEnd -= 1
                    }
                }
            }
        }
        else{
           this._movePlayhead();
        }
    }

    onMouseDrag (e) {
        if (this._isShiftDown(e)){
            if(this.folderStartArray.findIndex(obj => obj.item == this.mousePlayheadPosition) == -1){
                //Adjust folder length by dragging the playhead while holding shift
                this.folderEnd = this.mousePlayheadPosition
            }
            /*if (this.folderStartArray.findIndex(obj => obj.item == this.mousePlayheadPosition) != -1){
                //Adjust position of folder start
                this.folderStart = this.mousePlayheadPosition
            }*/
        }
        else{
           this._movePlayhead();
        }
    
    }

    onMouseUp (e) {
        if (this._isShiftDown(e) && this._isControlequivalentDown(e) == false){
            //Ensure folder is made and added to the project and ensure it fits within available space
            while (this.folderEndArray.indexOf(this.folderEnd) !== -1){
                if(this.folderStartArray.findIndex(obj => obj.item == this.folderStart) < this.folderStartArray[this.folderEndArray.indexOf(this.folderEnd)]){
                    this.folderEnd += 1
                }
                else{
                    this.folderEnd -= 1
                }
            }
            if(this.folderStart > 0 && this.folderEnd > 0 && this.folderStart < this.folderEnd){
                //Add to timeline's folders array
                this.folderStartArray.push({ item : this.folderStart , status: 'open' , translation : this.currentTranslationAt(this.folderStart)})
                this.folderEndArray.push(this.folderEnd)
                this.drawFolderHandles = true
            }
        }
        this.projectWasModified();
    }

    get bounds () {
        return {
            x: this.project.scrollX,
            y: 0,
            width: this.canvas.width,
            height: Wick.GUIElement.NUMBER_LINE_HEIGHT,
        }
    }

    /**
     * Helper function for dragging the playhead around
     */
    _movePlayhead () {
        var timeline = this.project.model.activeTimeline;
        if(timeline.playheadPosition !== this.mousePlayheadPosition) {
            timeline.playheadPosition = this.mousePlayheadPosition;
            this.projectWasSoftModified();
        }
    }
}
