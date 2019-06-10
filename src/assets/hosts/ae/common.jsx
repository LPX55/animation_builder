function textAnimatorAfterEffects() {
    this.appVersion = parseFloat(app.version.match(/\d+\.\d+|^([^\.])\d+/g));
    this.PropertyTypes = {
        color: 6418,
        slider: 6417,
        text: 6424,
        point2D: 6415,
        point3D: 6413,
        layer: 6421
    }
    // stores setting last readed values to change their value later
    this.lastReadedProperties = [];
    // stores setting last readed comp
    this.lastReadedComp = null;
    // index of last readed setting group
    this.lastGroupIndex = -1;

    this.colorPickerValues = [50, 50, 50, 100];
}

/**
 * Open AEP project file
 * @param {filePath}    string  AEP project file path
 * @return {void}
 */
textAnimatorAfterEffects.prototype.openAEPProject = function (filePath) {
    var myFile = new File(filePath);
    app.open(myFile);
}

/**
     * imports an aep
     *
     * @param path absolute path to aep file
     * @param data optional data
     * @return {item} imported item
**/
textAnimatorAfterEffects.prototype.importItem = function (path, data) {
    app.beginSuppressDialogs();
    var io = new ImportOptions(new File(path));
    io.importAs = ImportAsType.PROJECT;
    var importedItem = app.project.importFile(io);
    this.addImportedCompsAsLayer(importedItem);
    for (var i = importedItem.items.length; i >= 1; i--) {
        importedItem.item(i).parentFolder = importedItem.parentFolder;
    }
    importedItem.remove();
    app.endSuppressDialogs(false);
    return importedItem;
}
/**
     * imports a footage in aftereffects
     *
     * @param path absolute path to footage file
     * @return {item} imported footage item
**/
textAnimatorAfterEffects.prototype.importFootage = function (path, asSequence) {
    app.beginSuppressDialogs();
    var io = new ImportOptions(new File(path));
    io.importAs = ImportAsType.FOOTAGE;
    if (true == asSequence) {
        io.sequence = true;
    }
    var importedItem = app.project.importFile(io);
    app.endSuppressDialogs(false);
    return importedItem;
}

/**
     * applies a preset in aftereffects
     *
     * @param path absolute path to ffx file
     * @return {void}
**/
textAnimatorAfterEffects.prototype.applyPreset = function (path) {
    app.beginSuppressDialogs();
    var preset = File(path);
    if (app.project.activeItem && app.project.activeItem.selectedLayers.length) {
        for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
            app.project.activeItem.selectedLayers[i].applyPreset(preset);
        }
        if (app.project.activeItem.selectedLayers.length == 1) {
            $._textAnimatorAfterEffects.fireLiveSettingEvent();
        }
    }
    app.endSuppressDialogs(false);
    return;
}

/**
     * dispatchs an event
     *
     * @param type the type of event(for example clicked, added ...)
     *
     * @param data specific data that should dispatch with the event.
     * 
**/
textAnimatorAfterEffects.prototype.fireEvent = function (type, data) {

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
     * get given property details and values and stores in lastReadedProperties
     *
     * @param {layer[]} controllerLayers control settings layer
     * @param {textLayers[]} textLayers text layers
     * @return {any[]} some property of read layers
     * 
**/
textAnimatorAfterEffects.prototype.getLayerProperties = function (controllerLayers, textLayers) {
    var result = [];
    for (var layersIndex = 0; layersIndex < controllerLayers.length; layersIndex++) {
        var properties = controllerLayers[layersIndex].property("ADBE Effect Parade");
        var controllers = this.readSettingControllers(properties, this.lastGroupIndex, []);
        for (var i = 0; i < controllers.length; i++) {
            var controller = controllers[i];
            this.lastReadedProperties.push({ prop: controller.obj, removeFunction: controller.removeFunction, changeRTLFunction: controller.changeRTLFunction });
            result.push({
                name: controller.name,
                index: controller.index,
                type: controller.type,
                value: controller.value,
                min: controller.min,
                max: controller.max,
                parentIndex: controller.parentIndex,
                hasFx: controller.hasFx,
                fx: controller.fx,
                hasKey: controller.hasKey,
                key: controller.key,
                valueOptions: controller.valueOptions,
                description: controller.description,
                isABProperty: controller.isABProperty,
                rtlStatus: controller.rtlStatus
            })
        }
    }
    if (textLayers.length) {
        var groupIndex = this.generateTextGroup(result);
        for (var i = 0; i < textLayers.length; i++) {
            var textProperty = textLayers[i].property("ADBE Text Properties").property("ADBE Text Document");
            result.push({
                name: textLayers[i].name,
                index: result.length,
                type: this.getPropertyType(textProperty),
                value: textProperty.value.text,
                parentIndex: groupIndex,
                hasKey: textProperty.canVaryOverTime,
                key: textProperty.numKeys > 0 ? true : false,
            })
            this.lastReadedProperties.push({ prop: textProperty, removeFunction: null, changeRTLFunction: null });
        }
    }
    return result;
}


textAnimatorAfterEffects.prototype.generateTextGroup = function (result) {
    this.lastReadedProperties.push({ prop: null, removeFunction: null, changeRTLFunction: null });
    result.push({
        name: 'Text Inputs',
        index: result.length,
        type: 200,
        parentIndex: -1,
        hasFx: false,
        fx: false
    });
    return result.length - 1;
}
/**
     * get property type to load in setting component
     * @param {property} property
     * @return {number} type of item
     * 
**/
textAnimatorAfterEffects.prototype.getPropertyType = function (property) {
    var itemType;
    var type = property.propertyValueType;
    switch (type) {
        case this.PropertyTypes.slider:
            if (!property.hasMin && !property.hasMax) {
                itemType = 3;
            } //TODO: we should have a unique key to seperate checkbox from slider
            else if (property.minValue == 0 && property.maxValue == 1) {
                //we should set value to find type of controller between slider and checkbox 
                var currentValue = property.value;
                property.setValue(0.8);
                if (property.value == 1) {
                    property.setValue(currentValue);
                    itemType = 1;
                } else {
                    property.setValue(currentValue);
                    itemType = 2;
                }
            } else {
                itemType = 2;
            }
            break;
        case this.PropertyTypes.color:
            itemType = 4;
            break;
        case this.PropertyTypes.text:
            itemType = 6;
            var regex = /(\r\n)+|\r+|\n+|\\r+|\\n+/g;
            if (regex.test(property.value.text)) {
                itemType = 100;
            }
            break;
        case this.PropertyTypes.point2D:
            itemType = 5;
            break;
        case this.PropertyTypes.point3D:
            itemType = 5;
            break;
        case this.PropertyTypes.layer:
            itemType = 16
            break;
        default:
            itemType = 0;
    }
    return itemType;
}

/**
     * get current active comp or layer setting
     * @param {CompItem} comp
     * @return {string} setting data
     * 
**/
textAnimatorAfterEffects.prototype.getCompSetting = function (comp) {
    try {
        if (comp) {
            this.lastReadedComp = comp;
            this.lastReadedProperties.length = 0;
            if (comp.selectedLayers && comp.selectedLayers.length === 1) {
                var layerEffects = this.getLayerProperties([comp.selectedLayers[0]], []);
                if (layerEffects.length > 0) {
                    return layerEffects;
                }
                var innerCompResult = this.getCompSetting(comp.selectedLayers[0].source);
                if (innerCompResult.length > 0) {
                    this.lastReadedComp = comp.selectedLayers[0].source;
                    return innerCompResult
                };
            }
            var textLayers = [];
            for (var i = 1; i <= comp.layers.length; i++) {
                var layer = comp.layer(i);
                if (layer instanceof TextLayer && !(/(^_.+(?:_|(?:_\s))$)/g.test(layer.name.toString()))) {
                    textLayers.push(layer)
                }
            }
            var settingLayers = [];
            for (var i = 1; i <= comp.layers.length; i++) {
                var layer = comp.layer(i);
                if ((/setting/gi.test(layer.name.toString()))) {
                    settingLayers.push(layer)
                }
            }

            return this.getLayerProperties(settingLayers, textLayers);
        }
        return [];
    }
    catch (e) {
        var externalObjectName;
        if (Folder.fs === 'Macintosh') {
            externalObjectName = "PlugPlugExternalObject";
        } else {
            externalObjectName = "PlugPlugExternalObject.dll";
        }
        var mylib = new ExternalObject('lib:' + externalObjectName);
        var csxsEvent = new CSXSEvent();
        csxsEvent.type = 'triggerError';
        csxsEvent.data = JSON.stringify(e);
        csxsEvent.dispatch();
        return [];
    }
}
/**
     * reads a property inner controllers and return array
     * @param {PropertyGroup} properties group property
     * @param {number} parentIndex index of parent controller
     * @param {number} resultArray result array
     * @return {any[]} readed controllers as an array
     * 
**/
textAnimatorAfterEffects.prototype.readSettingControllers = function (properties, parentIndex, resultArray) {
    for (var i = 1; i <= properties.numProperties; i++) {
        var property = properties.property(i);
        if (property.name != "Compositing Options" && property.propertyValueType != PropertyValueType.CUSTOM_VALUE) {
            if (!(property instanceof PropertyGroup) && property.propertyValueType != PropertyValueType.NO_VALUE && property.value != null) {
                resultArray.push({
                    name: properties.property(i).name,
                    index: resultArray.length,
                    value: property.value,
                    parentIndex: this.lastGroupIndex !== -1 ? this.lastGroupIndex : parentIndex,
                    obj: property,
                    type: this.getPropertyType(property),
                    max: property.hasMax ? property.maxValue : 0,
                    min: property.hasMin ? property.minValue : 0,
                    hasKey: property.canVaryOverTime,
                    key: property.numKeys > 0 ? true : false,
                    valueOptions: this.getPropertyType(property) === 16 ? this.readCompLayers(this.lastReadedComp) : []
                })
            }
            else {
                var isABProperty = this.isAnimationBuilderProperty(property);
                var group = {
                    name: isABProperty && property.propertyType == 6213 ? animationBuilderObject.getPropsFromString(property.name).typeName :
                        properties.property(i).name,
                    index: resultArray.length,
                    type: property.propertyType == 6213 ? 200 : (property.name ? 201 : 202),
                    parentIndex: this.lastGroupIndex !== -1 ? this.lastGroupIndex : parentIndex,
                    obj: property,
                    hasFx: !isABProperty && property.canSetEnabled,
                    fx: property.enabled,
                    description: isABProperty ? animationBuilderObject.getPropsFromString(property.name).name : '',
                    removeFunction: this.getRemoveFunction(property),
                    changeRTLFunction: this.getChangeRTLFunction(property),
                    isABProperty: isABProperty ? true : false,
                    rtlStatus: isABProperty ? animationBuilderObject.getRTLStatus(property) : false
                };
                this.lastGroupIndex = group.type != 202 ? group.index : parentIndex;
                resultArray.push(group);
                if (property.numProperties) {
                    this.readSettingControllers(property, this.lastGroupIndex, resultArray);
                }
            }
        }
    }
    this.lastGroupIndex = -1;
    return resultArray;
}

textAnimatorAfterEffects.prototype.getRemoveFunction = function (property) {
    if (this.isAnimationBuilderProperty(property)) {
        return $._AnimationBuilder.removeEffect;
    }
    else {
        return this.removeEffectOfSelectedLayer;
    }
}


textAnimatorAfterEffects.prototype.getChangeRTLFunction = function (property) {
    if (this.isAnimationBuilderProperty(property)) {
        return $._AnimationBuilder.changeRTLStatus;
    }
    else {
        return function () { };
    }
}

textAnimatorAfterEffects.prototype.isAnimationBuilderProperty = function (property) {
    return property.name && /^([A-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([A-Z])(-[\w\d]{1,3})?$/g.test(property.name);
}
/**
     * gets a value and set it on property
     * @param {number} index index of property that should modify
     * @param {any} value that should set on property
     * @param {boolean} key add value with key
     * @return {void}
**/
textAnimatorAfterEffects.prototype.setLayerProperty = function (index, value, key) {
    if (this.lastReadedProperties.length && this.lastReadedProperties[index].prop) {
        var property = this.lastReadedProperties[index].prop;
        (property instanceof PropertyGroup) && property.propertyType == 6213 ? property.enabled = value :
            (key ? property.setValueAtTime(this.lastReadedComp.time, value) : property.setValue(value));
    }
}

/**
     * removes all keys of a property
     * @param {any} property object of property
     * @return {void}
**/
textAnimatorAfterEffects.prototype.removeAllKeys = function (property) {
    var numKeys = property.numKeys;
    if (numKeys) {
        for (var i = 1; i <= numKeys; i++) {
            property.removeKey(1);
        }
    }
}

/**
     * removes a effect
     * @param {any} property
     * @return {void}
**/
textAnimatorAfterEffects.prototype.removeEffectOfSelectedLayer = function (property) {
    if (property && property instanceof PropertyGroup && property.propertyType == 6213) {
        property.remove();
    }
}

/**
     * reads all layers in comp
     * @param {any} comp object of comp
     * @return {any[]} list of layers in comp
**/
textAnimatorAfterEffects.prototype.readCompLayers = function (comp) {
    var result = [];
    result.push({ index: 0, name: 'None' });
    if (comp) {
        for (var i = 1; i <= comp.layers.length; i++) {
            result.push({ index: i, name: comp.layer(i).name });
        }
    }
    return result;
}
/**
     * checks if activeComp is exist and imported item has unused comps then it will add unused comps as layer to activeItem
     * @param {any} rootFolder object of imported project
     * @return {void}
**/
textAnimatorAfterEffects.prototype.addImportedCompsAsLayer = function (rootFolder) {
    var activeComp = app.project.activeItem;
    if (activeComp && activeComp instanceof CompItem) {
        for (var i = 1; i <= rootFolder.items.length; i++) {
            var item = rootFolder.item(i);
            if (item instanceof CompItem && item.usedIn.length == 0) {
                activeComp.layers.add(item);
            }
            else if (item instanceof FolderItem)
                this.addImportedCompsAsLayer(item)
        }
    }
}

var textAnimatorAfterEffectsObject = new textAnimatorAfterEffects();
$._textAnimatorAfterEffects = {
    importItem: function (path, data, asSequence) {
        textAnimatorAfterEffectsObject.importItem(path, data);
    },
    importFootage: function (path, asSequence) {
        var importedItem = textAnimatorAfterEffectsObject.importFootage(path, asSequence);
        if (app.project.activeItem && app.project.activeItem instanceof CompItem && importedItem) {
            app.project.activeItem.layers.add(importedItem);
        }
    },

    applyPreset: function (path) {
        textAnimatorAfterEffectsObject.applyPreset(path);
    },

    fireLiveSettingEvent: function () {
        var compName = '';
        textAnimatorAfterEffectsObject.lastReadedProperties.length = 0;
        var controllers = textAnimatorAfterEffectsObject.getCompSetting(app.project.activeItem);
        if (textAnimatorAfterEffectsObject.lastReadedComp && controllers.length) {
            compName = textAnimatorAfterEffectsObject.lastReadedComp.name;
        }
        if (textAnimatorAfterEffectsObject.lastReadedComp.selectedLayers && textAnimatorAfterEffectsObject.lastReadedComp.selectedLayers.length === 1) {
            compName = textAnimatorAfterEffectsObject.lastReadedComp.selectedLayers[0].name;
        }
        textAnimatorAfterEffectsObject.fireEvent('LayerChanged', JSON.stringify({ headerName: compName, controllers: controllers }));
    },
    setLayerProperty: function (index, value, key) {
        textAnimatorAfterEffectsObject.setLayerProperty(index, value, (key == undefined || key == false) ? false : true);
    },
    removeAllKeys: function (index) {
        textAnimatorAfterEffectsObject.removeAllKeys(textAnimatorAfterEffectsObject.lastReadedProperties[index].prop);
    },
    removeEffect: function (effectIndex) {
        if (textAnimatorAfterEffectsObject.lastReadedProperties[parseInt(effectIndex)].prop == null) {
            return;
        }
        var layer = textAnimatorAfterEffectsObject.lastReadedComp.selectedLayers[0];
        var propObj = textAnimatorAfterEffectsObject.lastReadedProperties[parseInt(effectIndex)];
        propObj.removeFunction(propObj.prop);
        if (layer) layer.selected = true;
        this.fireLiveSettingEvent();
    },
    changeRTLStatus: function (effectIndex) {
        if (textAnimatorAfterEffectsObject.lastReadedProperties[parseInt(effectIndex)].prop == null) {
            return;
        }
        var propObj = textAnimatorAfterEffectsObject.lastReadedProperties[parseInt(effectIndex)];
        propObj.changeRTLFunction(propObj.prop);
    },

    openAEPProject: function (path) {
        textAnimatorAfterEffectsObject.openAEPProject(path);
    },
    showPluginMessage: function () {
        textAnimatorAfterEffectsObject.fireEvent('showPluginMessage', JSON.stringify({}));
    },
    onMFColorPickerSelected: function (red, blue, green, alpha) {
        if (red >= 0 && green >= 0 && blue >= 0 && alpha >= 0) {
            textAnimatorAfterEffectsObject.colorPickerValues = [red, green, blue, alpha];
            textAnimatorAfterEffectsObject.fireEvent('colorPickerSelected', JSON.stringify({ red: red, green: green, blue: blue }));
        } else {
            return false;
        }
    },
    getColorPickerValues: function () {
        return textAnimatorAfterEffectsObject.colorPickerValues.join(' ');
    },
    openColorPicker: function (red, green, blue, alpha) {
        textAnimatorAfterEffectsObject.colorPickerValues = [red, blue, green, alpha];
        var a = new ExternalObject('lib:C:\\Program Files\\Adobe\\Common\\Plug-ins\\7.0\\MediaCore\\pixflow\\AEGP\\Motion Factory.aex');
        a.openColorPicker();
    }
}
