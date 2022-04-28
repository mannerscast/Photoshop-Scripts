
var jpgSaveOptions = new JPEGSaveOptions(); jpgSaveOptions.embedColorProfile = true; jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE; jpgSaveOptions.matte = MatteType.NONE; jpgSaveOptions.quality = 10;
var pngSaveOptions = new ExportOptionsSaveForWeb(); pngSaveOptions.format = SaveDocumentType.PNG; pngSaveOptions.PNG8 = false; pngSaveOptions.quality = 100;
var pdfSaveOptions = new PDFSaveOptions(); pdfSaveOptions.presetFile = "High Quality Print"; pdfSaveOptions.jpegQuality = 12; pdfSaveOptions.preserveEditing = false; pdfSaveOptions.layers = false; pdfSaveOptions.encoding = PDFEncoding.JPEG; pdfSaveOptions.embedColorProfile = false; pdfSaveOptions.optimizeForWeb = true; pdfSaveOptions.colorConversion = false;

var mergeFolder;

function importImage (source, destination, name, positionX, positionY, sizeX, sizeY, visible) {  ///********* WILL NEED TO BE CALLED IN ORDER OF PLACEMENT .. NO PLACEMENT CONTROL************
	var placedImage;
	if (true) { // if all needed vars are available
		if (typeof source == 'string') {
			try { 
				activeDocument = destination;
				var theFile = new File(source);
				var import_desc = new ActionDescriptor();    
				import_desc.putPath( charIDToTypeID('null'), new File(theFile) );    
				import_desc.putEnumerated( charIDToTypeID('FTcs'), charIDToTypeID('QCSt'), charIDToTypeID('Qcsa') );    
				var place_desc = new ActionDescriptor();    
				place_desc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), 0.000000 );    
				place_desc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), 0.000000 );    
				import_desc.putObject( charIDToTypeID('Ofst'), charIDToTypeID('Ofst'), place_desc );    
				executeAction( charIDToTypeID('Plc '), import_desc, DialogModes.NO );
			} catch (e) { alert('Error importing file: '+e); }
			
		} else {
			try { 
				activeDocument = getParentDocument(source);
				source.duplicate(destination);
			} catch (e) { alert('Error importing layer: '+e); return false; }
		} 
	
		activeDocument = destination;
		placedImage = destination.activeLayer;
		activeDocument.activeLayer.name = name; // Is this needed?
		var layerBounds = placedImage.bounds;
		
		if (positionX != null || positionY != null) {
			try {
				var deltaX = positionX - (layerBounds[0].value);
				var deltaY = positionY - (layerBounds[1].value);
				placedImage.translate(deltaX, deltaY);
			} catch (e) { alert('Error moving layer: '+e); }
		}
	
		if (sizeX != null || sizeY != null) {
			try {
				var layerWidth = layerBounds[2].value - layerBounds [0].value;
				var layerHeight = layerBounds[3].value - layerBounds [1].value;
				var newWidth = sizeX / layerWidth * 100;
				var newHeight = sizeY / layerHeight * 100;
				placedImage.resize(newWidth,newHeight, AnchorPosition.TOPLEFT);
			} catch (e) { alert('Error resizing layer: '+e); }
		}
		if (!visible) hide(placedImage);
	}
	return placedImage;
}

function saveImage(folderName, fileName, ext) {
		
	/*activeDocument.suspendHistory('Save Image: '+fileName+'.'+ext, 'runSave()');
	function runSave() {
		activeDocument.trim(TrimType.TRANSPARENT);//*/
		var fileRef; 
		// Set up Save Folder
		try {
			var savePath = docPath+'/'+folderName;
			var folder = Folder(savePath);
			if (!folder.exists)  folder.create();
		} catch(e) {  alert("Error creating folder: "+e); }
		// Save the images
		fileRef = new File(savePath+"/"+fileName+"."+ext);
		if (ext == 'png') activeDocument.exportDocument(fileRef, ExportType.SAVEFORWEB, pngSaveOptions);
		if (ext == 'jpg') activeDocument.saveAs(fileRef, jpgSaveOptions, true, Extension.LOWERCASE);
		if (ext == 'pdf') activeDocument.saveAs(fileRef, pdfSaveOptions, true, Extension.LOWERCASE);
		return fileRef;
	/*}
	activeDocument.activeHistoryState = activeDocument.historyStates[activeDocument.historyStates.length];//*/
}

function findLayers(name, ignoreHidden) {
	var pass = true;
	var returnArray = new Array(); 
	do { 
		try {
			selectLayer(name);
			activeDocument.activeLayer.name = name+'_x';
			if (ignoreHidden && activeDocument.activeLayer.visible == true) returnArray.push(activeDocument.activeLayer);
			else if (!ignoreHidden) returnArray.push(activeDocument.activeLayer);
		} catch (e) { pass = false; }
	} while (pass); 
	
	for (var i = 0; i < returnArray.length; i++) {
		var temp_name = returnArray[i].name.split('_');
		returnArray[i].name = temp_name[0];
	}
	if (returnArray.length) return returnArray;
	else return false;
}

function selectLayer(name) {
		var idnull = charIDToTypeID( "null" );
		var idLyr = charIDToTypeID( "Lyr " );
		var idslct = charIDToTypeID( "slct" );
		var idMkVs = charIDToTypeID( "MkVs" );
		
		var find_desc = new ActionDescriptor();
		var find_ref = new ActionReference();
		find_ref.putName(idLyr, name);
		find_desc.putReference(idnull, find_ref);
		find_desc.putBoolean(idMkVs, false);
		executeAction(idslct, find_desc, DialogModes.NO);
}

function merge() {
	if (mergeFolder == undefined) {  mergeFolder= activeDocument.layerSets.add(); mergeFolder.name = 'Merged'; } 
	var layerRef = activeDocument.artLayers.add();
	var merge_desc = new ActionDescriptor();
	merge_desc.putBoolean(charIDToTypeID('Dplc'), true);
	executeAction(stringIDToTypeID('mergeVisible'), merge_desc, DialogModes.NO);
	activeDocument.activeLayer.visible = false;
	var mergedLayer = activeDocument.activeLayer;
	var moveFolder = mergedLayer.parent.layerSets.add();
	mergedLayer.move(moveFolder,ElementPlacement.INSIDE);
	moveFolder.move(mergeFolder,ElementPlacement.PLACEBEFORE);
	mergedLayer.move(mergeFolder,ElementPlacement.INSIDE);
	moveFolder.remove();
	//activeDocument.activeLayer.move(mergeFolder,ElementPlacement.INSIDE);
	return mergedLayer;
}
		
function deleteLayers(target,startPosition) {
	for (var i=(startPosition-1); i<target.layers.length; i++) {
		try {
			activeDocument.activeLayer = target.layers[i];
			var merge_desc = new ActionDescriptor();
			executeAction(stringIDToTypeID('mergeLayers'), merge_desc, DialogModes.NO);
		} catch(e) { if (developerMode) alert(e); break; }
	}
	while (target.layers.length > (startPosition-1)) { 
		try {
			activeDocument.activeLayer = target.layers[(startPosition-1)];
			activeDocument.activeLayer.allLocked = false;
			target.layers[(startPosition-1)].remove();  
		} catch(e) { if (developerMode) alert(e); break; }
	}
}

function getParentDocument(ref) {
	var result;
	var parent = ref.parent;
	if (parent.typename == 'Document') { return parent; }
	else result = getParentDocument(parent);
	return result;
}

function getDocName(ref) { 
	try { 
		var name = ref.name;
		var name = name.slice(0,name.lastIndexOf('.'));
	
		// Filter common file name conventions
		if (name.search(/-wide/i) != -1) name = name.slice(0,name.search(/-wide/i));
		if (name.search(/_wide/i) != -1)name = name.slice(0,name.search(/_wide/i));
		
		if (name.search(/-std/i) != -1)name = name.slice(0,name.search(/-std/i));
		if (name.search(/_std/i) != -1)name = name.slice(0,name.search(/_std/i));
		
		if (name.search(/-social/i) != -1)name = name.slice(0,name.search(/-social/i));
		if (name.search(/_social/i) != -1)name = name.slice(0,name.search(/_social/i));
		
		if (name.search(/#/i) != -1)name = name.slice(0,docName.search(/#/i));
		
		//Replace spaces with underscores and capitalize
		name = name.split('_').join('-').replace(/\b./g, function(m){ return m.toUpperCase(); }).split(' ').join('_'); 
		
		return name;		
	} catch(e) { alert(e); return "document"; }
}

function addCropMarks() {
	var cropMarksPath = "~/Desktop/Assets/Print/Crop Marks/";
	activeDocument.layers[activeDocument.layers.length-1].isBackgroundLayer = false;  //Turns off background layers.
	activeDocument.activeLayer = activeDocument.layers[0];
	//var docWidth = activeDocument
	if (activeDocument.resolution == 150) {
		activeDocument.resizeCanvas(activeDocument.width+50, activeDocument.height+50, AnchorPosition.MIDDLECENTER);
		var topLeftCrop = importImage(cropMarksPath+"150/cropMarkTL.png",activeDocument,'Top Left Crop',0,0,null,null,true);
		var topRightCrop = importImage(cropMarksPath+"150/cropMarkTR.png",activeDocument,'Top Right Crop',activeDocument.width-45,0,null,null,true);
		var bottomLeftCrop = importImage(cropMarksPath+"150/cropMarkBL.png",activeDocument,'Bottom Left Crop',0,activeDocument.height-45,null,null,true);
		var bottomRightCrop = importImage(cropMarksPath+"150/cropMarkBR.png",activeDocument,'Bottom Right Crop',activeDocument.width-45,activeDocument.height-45,null,null,true);
	}
	if (activeDocument.resolution == 300) {
		activeDocument.resizeCanvas(activeDocument.width+100, activeDocument.height+100, AnchorPosition.MIDDLECENTER);
		var topLeftCrop = importImage(cropMarksPath+"300/cropMarkTL.png",activeDocument,'Top Left Crop',0,0,null,null,true);
		var topRightCrop = importImage(cropMarksPath+"300/cropMarkTR.png",activeDocument,'Top Right Crop',activeDocument.width-90,0,null,null,true);
		var bottomLeftCrop = importImage(cropMarksPath+"300/cropMarkBL.png",activeDocument,'Bottom Left Crop',0,activeDocument.height-90,null,null,true);
		var bottomRightCrop = importImage(cropMarksPath+"300/cropMarkBR.png",activeDocument,'Bottom Right Crop',activeDocument.width-90,activeDocument.height-90,null,null,true);
	}
}


function getAspectRatio (ref) { return getWidth(ref)/getHeight(ref); }

function getWidth(ref) { if (ref) { return ref.bounds[2]-ref.bounds[0]; } else return false; }
function getHeight(ref) { if (ref) { return ref.bounds[3]-ref.bounds[1]; } else return false; }

function hide(ref) { if (ref) { if (ref.length != null) for(var i=0; i<ref.length; i++) ref[i].visible = false; else ref.visible = false; } }
function show(ref) { if (ref) { if (ref.length != null) for(var i=0; i<ref.length; i++) ref[i].visible = true; else ref.visible = true; } }