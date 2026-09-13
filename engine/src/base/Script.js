Wick.Script = class extends Wick.Base {
    get classname() {
        return 'Script';
    }

    _serialize() {
        let data = super._serialize();

        data.text = this.text;
        data.mode = this.mode;
        data.arguments;
    }

    /**
     * Makes a script.
     * @param {object} args
     * @param {"autorun" | "call" | "legacy"} args.mode - Script mode; Autorun runs when the project starts; Call runs as a function to be called; Legacy works similar to classic scripts.
     * @param {string} args.text - Text (code) of the script.
     * @param {string} args.src - Source (code) of the script.
     * @param {string[]} args.args - Arguments of the script. Call mode only.
     */
    constructor(args) {
        if(!args) args = {};
        super(args);

        this._mode = ['autorun', 'call', 'legacy'].indexOf(args.mode) !== -1 ? args.mode : 'call';
        this._text = String(args.text || args.src || 'console.log("Hello World!");');

        this._dirty = false;
        this._fn = null;

        switch (this.mode) {
            case 'autorun':
                this._arguments = ['project'];
                break;
            
            case "call":
                this._arguments = Array.of(args.args || []).filter(s => typeof s === 'string' || s instanceof String);
                break;

            case "legacy":
                this._arguments = ['self', 'api', 'project'];
                break;
        }
    }

    /**
     * Arguments of this script.
     * @type {string[]}
     */
    get arguments() {
        return this._arguments
    }

    set arguments(newArgs) {
        if(this.mode !== 'call')
            throw new Error(`Only call mode scripts can have custom arguments. Script is of ${this.mode} mode.`);

        this._arguments = Array.of(args.args || []).filter(s => typeof s === 'string' || s instanceof String);
    }

    /**
     * Script's mode.
     * @type {"autorun" | "call" | "legacy"}
     */
    get mode() {
        return this._mode;
    }

    set mode(newMode) {
        this._mode = ['autorun', 'call', 'legacy'].indexOf(newMode) !== -1 ? newMode : 'call';
    }
    
    _recompile() {
        if(!this._dirty)
            console.warn('Clean script was recompiled.');

        this._dirty = false;

        try {
            this._fn = new Function(...this._arguments, this.text);
        } catch(e) {
            console.warn(`Script ${this.identifier ? `'${this.identifier}'` : '<no identifier?>'} (${this.uuid}) has failed to execute. ${e.toString()}`);
            
            return e;
        }

        return true;
    }

    /**
     * The text (source, or code) of this script.
     * @type {string}
     */
    get text() {
        return this._text;
    }

    set text(newText) {
        this._text = String(newText);

        this._dirty = true;

        if(this.project.playing)
            this._recompile();
    }

    /**
     * Runs the script
     * @param {object} args - The arguments object.
     * @param {any[]} args.args - Script's arguments.
     * @param {Wick.Base} args.self - Script's self. Legacy mode only. 
     * @returns {any | Error} - Returns error if anything went wrong.
     */
    run(args) {
        if(!args) args = {};

        if(this._dirty || !this._fn) {
            this._recompile();
        }

        let fnArgs = [];
        
        switch (this.mode) {
            case "autorun":
                fnArgs = [this.project.root];
                break;
            case "call":
                fnArgs = Array.isArray(args.args) ? args.args : [args.args] || [];
                break;
            case "legacy":
                fnArgs = [args.self, new GlobalAPI(args.self), this.project.root];
                break;
        }

        try {
            return this._fn(...fnArgs);
        } catch(e) {
            console.warn(`Failed to run script '${this.identifier ? this.identifier : '<no identifier>'}' (${this.uuid}). ${e.toString()}`);

            return e;
        }
    }
}