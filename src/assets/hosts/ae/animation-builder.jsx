
function TextAnimator() {
    this.markersName = {
        "In": "Intro",
        "Out": "Outro"
    }
}
TextAnimator.prototype.getPropsFromString = function (name) {
    var regex = /^([A-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([a-zA-Z0-9\s]+)_([A-Z])[-]{0,1}([\w\d]{0,3})?$/g
    var props = regex.exec(name);
    return {
        projectKey: props[1],
        name: props[2],
        typeName: props[3],
        directionName: props[4],
        randomKey: props[5]
    }
}
TextAnimator.prototype.addMarker = function (layer, markerComment, time, duration, createIfExist, label) {
    if (!createIfExist && this.checkMarkerExist(layer, markerComment)) return 0;
    var myMarkerVal = new MarkerValue(markerComment);
    myMarkerVal.duration = duration;
    if(label && textAnimatorAfterEffectsObject.appVersion>=16){
        myMarkerVal.label = label;
    }
    layer.property("ADBE Marker").setValueAtTime(time, myMarkerVal);
}
TextAnimator.prototype.removeMarker = function (layer, markerComment) {
    for (var i = layer.property("ADBE Marker").numKeys; i >= 1; i--) {
        if (layer.property("ADBE Marker").keyValue(i).comment == markerComment) {
            layer.property("ADBE Marker").removeKey(i);
            break;
        }
    }
}

TextAnimator.prototype.checkMarkerExist = function (layer, markerComment) {
    var markerIsExist = false;
    for (var i = 1; i <= layer.property("ADBE Marker").numKeys; i++) {
        if (layer.property("ADBE Marker").keyValue(i).comment == markerComment) {
            markerIsExist = true;
            break;
        }
    }
    return markerIsExist;

}
TextAnimator.prototype.removeEffect = function (effect) {
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
        if(effectProps.typeName != "Effect"){
            if (this.checkIfeffectWithTypeExistOnLayer(effectProps.typeName, layer) == 0 &&
                this.checkMarkerExist(layer, this.markersName[effectProps.typeName])) {
                this.removeMarker(layer, this.markersName[effectProps.typeName]);
            }
        }
        else{
            this.removeMarker(layer, "In-"+effectProps.randomKey);
            this.removeMarker(layer, "Out-"+effectProps.randomKey);
        }
    }
}



TextAnimator.prototype.universalAppliedFxOfPreset = function (presetPath, layer) {
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
        fx.enabled = false;
        fx.enabled = true;
        return fx;
    }
}

TextAnimator.prototype.universalMarkerFxOfPreset = function (presetName,newMarkerName, oldMarkerName, layer) {
    var fx = layer.property("ADBE Effect Parade").property(presetName);
    if (fx) {
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        for (var i = 1; i <= animators.numProperties; i++) {
            var anim = animators.property(i);
            if (anim.name.indexOf(presetName) > -1) {
                this.checkChildrenPropertiesAndReplaceExpresseion(anim, oldMarkerName, newMarkerName);
            }
        }
        fx.enabled = false;
        fx.enabled = true;
        return fx;
    }
}
TextAnimator.prototype.checkChildrenPropertiesAndReplaceExpresseion = function (parentProperty, oldExp, newExp) {
    for (var i = 1; i <= parentProperty.numProperties; i++) {
        var property = parentProperty.property(i);
        try {
            if (property.expressionEnabled && property.expression && property.expression != '') {
                var re = new RegExp(oldExp, 'g');
                property.expressionEnabled = false;
                property.expression = property.expression.replace(re, newExp);
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
TextAnimator.prototype.checkChildrenPropertiesAndReversRTLStatus = function (parentProperty) {
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
TextAnimator.prototype.checkChildrenPropertiesAndGetRTLStatus = function (parentProperty) {
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
TextAnimator.prototype.getRandomKey = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
TextAnimator.prototype.getFileName = function (filePath) {
    var fileName = filePath.split(/(\\|\/)/g).pop();
    return fileName.substr(0, fileName.lastIndexOf('.'));
}

TextAnimator.prototype.checkIfeffectWithTypeExistOnLayer = function (typeName, layer) {
    var effects = layer.property("ADBE Effect Parade");
    var count = 0;
    for (var i = 1; i <= effects.numProperties; i++) {
        var eff = effects.property(i)
        if (textAnimatorAfterEffectsObject.isTextAnimatorProperty(eff)) {
            var effectProps = this.getPropsFromString(eff.name);
            if (effectProps.typeName === typeName) {
                count++;
            }
        }
    }
    return count;
}

TextAnimator.prototype.changeRTLStatus = function (effectProp) {
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
TextAnimator.prototype.getRTLStatus = function (effectProp){
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
TextAnimator.prototype.activeMotionBlur = function(comp, layer){
    if(comp && layer){
        comp.motionBlur = true;
        layer.motionBlur = true;
    }
}
TextAnimator.prototype.getBestMarkerTime = function(time, layer, goLeft){
    var markerProperty = layer.property("ADBE Marker");
    if(markerProperty.numKeys === 0 ) return time>0? time: 0;
    var keyIndex = markerProperty.nearestKeyIndex(time);
    if(!keyIndex) return time;
    var markerTimeAtTimeClosest = markerProperty.keyTime(keyIndex);
    if(Math.abs(markerTimeAtTimeClosest-time)>0.5){
        return time>0? time: this.getBestMarkerTime(time+0.5,layer, false);
    }
    else{
        if(goLeft) return this.getBestMarkerTime((time-0.5>0)?(time-0.5):(time+0.5), layer, time>0 ?goLeft: false);
        else return this.getBestMarkerTime(time+0.5, layer, goLeft);
    }
}

TextAnimator.prototype.getMarkerUniqueLabel = function (layer){
    if(textAnimatorAfterEffectsObject.appVersion < 16) return -1;
    var labels = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    for(var i = 1; i<= layer.property("ADBE Marker").numKeys;i++){
        var markerLabel = layer.property("ADBE Marker").keyValue(i).label;
        if(markerLabel>0 && markerLabel <=16){
            var index = this.searchArrayAndReturnIndex(labels, markerLabel);
            if(index > -1) labels.splice(index,1); 
        }
    }
    if(labels.length==0) labels = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    return labels[textAnimatorAfterEffectsObject.random(0,labels.length-1)];
}
TextAnimator.prototype.searchArrayAndReturnIndex = function(array, el){
    var index = -1;
    for(var i = 0; i<array.length;i++){
        if(array[i]==el){
            index = i;
            break;
        }
    }
    return index;
}


var TextAnimatorObject = new TextAnimator();
$._TextAnimator = {
    applyIn: function (presetPath, both) {
        var layer = app.project.activeItem && app.project.activeItem.selectedLayers[0];
        if(layer instanceof TextLayer) {
        if(!both) app.beginUndoGroup("Apply In");
        TextAnimatorObject.addMarker(layer, TextAnimatorObject.markersName.In, layer.inPoint, 2, false);
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        TextAnimatorObject.universalAppliedFxOfPreset(presetPath, layer);
        if (app.project.activeItem.selectedLayers.length == 1 && !both) {
            $._textAnimatorAfterEffects.fireLiveSettingEvent();
          }
        TextAnimatorObject.activeMotionBlur(app.project.activeItem, layer);
        if(!both) app.endUndoGroup();
        }
        else {
            alert('please select a text layer');
        }

    },
    applyOut: function (presetPath, both) {
        var layer = app.project.activeItem && app.project.activeItem.selectedLayers[0];
        if(layer instanceof TextLayer) {
        if(!both) app.beginUndoGroup("Apply Out");
        TextAnimatorObject.addMarker(layer, TextAnimatorObject.markersName.Out, layer.outPoint - 2.1, 2, false);
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        TextAnimatorObject.universalAppliedFxOfPreset(presetPath, layer);
        if (app.project.activeItem.selectedLayers.length == 1 && !both) {
            $._textAnimatorAfterEffects.fireLiveSettingEvent();
          }
        TextAnimatorObject.activeMotionBlur(app.project.activeItem, layer);
        if(!both) app.endUndoGroup();
        }
        else {
            alert('please select a text layer');
        }
    },
    applyBoth: function (presetPath) {
        presetPath = JSON.parse(presetPath);
        var layer = app.project.activeItem && app.project.activeItem.selectedLayers[0];
        if(layer instanceof TextLayer) {
        app.beginUndoGroup("Apply In and Out");
        this.applyIn(presetPath[0], true);
        if (app.project.activeItem.selectedLayers.length == 1) {
            $._textAnimatorAfterEffects.fireLiveSettingEvent();
          }
        this.applyOut(presetPath[1], true);
        TextAnimatorObject.activeMotionBlur(app.project.activeItem, layer);
        app.endUndoGroup();

        }
        else {
            alert('please select a text layer');
        }

    },
    applyEffect: function (presetPath) {
        var layer = app.project.activeItem && app.project.activeItem.selectedLayers[0];
        var comp =  app.project.activeItem;
        if(layer instanceof TextLayer) {
        app.beginUndoGroup("Apply Effect");
        textAnimatorAfterEffectsObject.applyPreset(presetPath);
        var fx = TextAnimatorObject.universalAppliedFxOfPreset(presetPath, layer);
        var fxInfo = TextAnimatorObject.getPropsFromString(fx.name);
        var inMarkerName = "In-" + fxInfo.randomKey;
        var outMarkerName = "Out-"+ fxInfo.randomKey;
        var colorLabel = TextAnimatorObject.getMarkerUniqueLabel(layer);
        TextAnimatorObject.addMarker(layer,inMarkerName , TextAnimatorObject.getBestMarkerTime(comp.time-2, layer, true), 1, false, colorLabel);
        TextAnimatorObject.addMarker(layer,outMarkerName ,TextAnimatorObject.getBestMarkerTime(comp.time + 1, layer, false), 1, false, colorLabel);
        TextAnimatorObject.universalMarkerFxOfPreset(fx.name, "= '"+inMarkerName+"';","= 'In';", layer);
        TextAnimatorObject.universalMarkerFxOfPreset(fx.name, "= '"+outMarkerName+"';","= 'Out';", layer);
        if (app.project.activeItem.selectedLayers.length == 1) {
            $._textAnimatorAfterEffects.fireLiveSettingEvent();
          }
        TextAnimatorObject.activeMotionBlur(app.project.activeItem, layer);
        app.endUndoGroup();
        }
        else {
            alert('please select a text layer');
        }

    },
    removeEffect: function (prop) {
        app.beginUndoGroup("Remove Effect");
        TextAnimatorObject.removeEffect(prop);
        app.endUndoGroup();
    },
    changeRTLStatus: function (prop) {
        app.beginUndoGroup("Change RTL Status");
        TextAnimatorObject.changeRTLStatus(prop);
        app.endUndoGroup();
    },
    getRTLStatus: function (prop){
        return TextAnimatorObject.getRTLStatus(prop);
    }
}