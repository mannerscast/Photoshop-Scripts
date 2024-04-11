
#include "ImportFunctions.jsx"
#target photoshop

var scriptTitle = 'Social Save Script v1.2';

var assetPath = "~/Documents/GitHub/Photoshop-Scripts/Assets/Social/";

/*******Asset Paths********/

if (documents.length != 0) {
	
	var originalUnits = app.preferences.rulerUnits;
	app.preferences.rulerUnits = Units.PIXELS;
	
	var doc = activeDocument;
	
	var docName, docPath;
	
	var hLayout,vLayout,sqLayout,wLayout;
	
	if (getDocType() == 'psd') {
		
		docName = getDocName(activeDocument);
		docPath = doc.path;
		
		var hLayerRef = findLayers ('Social Landscape', true);
		var vLayerRef = findLayers ('Social Portrait', true);
		var sqLayerRef = findLayers ('Social Square', true);

		var layerTitles = findLayers ('title', true);
		var layerSubtitles = findLayers ('subtitle', true);
		
		show(hLayerRef); hide(vLayerRef); hide(sqLayerRef);
		hLayout = merge(hLayerRef);
		saveImage('_Images/With Text','Social Landscape','png');
		hide(layerTitles); hide(layerSubtitles);
		saveImage('_Images/Without Text','Social Landscape','png');
		show(layerTitles); show(layerSubtitles);

		hide(hLayerRef); show(vLayerRef);
		vLayout = merge(vLayerRef);
		saveImage('_Images/With Text','Social Portrait','png');
		hide(layerTitles); hide(layerSubtitles);
		saveImage('_Images/Without Text','Social Portrait','png');
		show(layerTitles); show(layerSubtitles);

		hide(vLayerRef); show(sqLayerRef);
		sqLayout = merge(sqLayerRef);
		saveImage('_Images/With Text','Social Square','png');
		hide(layerTitles); hide(layerSubtitles);
		saveImage('_Images/Without Text','Social Square','png');
		show(layerTitles); show(layerSubtitles);


	} else { 
		for (var i = 0; i < app.documents.length; i++) {
			app.activeDocument = app.documents[i]; 
			if (getDocType() == 'jpg') { 
				if (getAspectRatio(activeDocument.activeLayer) == (16/9)) { if (!docPath) docPath = doc.path; if (!docName) docName = getDocName(activeDocument); hLayout = activeDocument.activeLayer; }
				if (getAspectRatio(activeDocument.activeLayer) == (9/16)) { if (!docPath) docPath = doc.path; if (!docName) docName = getDocName(activeDocument); vLayout = activeDocument.activeLayer; }
				if (getAspectRatio(activeDocument.activeLayer) == (1/1)) {  if (!docPath) docPath = doc.path; if (!docName) docName = getDocName(activeDocument); sqLayout = activeDocument.activeLayer; }
				if (getAspectRatio(activeDocument.activeLayer) == (851/315)) { if (!docPath) docPath = doc.path; if (!docName) docName = getDocName(activeDocument); wLayout = activeDocument.activeLayer; }
			}
		} 
	}
	
	if ((hLayout && vLayout && sqLayout) || (hLayout && sqLayout)  || (sqLayout && wLayout)) {
		
		docName = docName.split('-').join('_');

		var newDoc = documents.add(1280,720,72,"tempDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
		app.activeDocument = doc; 
		
		var  closeHLayout = hLayout;
		var  closeVLayout = vLayout;
		var  closeSqLayout = sqLayout;
		var  closeWLayout = wLayout;
		
		if (hLayout && vLayout && sqLayout) { //Igniter
			var socialHOrientationLayout = importImage(hLayout,newDoc,'socialHOrientationLayout',304,25,494,278,true);
			var socialVOrientationLayout = importImage(vLayout,newDoc,'socialVOrientationLayout',820,25,156,278,true);
			var socialSqOrientationLayout = importImage(sqLayout,newDoc,'socialSqOrientationLayout',304,327,368,368,true);
			var socialOrientationText = importImage(assetPath+"socialOrientationText_IG.png",newDoc,'socialOrientationText',724,403,null,null,true);
			
			var socialPsdLayout = importImage(sqLayout,newDoc,'socialPsdLayout',290,30,454,454,false);
			var socialPsdText = importImage(assetPath+"socialPsdText.png",newDoc,'socialPsdText',329,554,null,null,false);
			var socialPsdLayers = importImage(assetPath+"socialPsdLayers.png",newDoc,'socialPsdLayers',647,185,null,null,false);
			var socialPsdLayoutSm = importImage(sqLayout,newDoc,'socialPsdLayoutSm',774,394,28,28,false);
			
			newDoc.trim(TrimType.TRANSPARENT);
			saveImage('_Images',docName+'_OR','png');
			
			newDoc.activeHistoryState = newDoc.historyStates[newDoc.historyStates.length - 2];
		
			hide(socialVOrientationLayout); hide(socialHOrientationLayout); hide(socialSqOrientationLayout); hide(socialOrientationText); 
			show(socialPsdLayout); show(socialPsdLayoutSm); show(socialPsdText); show(socialPsdLayers);

			newDoc.trim(TrimType.TRANSPARENT);
			//saveImage('_Images',docName+'_DEMO','png');
			
		} else if (hLayout && sqLayout) { //Sunday Social or VMC
			var socialHOrientationLayout = importImage(hLayout,newDoc,'socialHOrientationLayout',498,99,740,416,true);
			var socialSqOrientationLayout = importImage(sqLayout,newDoc,'socialSqOrientationLayout',42,99,416,416,true);
			var socialOrientationText = importImage(assetPath+"socialOrientationText_SS.png",newDoc,'socialOrientationText',138,578,null,null,true);
			
			var socialPsdLayout = importImage(sqLayout,newDoc,'socialSqOrientationLayout',290,30,454,454,false);
			var socialPsdText = importImage(assetPath+"socialPsdText.png",newDoc,'socialPsdText',329,554,null,null,false);
			var socialPsdLayers = importImage(assetPath+"socialPsdLayers.png",newDoc,'socialPsdLayers',647,185,null,null,false);
			var socialPsdLayoutSm = importImage(sqLayout,newDoc,'socialPsdLayoutSm',774,394,28,28,false);
			
			newDoc.trim(TrimType.TRANSPARENT);
			saveImage('_Images',docName+'_OR','png');
			
			newDoc.activeHistoryState = newDoc.historyStates[newDoc.historyStates.length - 2];
		
			hide(socialHOrientationLayout); hide(socialSqOrientationLayout); hide(socialOrientationText); 
			show(socialPsdLayout); show(socialPsdLayoutSm); show(socialPsdText); show(socialPsdLayers);

			newDoc.trim(TrimType.TRANSPARENT);
			//saveImage('_Images',docName+'_DEMO','png');
		
		} else if (sqLayout && wLayout) { //Ministry Pass
			var socialWOrientationLayout = importImage(wLayout,newDoc,'socialWOrientationLayout',261,23,758,281,true);
			var socialSqOrientationLayout = importImage(sqLayout,newDoc,'socialSqOrientationLayout',261,327,368,368,true);
			var socialOrientationText = importImage(assetPath+"socialOrientationText_MP.png",newDoc,'socialOrientationText',724,403,null,null,true);
			
			newDoc.trim(TrimType.TRANSPARENT);
			saveImage('_Images',docName+'_OR','png');
		}
	
		if (closeHLayout) try { getParentDocument(closeHLayout).close(SaveOptions.DONOTSAVECHANGES); } catch(e) {}
		if (closeVLayout) try { getParentDocument(closeVLayout).close(SaveOptions.DONOTSAVECHANGES); } catch(e) {} 
		if (closeSqLayout) try { getParentDocument(closeSqLayout).close(SaveOptions.DONOTSAVECHANGES); } catch(e) {} 
		if (closeWLayout) try { getParentDocument(closeWLayout).close(SaveOptions.DONOTSAVECHANGES); } catch(e) {}
		
		newDoc.close(SaveOptions.DONOTSAVECHANGES);  
	
	} //else alert('Error: Missing social layouts');
		
	preferences.rulerUnits = originalUnits; 
} // No active documents

function getDocType() { return activeDocument.name.slice(activeDocument.name.lastIndexOf('.')+1,activeDocument.name.length).toLowerCase(); }