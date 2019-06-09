
function AnimationBuilder() {
    this.markersName = {
        "In": "Intro",
        "Out": "Outro"
    }
}
AnimationBuilder.prototype.getPropsFromString = function (name) {
    var regex = /^([A-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([A-Z])(-[\w\d]{1,3})?$/g;
    var props = regex.exec(name);
    return {
        projectKey: props[1],
        name: props[2],
        typeName: props[3],
        directionName: props[4]
    }
}
AnimationBuilder.prototype.addMarker = function (layer, markerComment, time, duration, createIfExist) {
    if (!createIfExist && this.checkMarkerExist(layer, markerComment)) return 0;
    var myMarkerVal = new MarkerValue(markerComment);
    myMarkerVal.duration = duration;
    layer.marker.setValueAtTime(time, myMarkerVal);
}
AnimationBuilder.prototype.removeMarker = function (layer, markerComment) {
    for (var i = layer.marker.numKeys; i >= 1; i--) {
        if (layer.marker.keyValue(i).comment == markerComment) {
            layer.marker.removeKey(i);
            break;
        }
    }
}

AnimationBuilder.prototype.checkMarkerExist = function (layer, markerComment) {
    var markerIsExist = false;
    for (var i = 1; i <= layer.marker.numKeys; i++) {
        if (layer.marker.keyValue(i).comment == markerComment) {
            markerIsExist = true;
            break;
        }
    }
    return markerIsExist;

}
AnimationBuilder.prototype.removeEffect = function (effect) {
    var layer = effect.parentProperty.parentProperty;
    var effectProps = this.getPropsFromString(effect.name);
    if (layer) {
        var textPeroperties = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var textPropertiesLength = textPeroperties.numProperties;
        for (var i = textPropertiesLength; i >= 1; i--) {
            var animator = textPeroperties.property(i);
            if (animator.name.indexOf(effect.name) > -1) {
                animator.remove();
            }
        }
        effect.remove();
        if (this.checkIfeffectWithTypeExistOnLayer(effectProps.typeName, layer) == 0 &&
            this.checkMarkerExist(layer, this.markersName[effectProps.typeName])) {
            this.removeMarker(layer, this.markersName[effectProps.typeName]);
        }
    }
}



AnimationBuilder.prototype.universalAppliedFxOfPreset = function (presetPath, layer) {
    var presetName = this.getFileName(presetPath);
    var fx = layer.property("ADBE Effect Parade").property(presetName);
    if (fx) {
        var oldName = fx.name;
        fx.name = fx.name + '-' + this.getRandomKey();
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        for (var i = 1; i <= animators.numProperties; i++) {
            var anim = animators.property(i);
            if (anim.name.indexOf(presetName) > -1) {
                anim.name = anim.name.replace(oldName, fx.name);
                this.checkChildrenPropertiesAndReplaceExpresseion(anim, oldName, fx.name);
            }
        }
        return fx;
    }
}
AnimationBuilder.prototype.checkChildrenPropertiesAndReplaceExpresseion = function (parentProperty, oldExp, newExp) {
    for (var i = 1; i <= parentProperty.numProperties; i++) {
        var property = parentProperty.property(i);
        try {
            if (property.expressionEnabled && property.expression && property.expression != '') {
                var re = new RegExp(oldExp, 'g');
                property.expression = property.expression.replace(re, newExp);
                property.expressionEnabled = false;
                property.expressionEnabled = true;
            }
        }
        catch (e) {
         }
        if (property.numProperties) {
            this.checkChildrenPropertiesAndReplaceExpresseion(property, oldExp, newExp);
        }
    }
}
AnimationBuilder.prototype.checkChildrenPropertiesAndReversRTLStatus = function (parentProperty) {
    for (var i = 1; i <= parentProperty.numProperties; i++) {
        var property = parentProperty.property(i);
        try {
            if (property.expressionEnabled && property.expression && property.expression != '') {
                var rtlReg = /RTL\s{0,3}=\s{0,3}(\d)/gm;
                var checkRTL = /^\/\*RTL\*\/$/gm;
                var matchs = rtlReg.exec(property.expression);
                if (matchs && matchs.length >= 2) {
                    var RTLStatus = parseInt(matchs[1]);
                    if (RTLStatus == 0) RTLStatus = 1;
                    else RTLStatus = 0;
                    if(checkRTL.test(property.expression)){
                        property.expression = property.expression.replace(checkRTL, '');
                        property.expression = property.expression.replace(matchs[0], 'RTL = ' + RTLStatus);
                    }
                    else{
                        property.expression = "/*RTL*/\r\n" + property.expression.replace(matchs[0], 'RTL = ' + RTLStatus);
                    }
                    property.expressionEnabled = false;
                    property.expressionEnabled = true;
                }
            }
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
        if (property.numProperties) {
            this.checkChildrenPropertiesAndReversRTLStatus(property);
        }
    }
}
AnimationBuilder.prototype.checkChildrenPropertiesAndGetRTLStatus = function (parentProperty) {
    for (var i = 1; i <= parentProperty.numProperties; i++) {
        var property = parentProperty.property(i);
        try {
            if (property.expressionEnabled && property.expression && property.expression != '') {
                var rtlReg = /RTL\s{0,3}=\s{0,3}(\d)/gm;
                var checkRTL = /^\/\*RTL\*\/$/gm;
                if(rtlReg.test(property.expression)){
                    return checkRTL.test(property.expression);
                } 
            }
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
        if (property.numProperties) {
            return this.checkChildrenPropertiesAndGetRTLStatus(property);
        }
    }
}
AnimationBuilder.prototype.getRandomKey = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
AnimationBuilder.prototype.getFileName = function (filePath) {
    var fileName = filePath.split(/(\\|\/)/g).pop();
    return fileName.substr(0, fileName.lastIndexOf('.'));
}

AnimationBuilder.prototype.checkIfeffectWithTypeExistOnLayer = function (typeName, layer) {
    var effects = layer.property("ADBE Effect Parade");
    var count = 0;
    for (var i = 1; i <= effects.numProperties; i++) {
        var eff = effects.property(i)
        if (textAnimatorAfterEffectsObject.isAnimationBuilderProperty(eff)) {
            var effectProps = this.getPropsFromString(eff.name);
            if (effectProps.typeName === typeName) {
                count++;
            }
        }
    }
    return count;
}

AnimationBuilder.prototype.changeRTLStatus = function (effectProp) {
    var layer = effectProp.parentProperty.parentProperty;
    if (layer) {
        var textPeroperties = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var textPropertiesLength = textPeroperties.numProperties;
        for (var i = textPropertiesLength; i >= 1; i--) {
            var animator = textPeroperties.property(i);
            if (animator.name.indexOf(effectProp.name) > -1) {
                this.checkChildrenPropertiesAndReversRTLStatus(animator);
            }
        }
    }
}
AnimationBuilder.prototype.getRTLStatus = function (effectProp){
    var layer = effectProp.parentProperty.parentProperty;
    var RTL = false;
    if (layer) {
        var textPeroperties = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var textPropertiesLength = textPeroperties.numProperties;
        for (var i = textPropertiesLength; i >= 1; i--) {
            var animator = textPeroperties.property(i);
            if (animator.name.indexOf(effectProp.name) > -1) {
                RTL = this.checkChildrenPropertiesAndGetRTLStatus(animator);
            }
        }
    }
    return RTL;
}

var animationBuilderObject = new AnimationBuilder();
$._AnimationBuilder = {
    applyIn: function (presetPath) {
        var layer = app.project.activeItem.selectedLayers[0];
        animationBuilderObject.addMarker(layer, animationBuilderObject.markersName.In, layer.inPoint, 2.5, false);
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        animationBuilderObject.universalAppliedFxOfPreset(presetPath, layer);
        layer.selected = false;
        layer.selected = true;

    },
    applyOut: function (presetPath) {
        var layer = app.project.activeItem.selectedLayers[0];
        animationBuilderObject.addMarker(layer, animationBuilderObject.markersName.Out, layer.outPoint - 2.5, 2.5, false);
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        animationBuilderObject.universalAppliedFxOfPreset(presetPath, layer);
        layer.selected = false;
        layer.selected = true;
    },
    applyBoth: function (presetPath) {
        presetPath = JSON.parse(presetPath);
        var layer = app.project.activeItem.selectedLayers[0];
        this.applyIn(presetPath[0]);
        layer.selected = false;
        layer.selected = true;
        this.applyOut(presetPath[1]);
    },
    applyEffect: function (presetPath) {
        var layer = app.project.activeItem.selectedLayers[0];
        //animationBuilderObject.addMarker(layer, animationBuilderObject.markersName.Out, layer.outPoint - 2.5, 2.5, false);
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        animationBuilderObject.universalAppliedFxOfPreset(presetPath, layer);
        layer.selected = false;
        layer.selected = true;
    },
    removeEffect: function (prop) {
        animationBuilderObject.removeEffect(prop);
    },
    changeRTLStatus: function (prop) {
        animationBuilderObject.changeRTLStatus(prop);
    },
    getRTLStatus: function (prop){
        return animationBuilderObject.getRTLStatus(prop);
    }
}