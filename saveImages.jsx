#include "ImportFunctions.jsx"
#target photoshop

//changes

var scriptTitle = 'Save Script v2.5';
if (documents.length != 0) {
	var originalUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;
	
	var doc = activeDocument;
	var docPath = doc.path;
	var confirmed = true; //For dialog confirmations
	var saved = doc.saved;
	
	var newDoc,mergeFolder;
	var widescreen,stdscreen,TITLE,CONTENT,ALT,CONTENTB,BACKGROUND,LOWERTHIRD,title,subtitle;
	var tGraphicPsdLayout,tGraphicCheckerLayout;
		
	if (doc.height/doc.width == 0.5625) widescreen = true; else widescreen = false;
	if (doc.height/doc.width == 0.75) stdscreen = true; else stdscreen = false;
	
	var thisFile = doc.path + '/' + doc.name; // For re-opening
	 
	var docName = getDocName(activeDocument);
	
	try{
		if (docName.search(/_wide/i) != -1) docName = docName.slice(0,docName.search(/_wide/i));
		else if (docName.search(/-wide/i) != -1) docName = docName.slice(0,docName.search(/-wide/i));
		else if (docName.search(/_std/i) != -1) docName = docName.slice(0,docName.search(/_std/i));
		else if (docName.search(/-std/i) != -1) docName = docName.slice(0,docName.search(/-std/i));
		else if (docName.search(/-MASTER/i) != -1) docName = docName.slice(0,docName.search(/-MASTER/i));
		else if (docName.search(/_MASTER/i) != -1) docName = docName.slice(0,docName.search(/_MASTER/i));
	} catch (e) { alert('An error has occured while collecting the file name.'); }
	docName += (widescreen?"_WIDE":"")+(stdscreen?"_STD":"");
	
	doc.suspendHistory(scriptTitle, 'main()');
	function main() { 
		if (!widescreen && !stdscreen) confirmed = confirm('The document is set to an incorrect aspect ratio. Would you like to continue?');
		if (confirmed) {
					
			/*--------Find Layers--------*/			
			
			TITLE = findLayers('TITLE', false);
			CONTENT = findLayers('CONTENT', false);
			BACKGROUND = findLayers('BACKGROUND', false);
			CONTENTB = findLayers('CONTENT B', false);
			ALT = findLayers('ALT',false);
			if (!ALT) ALT = findLayers('ALTERNATE',false);
			LOWERTHIRD = findLayers('LOWER THIRD',false);
			
			var titleVisible, contentVisible, altVisible;
			
			if (TITLE) titleVisible = TITLE[0].visible;
			if (CONTENT) contentVisible = CONTENT[0].visible;
			if (ALT) altVisible = ALT[0].visible;
			
			show(TITLE); //to search for title/subtitle
			show(CONTENT); //to search for title/subtitle
			show(ALT); //to search for title/subtitle
			
			title = findLayers('title', true);
			subtitle = findLayers('subtitle', true);
			
			/*--------Hide Main Folders --------*/

			hide(TITLE);
			hide(CONTENT);
			hide(ALT);
			if (titleVisible) show(TITLE);
			if (contentVisible) show(CONTENT);
			if (altVisible) show(ALT);
			
			/*--------Open Dialog--------*/
			createDialog();
			
		}//confirmed
	}
	
	preferences.rulerUnits = originalUnits; 
} else { alert('Error: No documents open.'); }

function createDialog() {
	try {
		
		var dlg = new Window ('dialog', scriptTitle, [0,0,380,255]);
		
		var foldersPnl = dlg.add('panel',[20,15,180,110],'Folders');
		
			foldersPnl.add('statictext',[15,10,35,30],(TITLE?'✓':'✕'));
			foldersPnl.add('statictext',[15,30,35,50],((CONTENT || ALT)?'✓':'✕'));
			foldersPnl.add('statictext',[15,50,35,70],((BACKGROUND ||CONTENTB || LOWERTHIRD)?'✓':'✕'));
			
			foldersPnl.add('statictext',[35,10,160,30],'TITLE');
			foldersPnl.add('statictext',[35,30,160,50],CONTENT?'CONTENT':(ALT?'ALTERNATE':'MISSING FOLDER'));
			foldersPnl.add('statictext',[35,50,160,70],(CONTENTB||BACKGROUND)?'BACKGROUND':(LOWERTHIRD?'LOWER THIRD':'MISSING FOLDER'));
		
		var layersPnl = dlg.add('panel',[200,15,360,110],'Layers');
		
			layersPnl.add('statictext',[15,10,35,30],(title.length>1?'✓':'✕'));
			layersPnl.add('statictext',[15,30,35,50],(subtitle.length>=1?'✓':'✕'));
			
			layersPnl.add('statictext',[35,10,160,30],'Title ['+title.length+']');
			layersPnl.add('statictext',[35,30,160,50],'Subtitle ['+subtitle.length+']');
			
		var optionsPnl = dlg.add('panel',[20,120,360,155]);
			
			var makeThumbs = optionsPnl.add('checkbox',[20,2,145,30],' Create Thumbnails'); makeThumbs.value = true; if (CONTENT || stdscreen) { makeThumbs.value = false; makeThumbs.enabled = false; }
			var reopen = optionsPnl.add('checkbox',[180,2,340,30],' Reopen After Save'); reopen.value = true; 
		
		var buttonGrp = dlg.add('group', [10,165,370,230]);
			var goBtn = buttonGrp.add('button', [0,0,360,30], 'Go'+(saved?'':' - Document not saved!'));
			var cancel = buttonGrp.add('button', [0,35,360,65], 'Cancel');
		
		goBtn.onClick = function () {
			dlg.close();

			if ((saved) || (!saved && confirm('The document is not saved. Would you like to continue?'))) { 
				saveFiles(makeThumbs.value);			
				if (reopen.value) { 
					app.displayDialogs = DialogModes.NO; // To prevent Typekit alert from reactivating the dialog
					try {
						var file = new File( thisFile );
						app.open(file);
					} catch (e) {}
					app.displayDialogs = DialogModes.ERROR; // Allows errors to show again
				}
			} else { doc.activeHistoryState = doc.historyStates[doc.historyStates.length - 1]; }
		}
		cancel.onClick = function () {
			dlg.close();
			doc.activeHistoryState = doc.historyStates[doc.historyStates.length - 1];
		}
	
		dlg.center(); dlg.show();
		
	} catch(e) {
		alert (e);
	}
}

function saveFiles(makeThumbs) {

	doc.layers[doc.layers.length-1].isBackgroundLayer = false;  //Turns off background layers.
	
	var t, t_nv, t_nt, c, c_nv, c_nt, bg, a, a_nt, lt;
	
	hide(TITLE); hide(CONTENT); hide(ALT); hide(BACKGROUND);hide(CONTENTB); hide(LOWERTHIRD);
	
	try {
		if (TITLE && CONTENT && (CONTENTB || BACKGROUND)) { 
			
			show(TITLE); 
			show(title); show(subtitle); t = merge(); hide(subtitle); if (subtitle) t_nv = merge(); hide(title); t_nt = merge();
			hide(TITLE);
			
			show(CONTENT); 
			show(title); show(subtitle); c = merge(); hide(subtitle); if (subtitle) c_nv = merge(); hide(title); c_nt = merge();
			hide(CONTENT);
			
			if (BACKGROUND) { show(BACKGROUND); bg = merge(); hide(BACKGROUND);  }
			if (CONTENTB) { show(CONTENTB); bg = merge(); hide(CONTENTB); }
			if (!BACKGROUND && !CONTENTB) { bg = merge(); }
		}
		if (TITLE && ALT && LOWERTHIRD) { 
		
			show(TITLE); 
			show(title); show(subtitle); t = merge(); hide(subtitle); if (subtitle) t_nv = merge(); hide(title); t_nt = merge();
			hide(TITLE); 
			
			show(ALT); 
			show(title); a = merge(); hide(title); a_nt = merge();
			hide(ALT); 
			
			show(LOWERTHIRD);
			lt = mergeLowerThird();
			
			if (makeThumbs) processPromoFiles(t,lt);
			
		}
	} catch (e) { alert ('Merge Error: '+e); }
	
	deleteLayers(activeDocument,2);
	
	try {
		
		if (widescreen) { if (doc.width > 1920 && doc.height > 1080) doc.resizeImage(UnitValue(1920,'px'), UnitValue(1080,'px'), 72, ResampleMethod.BICUBIC); } //Resizes Widescreen
		if (stdscreen) {  if (doc.width > 1440 && doc.height > 1080) doc.resizeImage(UnitValue(1440,'px'), UnitValue(1080,'px'), 72, ResampleMethod.BICUBIC); } //Resizes Standard Screen
	
	} catch (e) { alert ('Resize Error: '+e); }
	
	try {
		
		if (t) { t.visible = true; saveImage('_Images','TT1_'+docName,'jpg'); t.visible = false; }
		
		if (t_nv) { t_nv.visible = true; saveImage('_Images','TT2_'+docName,'jpg'); t_nv.visible = false; }
		
		if (t_nt) { t_nt.visible = true; saveImage('_Images','TT3_'+docName,'jpg'); t_nt.visible = false; }
		
		if (c) { c.visible = true; saveImage('_Images','Alt1_'+docName,'jpg'); c.visible = false; }
		
		if (c_nv) { c_nv.visible = true; saveImage('_Images','Alt2_'+docName,'jpg'); c_nv.visible = false; }
		
		if (c_nt) { c_nt.visible = true; saveImage('_Images','Alt3_'+docName,'jpg'); c_nt.visible = false; }
		
		if (bg) { bg.visible = true; saveImage('_Images',docName+'#preset=tg_bg','jpg'); bg.visible = false; }
		
		if (a) { a.visible = true; saveImage('_Images','Alt1_'+docName,'jpg'); a.visible = false; }
		
		if (a_nt) { a_nt.visible = true; saveImage('_Images','Alt2_'+docName,'jpg'); a_nt.visible = false; }
		
		if (lt) { lt.visible = true; saveImage('_Images','L3_'+docName,'png'); lt.visible = false; }
				
	} catch (e) { alert('Saving Error: '+e); }
	
	doc.close(SaveOptions.DONOTSAVECHANGES);
	
}

function processPromoFiles(t,lt) {

	newDoc = documents.add(1280,720,72,"tempDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
	app.activeDocument = doc;
	var assetPath = "~/Documents/GitHub/Photoshop-Scripts/Assets/Title Graphics/";

	// import in reverse order
	var tGraphicPsdLayout = importImage(t,newDoc,'tGraphicPsdLayout',255,30,771,434,false);
	var tGraphicPsdLayers = importImage(assetPath+"tGraphicPsdLayers.png",newDoc,'tGraphicPsdLayers',650,185,null,null,false);
	var tGraphicPsdLayoutSm = importImage(t,newDoc,'tGraphicPsdLayoutSm',759,397,43,22,false);
	var tGraphicPsdText = importImage(assetPath+"tGraphicPsdText.png",newDoc,'tGraphicPsdText',329,554,null,null,false);
	
	var tGraphicCheckerBG = importImage(assetPath+"tGraphicCheckerBG.png",newDoc,'tGraphicCheckerBG',0,0,null,null,true);
	var ltHeight = Math.round(getHeight(lt) * (1280/1920));
	var tGraphicCheckerLayout = importImage(lt,newDoc,'tGraphicCheckerLayout',0,480-(ltHeight-240),1620,ltHeight,true);
	
	saveImage('_Images','L3_TH_'+docName,'jpg');
	
	hide(tGraphicCheckerLayout); hide(tGraphicCheckerBG);
	show(tGraphicPsdLayoutSm); show(tGraphicPsdLayers); show(tGraphicPsdLayout);  show(tGraphicPsdText);
	
	newDoc.trim(TrimType.TRANSPARENT);
	//saveImage('_Images',docName+'#preset=tg_psd_demo','png');
	
	newDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function mergeLowerThird () {
	var preHeight = doc.height;
	var ltHeight = doc.height/2;
	if (mergeFolder != undefined) {
		if (hasLayerMask('LOWER THIRD')) { 
			var lowerThird = doc.layers.getByName('LOWER THIRD');

			var desc = new ActionDescriptor();  
			var ref = new ActionReference();  
			ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );  
			desc.putReference( charIDToTypeID( "null" ), ref );  
			executeAction( stringIDToTypeID( "selectAllLayers" ), desc, DialogModes.NO );  
			var desc = new ActionDescriptor();  
			var ref = new ActionReference();  
			ref.putClass( stringIDToTypeID('layerSection') );  
			desc.putReference( charIDToTypeID('null'), ref );  
			var ref = new ActionReference();  
			ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
			desc.putReference( charIDToTypeID('From'), ref );  
			executeAction( charIDToTypeID('Mk  '), desc, DialogModes.NO );
			
			var lowerThirdMergeFolder = doc.activeLayer;
			lowerThirdMergeFolder.name = 'LTMergeFolder'; 
			mergeFolder.move(lowerThirdMergeFolder,ElementPlacement.PLACEBEFORE);
			copyMask('LOWER THIRD','LTMergeFolder');
			return merge();
		} else {
			doc.resizeCanvas(doc.width,ltHeight,AnchorPosition.BOTTOMCENTER);
			var tempMerge = merge();
			doc.resizeCanvas(doc.width,preHeight,AnchorPosition.BOTTOMCENTER);
			return tempMerge;
		}
	}
}
function copyMask(sourceLayer, targetLayer) { 
	try {
		var idChnl = charIDToTypeID( "Chnl" );
		var idMsk = charIDToTypeID( "Msk " );
		var idnull = charIDToTypeID( "null" );
		var idLyr = charIDToTypeID( "Lyr " );
		var idslct = charIDToTypeID( "slct" );
		var idMkVs = charIDToTypeID( "MkVs" );
		var idMk = charIDToTypeID( "Mk  " );
		var idNw = charIDToTypeID( "Nw  " );
		var idAt = charIDToTypeID( "At  " );
		var idUsng = charIDToTypeID( "Usng" );
		var idOrdn = charIDToTypeID( "Ordn" );
		var idTrgt = charIDToTypeID( "Trgt" );
		var idLyrI = charIDToTypeID( "LyrI" );
		
		selectLayer(sourceLayer);
		//------
		var selectMask_desc = new ActionDescriptor();
		var selectMask_ref = new ActionReference();
		selectMask_ref.putEnumerated( idChnl, idChnl, idMsk );
		selectMask_desc.putReference( idnull, selectMask_ref );
		selectMask_desc.putBoolean( idMkVs, false );
		executeAction( idslct, selectMask_desc, DialogModes.NO );
		//------
		var copyMask_desc = new ActionDescriptor();
		copyMask_desc.putClass( idNw, idChnl );
		var copyMask_ref = new ActionReference();
		copyMask_ref.putEnumerated( idChnl, idChnl, idMsk );
		copyMask_ref.putName( idLyr, targetLayer );
		copyMask_desc.putReference( idAt, copyMask_ref );
		var copyMask_ref2 = new ActionReference();
		copyMask_ref2.putEnumerated( idChnl, idChnl, idMsk );
		copyMask_ref2.putEnumerated( idLyr, idOrdn, idTrgt );
		copyMask_desc.putReference( idUsng, copyMask_ref2 );
		executeAction( idMk, copyMask_desc, DialogModes.NO );
		return true;
	} catch (e) { return false; }
}

function hasLayerMask(targetLayer) {
	selectLayer (targetLayer);
	try {   
		var ref = new ActionReference();   
		var keyUserMaskEnabled = app.charIDToTypeID( 'UsrM' );   
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyUserMaskEnabled );   
		ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );   
		var desc = executeActionGet( ref );   
		if ( desc.hasKey( keyUserMaskEnabled ) ) { return true; }   
	}catch(e) { }
	return false; 
}  