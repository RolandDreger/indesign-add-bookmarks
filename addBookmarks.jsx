//@targetengine "addBookmarks"

/* DESCRIPTION: Add Bookmarks to Paragraph Style, Character Style or GREP */

/*
	
		+ Adobe InDesign Version: CS6+
		+ Autor: Roland Dreger 
		+ Datum: 22. September 2014
		
		+ Zuletzt aktualisiert: 17. Mai 2026
		
		
		+ Freies Script fuer private und kommerzielle Nutzung (Creativ Commons Lizenz: Roland Dreger, CC BY 3.0 AT). 
		+ Verwendung auf eigene Gefahr.
		
		+ Free Script for private and commercial use (Creativ Commons Licence: Roland Dreger, CC BY 3.0 AT). 
		+ Use at your own risk.
		
*/




var _global = {};
 
__main(); 
 



/**
 * Main
 * @returns 
 */
function __main() { 

	if (!_global) {
		return;
	}

	/* Define German-English dialog texts */
	__defLocalizeStrings();

	/* Define progressbar */
	_global["progressbar"] = __createProgressbar();

	/* Open bookmark panel */
	var _bookmarkPanelVisible = __openBookmarkPanel();
	if(!_bookmarkPanelVisible) {
		alert(localize(_global.openBookmarkPanelLabel));
		return false;
	}
	
	/* Show dialog to add bookmarks */
	__showDialog();

	return;
}


/**
 * Lesezeichen-Panel einblenden 
 * (Bug in CC2018 bei geschlossenem Panel)
 * @returns {boolean}
 */
function __openBookmarkPanel() {
	
	var _bookmarkPanel = app.panels.itemByName("$ID/Bookmarks");
	if(_bookmarkPanel.isValid && _bookmarkPanel.visible) {
		return true;
	}
	
	var _openBookmarkPanelSMA = app.scriptMenuActions.itemByID(95489);
	if(!_openBookmarkPanelSMA.isValid || !_openBookmarkPanelSMA.hasOwnProperty("invoke")) {
		return false;
	}
	
	try {
		_openBookmarkPanelSMA.invoke();
	} catch (_error) {
		alert(_error.message);
	}
	
	if(!_bookmarkPanel.isValid || !_bookmarkPanel.visible) {
		return false;
	}
	
	return true;
}


/**
 * Show dialog
 * @returns 
 */
function __showDialog() {

	if (!_global) {
		return;
	}

	var _ui = new Window("palette", localize(_global.addBookmarks));
	_ui.orientation = "row";
	_ui.alignChildren = ["fill", "fill"];
	_ui.spacing = 15;

	/* Main group */
	var _mainGroup = _ui.add("group");
	_mainGroup.orientation = "column";
	_mainGroup.spacing = 0;
	_mainGroup.alignChildren = ["fill", "fill"];

	var _tabPanel = _mainGroup.add("tabbedpanel");
	_tabPanel.alignChildren = ["fill", "fill"];
	_tabPanel.margins = [8, 8, 0, 8];


	/* Paragraph Styles */
	var _pStyleTab = _tabPanel.add("tab", undefined, "Paragaph Styles");
	_pStyleTab.alignChildren = "fill";
	_pStyleTab.spacing = 15;

	var _pStyleLevel1ListboxOptions = { "numberOfColumns": 3, "showHeaders": true, "columnTitles": [localize(_global.level1Label), "PDF", "ePub"], "multiselect": true };
	var _pStyleLevel1Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel1ListboxOptions);
	_pStyleLevel1Listbox.maximumSize.height = 141;
	_pStyleLevel1Listbox.minimumSize.width = 480;
	_pStyleLevel1Listbox.maximumSize.width = 1000;

	var _pStyleLevel2ListboxOptions = { "numberOfColumns": 3, "showHeaders": true, "columnTitles": [localize(_global.level2Label), "PDF", "ePub"], "multiselect": true };
	var _pStyleLevel2Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel2ListboxOptions);
	_pStyleLevel2Listbox.maximumSize.height = 141;
	_pStyleLevel1Listbox.minimumSize.width = 480;
	_pStyleLevel1Listbox.maximumSize.width = 1000;

	var _pStyleLevel3ListboxOptions = { "numberOfColumns": 3, "showHeaders": true, "columnTitles": [localize(_global.level3Label), "PDF", "ePub"], "multiselect": true };
	var _pStyleLevel3Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel3ListboxOptions);
	_pStyleLevel3Listbox.maximumSize.height = 141;
	_pStyleLevel1Listbox.minimumSize.width = 480;
	_pStyleLevel1Listbox.maximumSize.width = 1000;

	/* Character Styles */
	var _cStyleTab = _tabPanel.add("tab", undefined, "Character Styles");
	_cStyleTab.alignChildren = "fill";

	var _cStyleDropDown = _cStyleTab.add("dropdownlist", undefined, []);

	/* GREP */
	var _grepTab = _tabPanel.add("tab", undefined, "GREP");
	_grepTab.alignChildren = "fill";

	var _grepInputField = _grepTab.add("edittext", undefined, "", { multiline: false });

	/* Parent Bookmark */
	var _parentBookmarkGroup = _mainGroup.add("group");
	_parentBookmarkGroup.margins = [15, 20, 15, 0];
	_parentBookmarkGroup.alignChildren = ["left", "bottom"];
	_parentBookmarkGroup.spacing = 20;

	var _parentBookmarkCheck = _parentBookmarkGroup.add("checkbox", undefined, localize(_global.parentBookmarkCheckboxLabel));
	_parentBookmarkCheck.value = false;

	var _parentBookmarkDropdown = _parentBookmarkGroup.add("dropdownlist", undefined, undefined);
	_parentBookmarkDropdown.preferredSize.width = 140;
	_parentBookmarkDropdown.visible = false;

	/* Button group */
	var _actionButtonGroup = _ui.add("group");
	_actionButtonGroup.orientation = "column";
	_actionButtonGroup.alignChildren = "fill";

	var _startButton = _actionButtonGroup.add("button", undefined, localize(_global.startButtonLabel), { name: "ok" });
	_startButton.minimumSize.height = 30;
	_startButton.minimumSize.width = 100;
	_startButton.alignment = ["right", "top"];

	var _refreshButton = _actionButtonGroup.add("button", undefined, localize(_global.refreshButtonLabel));
	_refreshButton.minimumSize.height = 30;
	_refreshButton.minimumSize.width = 100;
	_refreshButton.alignment = ["right", "top"];

	var _cancelButton = _actionButtonGroup.add("button", undefined, localize(_global.cancelButtonLabel), { name: "cancel" });
	_cancelButton.minimumSize.height = 30;
	_cancelButton.minimumSize.width = 100;
	_cancelButton.alignment = ["right", "top"];


	/**
	 *  Callbacks
	 */
	/* Paragraph styles */
	_pStyleLevel1Listbox.onChange = function () {
		if (_pStyleLevel1Listbox.selection) {
			_pStyleLevel2Listbox.visible = true;
			__deselectStylesListboxItems(_pStyleLevel2Listbox, this.selection);
			var _combinedSelectionArray = [].concat(_pStyleLevel1Listbox.selection, _pStyleLevel2Listbox.selection);
			__deselectStylesListboxItems(_pStyleLevel3Listbox, _combinedSelectionArray);
		} else {
			_pStyleLevel2Listbox.visible = false;
			_pStyleLevel2Listbox.selection = null;
			_pStyleLevel3Listbox.visible = false;
			_pStyleLevel3Listbox.selection = null;
		}
	};

	_pStyleLevel2Listbox.onChange = function () {
		if (_pStyleLevel2Listbox.selection) {
			_pStyleLevel3Listbox.visible = true;
			var _combinedSelectionArray = [].concat(_pStyleLevel1Listbox.selection, _pStyleLevel2Listbox.selection);
			__deselectStylesListboxItems(_pStyleLevel3Listbox, _combinedSelectionArray);
		} else {
			_pStyleLevel3Listbox.visible = false;
			_pStyleLevel3Listbox.selection = null;
		}
	};


	/* Parent bookmark */
	_parentBookmarkCheck.onClick = function () {
		if (this.value == true) {
			_parentBookmarkDropdown.show();
			__fillParentBookmarkDropdown(_parentBookmarkDropdown);
		} else {
			_parentBookmarkDropdown.hide();
		}
	};
	_parentBookmarkDropdown.onActivate = function () {
		__fillParentBookmarkDropdown(_parentBookmarkDropdown);
	};

	/* Start */
	_startButton.onClick = function () {

		if (app.documents.length === 0 || app.layoutWindows.length === 0) {
			return;
		}

		/* Parent bookmark */
		var _parentBookmark;
		if (_parentBookmarkCheck.value == true) {
			var _selectedParentBookmark = _parentBookmarkDropdown.selection;
			if (!!_selectedParentBookmark) {
				_parentBookmark = _selectedParentBookmark.bookmark;
			}
		}

		var _addedBookmarks = 0;
		var _argsArray = [];

		/* Paragraph Style */
		if (_pStyleLevel1Listbox.visible == true) {
			if (!!_pStyleLevel1Listbox.selection) {
		// _argsArray = [[_pStyleLevel1Listbox.selection], _parentBookmark];
		// _addedBookmarks = app.doScript(__makeBookmarksByParagraphStyles, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
			}
		}

		/* Character Style */
		else if (_cStyleDropDown.visible == true) {
			if (!!_cStyleDropDown.selection) {
				_argsArray = [[_cStyleDropDown.selection.style], _parentBookmark];
				_addedBookmarks = app.doScript(__makeBookmarksByCharacterStyles, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
			}
		}

		/* GREP */
		else if (_grepInputField.visible == true) {
			if (!!_grepInputField.text) {
				_argsArray = [_grepInputField.text, _parentBookmark];
				_addedBookmarks = app.doScript(__makeBookmarksByGREP, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
			}
		}

		_ui.text = __buildResultString(_addedBookmarks);
	};


	/* Refresh dialog */
	_refreshButton.onClick = function () {
		__fillStylesListbox(_pStyleLevel1Listbox, "paragraph styles");
		__fillStylesListbox(_pStyleLevel2Listbox, "paragraph styles");
		__fillStylesListbox(_pStyleLevel3Listbox, "paragraph styles");
		__fillStylesDropDown(_cStyleDropDown, "character styles");
		_pStyleLevel2Listbox.visible = false;
		_pStyleLevel3Listbox.visible = false;
		_grepInputField.text = "";
	};


	/* Close dialog */
	_cancelButton.onClick = function () {
		_ui.close();
	};

	_ui.onClose = function () {
		if (!!_global && _global.hasOwnProperty("progressbar")) {
			_global["progressbar"].close();
		}
		_global = null;
	};


	/**
	 * Init dialog
	 */
	__fillStylesListbox(_pStyleLevel1Listbox, "paragraph styles");
	__fillStylesListbox(_pStyleLevel2Listbox, "paragraph styles");
	__fillStylesListbox(_pStyleLevel3Listbox, "paragraph styles");
	__fillStylesDropDown(_cStyleDropDown, "character styles");

	_pStyleLevel2Listbox.visible = false;
	_pStyleLevel3Listbox.visible = false;


	/**
	 * Show dialog
	 */
	_ui.show();

	return;
}


/**
 * Fill style listbox
 * @param {ListBox} _listbox 
 * @param {Array} _styleArray 
 * @param {string} _styleType 
 * @returns 
 */
function __fillStylesListbox(_listbox, _styleType) {

	if (!_listbox || !(_listbox instanceof ListBox)) {
		return null;
	}
	if (!_styleType || typeof _styleType !== "string") {
		return;
	}

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return;
	}

	var _doc = app.activeDocument;
	if (!document.isValid) {
		return;
	}

	var _styleObjArray = __getAllStyles(_doc, _styleType);

	_listbox.removeAll();

	for (var s = 0; s < _styleObjArray.length; s += 1) {

		var _styleObj = _styleObjArray[s];
		if (!_styleObj) {
			continue;
		}
		var _stylePathArray = _styleObj.path;
		var _style = _styleObj.style;
		if (!_stylePathArray || !_style || !_style.isValid) {
			continue;
		}

		var _stylePath = _stylePathArray.join(" → ");

		var _listItem = _listbox.add("item", _stylePath);
		if (!_listItem) {
			continue;
		}

		var _pdfExportTag = _styleObj.pdfExportTag || "";
		var _epubExportTag = _styleObj.epubExportTag || "";

		_listItem.subItems[0].text = _pdfExportTag;
		_listItem.subItems[1].text = _epubExportTag;

		_listItem.style = _style;
	}
}


/**
 * Deselect styles listbox items
 * @param {ListBox} _listbox 
 * @param {Array} _selectionArray 
 * @returns 
 */
function __deselectStylesListboxItems(_listbox, _selectionArray) {

	if (!_listbox || !(_listbox instanceof ListBox)) {
		return null;
	}
	if (!_selectionArray || !(_selectionArray instanceof Array)) {
		return;
	}

	var _listboxItemArray = _listbox.items;

	for (var i = 0; i < _listboxItemArray.length; i += 1) {

		var _listboxItem = _listboxItemArray[i];
		if (!_listboxItem) {
			continue;
		}

		var _isSelected = false;

		for (var s = 0; s < _selectionArray.length; s += 1) {
			var _selectedItem = _selectionArray[s];
			if (!_selectedItem) {
				continue;
			}
			if (_listboxItem.style === _selectedItem.style) {
				_isSelected = true;
				break;
			}
		}

		if (_isSelected) {
			_listboxItem.selected = false;
			_listboxItem.enabled = false;
		} else {
			_listboxItem.enabled = true;
		}
	}
}


/**
 * 
 * @param {DropDownList} _dropDown 
 * @param {string} _styleType 
 * @returns 
 */
function __fillStylesDropDown(_dropDown, _styleType) {

	if (!_dropDown || !(_dropDown instanceof DropDownList)) {
		return;
	}
	if (!_styleType || typeof _styleType !== "string") {
		return;
	}

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return;
	}

	var _doc = app.activeDocument;
	if (!document.isValid) {
		return;
	}

	var _selectionText = "";
	if (!!_dropDown.selection) {
		_selectionText = _dropDown.selection.text;
	}

	var _styleObjArray = __getAllStyles(_doc, _styleType);

	_dropDown.removeAll();

	for (var i = 0; i < _styleObjArray.length; i++) {
		var _styleObj = _styleObjArray[i];
		if (!_styleObj) {
			continue;
		}
		var _stylePathArray = _styleObj.path;
		var _style = _styleObj.style;
		if (!_stylePathArray || !_style || !_style.isValid) {
			continue;
		}
		var _stylePath = _stylePathArray.join(" → ");
		var item = _dropDown.add("item", _stylePath);
		if (!!item) {
			item.style = _style;
		}
	}

	if (!!_selectionText) {
		var _targetItem = _dropDown.find(_selectionText);
		if (!!_targetItem) {
			_dropDown.selection = _targetItem;
		}
	}

	return;
}


/**
 * Get all styles
 * @param { Document } _doc 
 * @param { "paragraph style" | "character styles" | "object styles" | "table styles" | "cell styles" } _styleType 
 * @returns { Array<{"path": Array<string>, "style": ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle, "pdfExportTag": string, "epubExportTag": string }> }
 */
function __getAllStyles(_doc, _styleType) {

	if (!_doc || !_doc.isValid || !(_doc instanceof Document)) {
		return false;
	}
	if (!_styleType || _styleType.constructor.name !== "String") {
		return false;
	}

	var _allStylesPropertyName;
	var _styleGroupInstance;
	var _startIndex;

	switch (_styleType) {
		case "paragraph styles":
			_allStylesPropertyName = "allParagraphStyles";
			_styleGroupInstance = "ParagraphStyleGroup";
			_startIndex = 2;
			break;
		case "character styles":
			_allStylesPropertyName = "allCharacterStyles";
			_styleGroupInstance = "CharacterStyleGroup";
			_startIndex = 1;
			break;
		case "object styles":
			_allStylesPropertyName = "allObjectStyles";
			_styleGroupInstance = "ObjectStyleGroup";
			_startIndex = 4;
			break;
		case "table styles":
			_allStylesPropertyName = "allTableStyles";
			_styleGroupInstance = "TableStyleGroup";
			_startIndex = 2;
			break;
		case "cell styles":
			_allStylesPropertyName = "allCellStyles";
			_styleGroupInstance = "CellStyleGroup";
			_startIndex = 1;
			break;
		default:
			return [];
	}

	var _styleObjArray = [];
	var _allStylesArray = _doc[_allStylesPropertyName];

	for (var i = _startIndex; i < _allStylesArray.length; i += 1) {

		var _style = _allStylesArray[i];
		if (!_style || !_style.isValid) {
			continue;
		}

		var _pdfExportTag = "";
		var _epubExportTag = "";
		var _styleExportTagMapArray = _style.styleExportTagMaps;

		for (var e = 0; e < _styleExportTagMapArray.length; e += 1) {
			var _styleExportTagMap = _styleExportTagMapArray[e];
			if (!_styleExportTagMap) {
				continue;
			}
			var _exportType = _styleExportTagMap.exportType;
			var _exportTag = _styleExportTagMap.exportTag || "";
			if (_exportType === "PDF") {
				_pdfExportTag = _exportTag;
			}
			else if (_exportType === "EPUB") {
				_epubExportTag = _exportTag;
			}
		}

		var _stylePathArray = __getStyleName(_style, [_style.name], _styleGroupInstance);
		_styleObjArray.push({
			"path": _stylePathArray,
			"style": _style,
			"pdfExportTag": _pdfExportTag,
			"epubExportTag": _epubExportTag
		});
	}

	return _styleObjArray;
}


/**
 * Get style name
 * @param {ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle} _style 
 * @param {Array} _stylePathArray 
 * @param {string} _styleGroupInstance 
 * @returns 
 */
function __getStyleName(_style, _stylePathArray, _styleGroupInstance) {

	if (!_stylePathArray || !(_stylePathArray instanceof Array)) {
		_stylePathArray = [];
	}
	if (!_style || !(_style instanceof Object) || !_style.hasOwnProperty("parent") || !_style.isValid) {
		return _stylePathArray;
	}

	var MAX_NAME_LENGTH = 101;

	var _styleGroup = _style.parent;
	if (_styleGroup.constructor.name !== _styleGroupInstance) {
		return _stylePathArray;
	}

	var _styleGroupName = _styleGroup.name;
	if (!_styleGroupName) {
		return _stylePathArray;
	}

	_styleGroupName = _styleGroupName.substring(0, MAX_NAME_LENGTH);
	_stylePathArray.unshift(_styleGroupName);
	_stylePathArray = __getStyleName(_style.parent, _stylePathArray, _styleGroupInstance);

	return _stylePathArray;
}


/**
 * Fill parent bookmark dropdown
 * @param {*} _dropDown 
 * @returns 
 */
function __fillParentBookmarkDropdown(_dropDown) {

	if (!_dropDown || !(_dropDown instanceof DropDownList)) {
		return;
	}

	var _selectionIndex;
	var _selection = _dropDown.selection;
	if (!_selection) {
		_selectionIndex = 0;
	} else {
		_selectionIndex = _selection.index;
	}

	_dropDown.removeAll();

	var _allBookmarkArray = __getAllBookmarks();
	for (var i = 0; i < _allBookmarkArray.length; i++) {
		var _bookmark = _allBookmarkArray[i];
		if (!_bookmark || !_bookmark.isValid) {
			continue;
		}
		var _dropDownItem = _dropDown.add("item", _bookmark.extractLabel("fullName"));
		if (!!_dropDownItem) {
			_dropDownItem.bookmark = _bookmark;
		}
	}

	_dropDown.selection = _selectionIndex;

	return;
}


/**
 * 
 * @param {*} _addedBookmarks 
 * @returns 
 */
function __buildResultString(_addedBookmarkArray) {

	if (!_global) {
		return "";
	}
	if (!_addedBookmarkArray || !(_addedBookmarkArray instanceof Array) || _addedBookmarkArray.length < 2) {
		_addedBookmarkArray = [0, 0];
	}

	var _resultString = _addedBookmarkArray[0] + " " + localize(_global.bookmarksAddedAlert) + "\u2003|\u2003" + _addedBookmarkArray[1] + " " + localize(_global.errorsAlert);

	return _resultString;
}


/**
 * Make bookmarks by paragraph styles
 * @param {Array} _doScriptArgumentArray 
 * @returns {Array} 
 */
function __makeBookmarksByParagraphStyles(_doScriptArgumentArray) {

	if (!_global || !_doScriptArgumentArray || !(_doScriptArgumentArray instanceof Array)) {
		return [0, 0];
	}

	var _pStyleArray = _doScriptArgumentArray[0];
	if (!_pStyleArray || !(_pStyleArray instanceof Array)) {
		return [0, 0];
	}

	var _parentBookmark = _doScriptArgumentArray[1];

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return [0, 0];
	}

	var _doc = app.properties.activeDocument;
	if (!_doc || !_doc.isValid) {
		return [0, 0];
	}

	var _bookmarkCounter = 0;
	var _errorCounter = 0;

	/* Loop: Paragraph Styles */
	outer: for (var s = 0; s < _pStyleArray.length; s += 1) {

		var _targetPStyle = _pStyleArray[s];
		if (!_targetPStyle || !_targetPStyle.isValid) {
			continue;
		}

		var _pStyleMatchArray = __findGREP(_doc, { "appliedParagraphStyle": _targetPStyle }, "forward");
		if (_pStyleMatchArray.length === 0) {
			continue;
		}

		_global["progressbar"].init(0, _pStyleMatchArray.length, localize(_global.addBookmarksLabel), "");

		/* Loop: Matches for paragraph style */
		for (var m = _pStyleMatchArray.length - 1; m >= 0; m -= 1) {

			var _keyState = ScriptUI.environment.keyboardState;
			if (_keyState.keyName == "Escape") {
				_global["progressbar"].close();
				break outer;
			}

			var _pStyleMatch = _pStyleMatchArray[m];
			if (!_pStyleMatch || !_pStyleMatch.hasOwnProperty("paragraphs") || !_pStyleMatch.isValid) {
				continue;
			}

			_global["progressbar"].setLabel(String(_pStyleMatch.contents));
			_global["progressbar"].step();

			var _paragraphArray = _pStyleMatch.paragraphs.everyItem().getElements();

			/* Loop: Paragraphs for matching text */
			for (var p = _paragraphArray.length - 1; p >= 0; p -= 1) {

				var _targetParagraph = _paragraphArray[p];
				if (!_targetParagraph || !_targetParagraph.isValid) {
					continue;
				}

				var _wasBookmarkAdded = __addBookmark(_doc, _targetParagraph, _parentBookmark);
				if (_wasBookmarkAdded) {
					_bookmarkCounter += 1;
				} else {
					_errorCounter += 1;
				}
			}
		}
	}

	_global["progressbar"].close();

	return [
		_bookmarkCounter,
		_errorCounter
	];
}


/**
 * Make bookmarks by paragraph styles
 * @param {Array} _doScriptArgumentArray 
 * @returns {Array} 
 */
function __makeBookmarksByCharacterStyles(_doScriptArgumentArray) {

	if (!_global || !_doScriptArgumentArray || !(_doScriptArgumentArray instanceof Array)) {
		return [0, 0];
	}

	var _cStyleArray = _doScriptArgumentArray[0];
	if (!_cStyleArray || !(_cStyleArray instanceof Array)) {
		return [0, 0];
	}

	var _parentBookmark = _doScriptArgumentArray[1];

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return [0, 0];
	}

	var _doc = app.properties.activeDocument;
	if (!_doc || !_doc.isValid) {
		return [0, 0];
	}

	var _bookmarkCounter = 0;
	var _errorCounter = 0;

	/* Loop: Character Styles */
	outer: for (var s = 0; s < _cStyleArray.length; s += 1) {

		var _targetCStyle = _cStyleArray[s];
		if (!_targetCStyle || !_targetCStyle.isValid) {
			continue;
		}

		var _cStyleMatchArray = __findGREP(_doc, { "appliedCharacterStyle": _targetCStyle }, "forward");
		if (_cStyleMatchArray.length === 0) {
			continue;
		}

		_global["progressbar"].init(0, _cStyleMatchArray.length, localize(_global.addBookmarksLabel), "");

		/* Loop: Matches for character style */
		for (var m = _cStyleMatchArray.length - 1; m >= 0; m -= 1) {

			var _keyState = ScriptUI.environment.keyboardState;
			if (_keyState.keyName == "Escape") {
				_global["progressbar"].close();
				break outer;
			}

			var _cStyleMatch = _cStyleMatchArray[m];
			if (!_cStyleMatch || !_cStyleMatch.hasOwnProperty("contents") || !_cStyleMatch.isValid) {
				continue;
			}

			_global["progressbar"].setLabel(String(_cStyleMatch.contents));
			_global["progressbar"].step();

			var _wasBookmarkAdded = __addBookmark(_doc, _cStyleMatch, _parentBookmark);
			if (_wasBookmarkAdded) {
				_bookmarkCounter += 1;
			} else {
				_errorCounter += 1;
			}
		}
	}

	_global["progressbar"].close();

	return [
		_bookmarkCounter,
		_errorCounter
	];
}


/**
 * Make bookmarks by GREP search
 * @param {Array} _doScriptArgumentArray 
 * @returns {Array} 
 */
function __makeBookmarksByGREP(_doScriptArgumentArray) {

	if (!_global || !_doScriptArgumentArray || !(_doScriptArgumentArray instanceof Array)) {
		return [0, 0];
	}

	var _grep = _doScriptArgumentArray[0];
	if (!_grep || typeof _grep !== "string") {
		return [0, 0];
	}

	var _parentBookmark = _doScriptArgumentArray[1];

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return [0, 0];
	}

	var _doc = app.properties.activeDocument;
	if (!_doc || !_doc.isValid) {
		return [0, 0];
	}

	var _bookmarkCounter = 0;
	var _errorCounter = 0;

	var _grepMatchArray = __findGREP(_doc, { "findWhat": _grep }, "forward");
	if (_grepMatchArray.length === 0) {
		return [0, 0];
	}

	_global["progressbar"].init(0, _grepMatchArray.length, localize(_global.addBookmarksLabel), "");

	/* Loop: Matches for GREP */
	for (var m = _grepMatchArray.length - 1; m >= 0; m -= 1) {

		var _keyState = ScriptUI.environment.keyboardState;
		if (_keyState.keyName == "Escape") {
			_global["progressbar"].close();
			break;
		}

		var _grepMatch = _grepMatchArray[m];
		if (!_grepMatch || !_grepMatch.hasOwnProperty("contents") || !_grepMatch.isValid) {
			continue;
		}

		_global["progressbar"].setLabel(String(_grepMatch.contents));
		_global["progressbar"].step();

		var _wasBookmarkAdded = __addBookmark(_doc, _grepMatch, _parentBookmark);
		if (_wasBookmarkAdded) {
			_bookmarkCounter += 1;
		} else {
			_errorCounter += 1;
		}
	}

	_global["progressbar"].close();

	return [
		_bookmarkCounter,
		_errorCounter
	];
}


/**
 * Add bookmarks
 * @param {Document} _doc 
 * @param {Text} _destText 
 * @param {Bookmark | undefined } _parentBookmark 
 * @returns 
 */
function __addBookmark(_doc, _destText, _parentBookmark) {

	if (!_global) {
		return false;
	}
	if (!_doc || !_doc.isValid) {
		return false;
	}
	if (!_destText || !_destText.hasOwnProperty("contents") || !_destText.isValid) {
		return false;
	}

	var _bookmarkName;
	var _destTextContents = String(_destText.contents);

	/* ToDo: mehr Zeichen entfernen??? */
	_bookmarkName = _destTextContents.replace("\\s+", " ", "g")
		.replace("[\x00-\x1F\uFEFF\uFFFC\u00AD\u200C\u200B]", "", "g")
		.replace("\\s+$", "", "");

	if (!_bookmarkName) {
		_bookmarkName = localize(_global.anchorLabel);
	}

	try {
		var _destTextAnchor = _doc.hyperlinkTextDestinations.add(_destText);
		var _bookmark = _doc.bookmarks.add(_destTextAnchor);
		_bookmark.move(LocationOptions.AT_BEGINNING, _parentBookmark);
		_bookmark.name = _bookmarkName;
	} catch (e) {
		return false;
	}

	return true;
}


/**
 * Get all bookmarks
 * @param {Document | Bookmark | undefined } _parent 
 * @param {Array} _allBookmarkArray 
 * @returns {Array}
 */
function __getAllBookmarks(_parent, _allBookmarkArray) {

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return [];
	}
	if (!_parent || !_parent.hasOwnProperty("bookmarks") || !_parent.isValid) {
		_parent = app.activeDocument;
	}
	if (!_allBookmarkArray || !(_allBookmarkArray instanceof Array)) {
		_allBookmarkArray = [];
	}

	var _bookmarkArray = _parent.bookmarks.everyItem().getElements();

	for (var i = 0; i < _bookmarkArray.length; i++) {

		var _bookmark = _bookmarkArray[i];
		if (!_bookmark || !_bookmark.isValid) {
			continue;
		}

		var _fullName = __createBookmarkFullName(_bookmark);
		if (!_fullName) {
			continue;
		}

		_bookmark.insertLabel("fullName", _fullName);
		_allBookmarkArray.push(_bookmark);

		if (_bookmark.bookmarks.length > 0) {
			_allBookmarkArray = __getAllBookmarks(_bookmark, _allBookmarkArray);
		}
	}

	return _allBookmarkArray;
}


/**
 * Create full name of bookmark
 * The full name includes the indentation for the dropdown menu.
 * @param {Bookmark} _bookmark 
 * @returns 
 */
function __createBookmarkFullName(_bookmark) {

	if (!_bookmark || !(_bookmark instanceof Bookmark) || !_bookmark.isValid) {
		return "";
	}

	var _maxLength = 50;
	var _name = _bookmark.name;
	if (!_name) {
		return "";
	}

	if (_name.length > _maxLength) {
		_name = _name.substring(0, _maxLength) + "...";
	}

	if (_bookmark.bookmarks.length > 0) {
		_name = "\u25BE " + _name;
	}

	for (var j = 1; j <= _bookmark.indent; j++) {
		_name = "\u2003\u2003" + _name;
	}

	return _name;
}


/**
 * Ersetzen mit GREP
 * @param {Any} _place 
 * @param {Object} _findPropObj 
 * @param {Object} _changePropObj 
 * @param {String} _mode 
 * @returns {Array}
 */
function __changeGREP(_place, _findPropObj, _changePropObj, _mode) {

	if (!_place || !(_place.hasOwnProperty("findGrep"))) {
		return [];
	}
	if (!_findPropObj || !(_findPropObj instanceof Object)) {
		return [];
	}
	if (!_changePropObj || !(_changePropObj instanceof Object)) {
		return [];
	}
	if (!_mode || _mode.constructor !== String) {
		return [];
	}

	if (_place.hasOwnProperty("contents") && _place.contents === "") {
		return [];
	}

	var _reverseOrder;

	switch (_mode.toLowerCase()) {
		case "forward":
			/*Fundstellen vorwaerts durchsuchen */
			_reverseOrder = false;
			break;
		case "backward":
			/*Fundstellen ruechwaerts durchsuchen */
			_reverseOrder = true;
			break;
		default:
			return [];
	}

	var _userProps = app.findChangeGrepOptions.properties;

	app.findChangeGrepOptions.properties = {
		includeFootnotes: true,
		includeHiddenLayers: true,
		includeLockedLayersForFind: false,
		includeLockedStoriesForFind: false,
		includeMasterPages: false,
		searchBackwards: false
	};

	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;

	var _resultArray = [];

	try {

		app.findGrepPreferences.properties = _findPropObj;
		app.changeGrepPreferences.properties = _changePropObj;

		_resultArray = _place.changeGrep(_reverseOrder);

	} catch (_error) {
		alert(_error.message);
	} finally {
		app.findGrepPreferences = NothingEnum.nothing;
		app.changeGrepPreferences = NothingEnum.nothing;
		app.findChangeGrepOptions.properties = _userProps;
	}

	return _resultArray;
}


/**
 * Suchen mit GREP
 * @param {Any} _place 
 * @param {Object} _findPropObj 
 * @param {String} _mode 
 * @returns {Array}
 */
function __findGREP(_place, _findPropObj, _mode) {

	if (!_place || !(_place.hasOwnProperty("findGrep"))) {
		return [];
	}
	if (!_findPropObj || !(_findPropObj instanceof Object)) {
		return [];
	}
	if (!_mode || _mode.constructor !== String) {
		return [];
	}

	if (_place.hasOwnProperty("contents") && _place.contents === "") {
		return [];
	}

	var _reverseOrder;

	switch (_mode.toLowerCase()) {
		case "forward":
			/*Fundstellen vorwaerts durchsuchen */
			_reverseOrder = false;
			break;
		case "backward":
			/*Fundstellen ruechwaerts durchsuchen */
			_reverseOrder = true;
			break;
		default:
			return [];
	}

	var _userProps = app.findChangeGrepOptions.properties;

	app.findChangeGrepOptions.properties = {
		includeFootnotes: true,
		includeHiddenLayers: false,
		includeLockedLayersForFind: false,
		includeLockedStoriesForFind: false,
		includeMasterPages: false,
		searchBackwards: false
	};

	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;

	var _resultArray = [];

	try {

		app.findGrepPreferences.properties = _findPropObj;

		_resultArray = _place.findGrep(_reverseOrder);

	} catch (_error) {
		alert(_error.message);
	} finally {
		app.findGrepPreferences = NothingEnum.nothing;
		app.changeGrepPreferences = NothingEnum.nothing;
		app.findChangeGrepOptions.properties = _userProps;
	}

	return _resultArray;
}


/**
 * Progressbar
 * @returns SUIWindow
 */
function __createProgressbar() {

	var _progressWindow = new Window("palette", undefined, undefined, { borderless: true });
	_progressWindow.spacing = 10;
	_progressWindow.margins = [20, 10, 20, 20];
	_progressWindow.alignChildren = ["fill", "center"];

	var _labelText = _progressWindow.add("statictext");
	_labelText.characters = 30; /* Breitenvorgabe des Fensters */
	_labelText.justify = "center";

	var _progressbar = _progressWindow.add("progressbar", undefined, 0, 0);
	_progressbar.minimumSize.width = 340;
	_progressbar.maximumSize.height = 6;

	_progressWindow.init = function (_start, _stop, _title, _label) {
		_progressWindow.text = (_title && _title.toString()) || _progressWindow.text;
		_labelText.text = (_label && _label.toString()) || _labelText.text;
		_progressbar.value = (_start && !isNaN(_start) && Number(_start)) || 0;
		_progressbar.maxvalue = (_stop && !isNaN(_stop) && Number(_stop)) || 0;
		this.show();
	}; /* END function init */

	_progressWindow.setLabel = function (_label) {
		_labelText.text = (_label && _label.toString()) || "";
		this.update();
	}; /* END function setLabel */

	_progressWindow.step = function (_step, _label) {
		_labelText.text = (_label && _label.toString()) || _labelText.text;
		_progressbar.value = (_step && !isNaN(_step) && Number(_step)) || _progressbar.value + 1;
		this.update();
	}; /* END function push */

	return _progressWindow;
}










/* Deutsch-Englische Dialogtexte und Fehlermeldungen */
function __defLocalizeStrings() {

	_global.addBookmarks = {
		en: "Add Bookmarks 1.1",
		de: "Add Bookmarks 1.1"
	}

	_global.goBackLabel = {
		en: "Add Bookmarks",
		de: "Lesezeichen erstellen"
	}

	_global.pStyleButtonLabel = {
		en: "Paragraph Style",
		de: "Absatzformat"
	}

	_global.cStyleButtonLabel = {
		en: "Character Style",
		de: "Zeichenformat"
	}

	_global.openBookmarkPanelLabel = {
		en: "Please open the bookmark panel: Windows → Interactive → Bookmarks",
		de: "Bitte die Lesezeichen-Palette öffnen: Fenster → Interaktiv → Lesezeichen"
	}

	_global.placeholder = {
		en: "Please select one these options.",
		de: "Bitte eine der Optionen auswählen."
	}

	_global.grepButtonLabel = {
		en: "GREP",
		de: "GREP"
	}

	_global.startButtonLabel = {
		en: "Go",
		de: "Los"
	}

	_global.cancelButtonLabel = {
		en: "Close",
		de: "Schlie\u00dfen"
	}

	_global.refreshButtonLabel = {
		en: "Refresh",
		de: "Refresh"
	}

	_global.clearButtonLabel = {
		en: "Clear",
		de: "Leeren"
	}

	_global.anchorLabel = {
		en: "Bookmark",
		de: "Lesezeichen"
	}

	_global.level1Label = {
		en: "Level 1",
		de: "Ebene 1"
	}

	_global.level2Label = {
		en: "Level 2",
		de: "Ebene 2"
	}

	_global.level3Label = {
		en: "Level 3",
		de: "Ebene 3"
	}

	_global.bookmarksAddedAlert = {
		en: "Bookmarks added",
		de: "Lesezeichen erstellt"
	}

	_global.refreshBookmarkListDoScriptLabel = {
		en: "Refresh bookmarks list",
		de: "Lesezeichen-Liste aktualisieren"
	}

	_global.errorsAlert = {
		en: "Search results skipped",
		de: "Fundstellen \u00fcbersprungen"
	}

	_global.conditionAlert = {
		en: "Important Note!\rYou are using “conditional text” in your document.\r\rWith a GREP search, the “text conditions” you applied are removed from the matches.\r\rContinue Anyway?",
		de: "Wichtiger Hinweis!\rDu verwendest in deinem Dokument »bedingten Text«.\r\rBei der GREP-Suche werden die von dir zugewiesenen »Bedingungen« an den Fundstellen entfernt.\r\rTrotzdem fortfahren?"
	}

	_global.parentBookmarkCheckboxLabel = {
		en: "Parent Bookmark",
		de: "\u00dcbergeordnetes Lesezeichen"
	}

	_global.cancelWithESCLabel = {
		en: "Cancel with ESC",
		de: "Abbrechen mit ESC"
	}

	_global.addBookmarksLabel = {
		en: "Add bookmarks",
		de: "Lesezeichen hinzufügen"
	}

} /* END function __defLocalizeStrings */