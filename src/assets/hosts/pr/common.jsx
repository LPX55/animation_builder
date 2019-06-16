function TAPremiere() {
    this.lastClip = null;
    this.started = false;
    this.edited = false;
    this.selected = false;
    this.interval = 10;
    this.PProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
    this.tagName = "Column.Intrinsic.MotionFactory";
    this.holderClipName = "MOGRT-Holder.png";
    this.appVersion = parseFloat(app.version.match(/\d+\.\d+|^([^\.])\d+/g));
    this.appMinVersion = 12.1;
}

/**
     * compare two clips
     *
     * @param clip1 the first clip object.
     *
     * @param clip2 the second clip object.
     * 
     * @return if clips are same returns true, else returns false
     * 
**/
TAPremiere.prototype.clipsAreSame = function (clip1, clip2) {

    if ((clip1.inPoint.seconds != clip2.inPoint.seconds) || (clip1.outPoint.seconds != clip2.outPoint.seconds) || (clip1.duration.seconds != clip2.duration.seconds)
        || (clip1.end.seconds != clip2.end.seconds) || (clip1.start.seconds != clip2.start.seconds)) {
        return false;
    }
    return true;
}
/**
     * as selected clip changes in premiere this function will get called.
**/
TAPremiere.prototype.notifyChange = function () {
    try {
        var clipName = '';
        if (this.lastClip) clipName = this.lastClip.name;
        if (this.appVersion >= this.appMinVersion) {
            this.fireEvent('LayerChanged', JSON.stringify({ controllers: this.getClipProperties(), headerName: clipName }));

        }
        else {
            this.stopDetect();
        }
    }
    catch (err) {

    }
}

/**
     * stops listening for changes
**/
TAPremiere.prototype.stopDetect = function () {
    this.lastClip = null;
    this.started = false;
    this.edited = false;
    this.selected = false;
}

/**
     * dispatchs an event
     *
     * @param type the type of event(for example clicked, added ...)
     *
     * @param data specific data that should dispatch with the event.
     * 
**/
TAPremiere.prototype.fireEvent = function (type, data) {

    var externalObjectName;
    if (Folder.fs === 'Macintosh') {
        externalObjectName = "PlugPlugExternalObject";
    } else {
        externalObjectName = "PlugPlugExternalObject.dll";
    }
    var mylib = new ExternalObject('lib:' + externalObjectName);
    var csxsEvent = new CSXSEvent();
    csxsEvent.type = type;
    csxsEvent.data = data || '';
    csxsEvent.dispatch();

}

/**
     * get last selected clip properties value, type, name, index
     * 
     * @return array of properties
     * 
**/
TAPremiere.prototype.getClipProperties = function () {
    if (!this.lastClip || !(this.lastClip.isMGT())) return false;
    if (this.lastClip.projectItem) {
        var settingData = this.readTag(this.lastClip.projectItem) ? JSON.parse(
            this.readTag(this.lastClip.projectItem).toString()) : null;
        for (var i = 0; i < settingData.length; i++) {
            var OBJ = settingData[i];
            if (OBJ.type === 4) {
                OBJ.clipValue = this.lastClip.getMGTComponent().properties[OBJ.index].getColorValue();
            } else if (OBJ.type === 6 || OBJ.type === 100) {
                OBJ.clipValue = this.appVersion >= 13.0 ? JSON.parse(this.lastClip.getMGTComponent().properties[OBJ.index].getValue()).textEditValue :
                    this.lastClip.getMGTComponent().properties[OBJ.index].getValue();
            }
            else {
                OBJ.clipValue = this.lastClip.getMGTComponent().properties[OBJ.index].getValue();
            }
        }
        return settingData;
    }
}

TAPremiere.prototype.getNewValues = function () {
    if (!this.lastClip || !this.lastClip.isMGT()) return [];
    var component = this.lastClip.getMGTComponent();
    var result = [];
    for (var i = 0; i < component.properties.numItems; i++) {
        result.push({
            index: i,
            value: component.properties[i].getValue()
        });

    }
    return JSON.stringify(result);
}
/**
     * set a clip property value
     *
     * @param index index of property in last selected property
     *
     * @param value value that should set to property
**/
TAPremiere.prototype.setClipProperty = function (index, value) {
    var mgrt = this.lastClip.getMGTComponent();
    mgrt.properties[index].setValue(value);
    // to refresh viewer
    this.lastClip.end = this.lastClip.end;
}
/**
     * set a color value for color controllers
     *
     * @param {number} index - number that is the index of controller
     * @param {number} red - red value of color 
     * @param {number} green - green value of color 
     * @param {number} blue - blue value of color 
**/
TAPremiere.prototype.setColorValue = function (index, red, green, blue) {
    var mgrt = this.lastClip.getMGTComponent();
    // 1 is alpha in code below
    mgrt.properties[index].setColorValue(1, red, green, blue);
    // to refresh viewer
    this.lastClip.end = this.lastClip.end;
}
/**
     * adds motion factory tag on the given clip
     * @param item projectItem in premiere
     * @param comment the text that should apply as a tag on item
**/
TAPremiere.prototype.addTag = function (item, comment) {
    if (ExternalObject.AdobeXMPScript === undefined) {
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    }

    if (ExternalObject.AdobeXMPScript !== undefined) {
        if (item) {

            var projectMetadata = item.getProjectMetadata();
            // 2 means text type
            var successfullyAdded = app.project.addPropertyToProjectMetadataSchema(this.tagName, comment, 2);
            var xmp = new XMPMeta(projectMetadata);
            var obj = xmp.dumpObject();
            xmp.setProperty(this.PProPrivateProjectMetadataURI, this.tagName, comment);
            var str = xmp.serialize();
            item.setProjectMetadata(str, [this.tagName]);

        }
    }
}
/**
     * reads motion factory tag that applied on an item
     * @param item projectItem in premiere
     * @returns string if found else null
**/
TAPremiere.prototype.readTag = function (item) {
    if (ExternalObject.AdobeXMPScript === undefined) {
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    }

    if (ExternalObject.AdobeXMPScript !== undefined) {
        var newblob = item.getProjectMetadata();
        var newXMP = new XMPMeta(newblob);
        if (newXMP.doesPropertyExist(this.PProPrivateProjectMetadataURI, this.tagName))
            return newXMP.getProperty(this.PProPrivateProjectMetadataURI, this.tagName);
    }
}
TAPremiere.prototype.getHolderClip = function (holderClipName) {
    var activeSequence = app.project.activeSequence;
    if (!activeSequence) return false;
    for (var videoTracksIndex = 0; videoTracksIndex < activeSequence.videoTracks.numTracks; videoTracksIndex++) {
        for (var clipsIndex = 0; clipsIndex < activeSequence.videoTracks[videoTracksIndex].clips.numItems; clipsIndex++) {
            var clip = activeSequence.videoTracks[videoTracksIndex].clips[clipsIndex];
            if (clip.name == holderClipName) {
                return {
                    index: videoTracksIndex,
                    clip: clip
                };
            }

        }
    }
    return false;

}

/**
     * imports a mogrt and image sequence and replace it with holder clip (png)
     *
     * @param path absolute path to mogrt file and sequence
**/
TAPremiere.prototype.import = function (path, data, asSequence) {
    if (path) {
        var name = path.substring(path.lastIndexOf('/') + 1);
    }
    if (data) {
        var processedData = JSON.parse(data);

        var holderClip = this.getHolderClip(processedData.holderClipName);
    }
    var fileFormat = path.split('.').pop().toLowerCase();
    if (fileFormat === 'mogrt') {

        if (holderClip) {
            var importedClip = app.project.activeSequence.importMGT(path, holderClip.clip.start.ticks, holderClip.index, 0);
            if (data && importedClip.projectItem) {
                this.addTag(importedClip.projectItem, JSON.stringify(processedData.controllers));
                this.deselectAllClips(app.project.activeSequence);
                importedClip.setSelected(true);
            }
            this.deleteItem(holderClip.clip.projectItem);
            holderClip = null;
        } else {
            this.deleteAllMFHolders(app.project.rootItem);
        }
    }
    else if (true == asSequence) {
        var files = [path];
        var importedItem;
        var processedData = JSON.parse(data);
        var holderClip = this.getHolderClip(processedData.holderClipName);
        if (holderClip) {
            var holderIndex = holderClip.index;
            var holderStartTick = holderClip.clip.start.ticks;
        }
        var tempBin = app.project.rootItem.createBin("MF_Temp_Bin_Seq");
        app.project.importFiles(files, 0, tempBin, 1);
        for (var i = 0; i < tempBin.children.numItems; i++) {
            var item = tempBin.children[i];
            if (item.name == name) {
                importedItem = item;
            }
        }
        importedItem.moveBin(app.project.rootItem);
        tempBin.deleteBin();
        this.holderClipName = processedData.holderClipName;
        this.deleteAllMFHolders(app.project.rootItem);
        if (holderClip && app.project.activeSequence) {
            var importedClip = app.project.activeSequence.videoTracks[holderIndex].overwriteClip(importedItem, holderStartTick);
        }
    }
}

/**
     * search for motion factory holder item in hole project and delete it
     *
     * @param root root folder for search 
**/
TAPremiere.prototype.deleteAllMFHolders = function (root) {
    for (var i = 0; i < root.children.numItems; i++) {
        var item = root.children[i];
        if (item.type == 2) {
            this.deleteAllMFHolders(item);
        }
        else if (item.name == this.holderClipName) {
            this.deleteItem(item);
        }
    }
}
/**
     * deletes a clip
     * @param item projectItem
     * @return void
**/
TAPremiere.prototype.deleteItem = function (item) {
    if (item) {
        var tempBin = app.project.rootItem.createBin("MF_Temp_Bin21");
        item.moveBin(tempBin);
        tempBin.deleteBin();
    }
}
/**
     * deselect all clips in sequence
     * @param activeSequence a seuqence
     * @return void
**/
TAPremiere.prototype.deselectAllClips = function (activeSequence) {
    if (activeSequence) {
        for (var videoTracksIndex = 0; videoTracksIndex < activeSequence.videoTracks.numTracks; videoTracksIndex++) {
            for (var clipsIndex = 0; clipsIndex < activeSequence.videoTracks[videoTracksIndex].clips.numItems; clipsIndex++) {
                activeSequence.videoTracks[videoTracksIndex].clips[clipsIndex].setSelected(false);
            }
        }
    }
}

/**
 * Open project file
 * @param {filePath}    string  project file path
 * @return {void}
 */
TAPremiere.prototype.openProject = function (filePath) {
    var myFile = new File(filePath);
    app.openDocument(myFile.fsName, 1, 1, 1);
}

/**
     * detects selected clip change like a native event
**/
function detectChangeTA() {
    try {
        TAPremiereObject.edited = false;
        TAPremiereObject.selected = false;
        if (app.project.activeSequence) {
            for (var videoTracksIndex = 0; videoTracksIndex < app.project.activeSequence.videoTracks.numTracks; videoTracksIndex++)
                for (var clipsIndex = 0; clipsIndex < app.project.activeSequence.videoTracks[videoTracksIndex].clips.numItems; clipsIndex++) {
                    var clip = app.project.activeSequence.videoTracks[videoTracksIndex].clips[clipsIndex];
                    if (clip.isSelected()) {
                        TAPremiereObject.selected = true;
                        if (TAPremiereObject.lastClip == null) {
                            TAPremiereObject.lastClip = clip;
                            TAPremiereObject.edited = true;
                            TAPremiereObject.notifyChange();

                        }

                        else if (!TAPremiereObject.clipsAreSame(clip, TAPremiereObject.lastClip)) {
                            TAPremiereObject.lastClip = clip;
                            TAPremiereObject.edited = true;
                            TAPremiereObject.notifyChange();
                        }
                        break;
                    }
                }
            if (!TAPremiereObject.edited && !TAPremiereObject.selected && TAPremiereObject.lastClip != null) {
                TAPremiereObject.lastClip = null
                TAPremiereObject.notifyChange();
            }
        } else {
            TAPremiereObject.lastClip = null
            TAPremiereObject.notifyChange();
        }
        if (TAPremiereObject.started)
            app.setTimeout(detectChangeTA, TAPremiereObject.interval);
    }
    catch (err) {
    }
}

function rgbToHexTA(rgb) {
    return '0x' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

function numberToRgbArrayTA(number) {
    var red = Math.floor(number / (256 * 256)),
        green = Math.floor(number / 256) % 256,
        blue = number % 256;
    var redGreenBlue = [red, green, blue];
    return redGreenBlue;
}


var TAPremiereObject = new TAPremiere();
TAPremiereObject.started = true;
detectChangeTA();

$._TAPremiere = {
    setClipProperty: function (index, value) {
        TAPremiereObject.setClipProperty(index, value);
    },
    setColorValue: function (index, red, green, blue) {
        TAPremiereObject.setColorValue(index, red, green, blue);
    },
    importItem: function (path, data, asSequence) {
        if (TAPremiereObject.appVersion >= TAPremiereObject.appMinVersion) {
            TAPremiereObject.import(path, data, asSequence);
        }
        else {
            alert("In order to import MOGRT files, you need to update your Premiere to 2018.1 or the latest version.", "app update")
        }
    },
    openProject: function (path) {
        TAPremiereObject.openProject(path);
    },
    openColorPicker: function (red, green, blue, alpha) {
        var hexColor = rgbToHexTA([red, green, blue]);
        var selectedColor = $.colorPicker(hexColor);
        var RGB = numberToRgbArrayTA(selectedColor);
        TAPremiereObject.fireEvent('colorPickerSelected', JSON.stringify({ red: RGB[0], green: RGB[1], blue: RGB[2] }));
    }
}