//@targetengine "addBookmarks"

/* DESCRIPTION: Add Bookmarks by Paragraph Style, Character Style or GREP */

/*
	
		+ Adobe InDesign Version: 2025+
		+ Autor: Roland Dreger 
		+ Datum: 22. September 2014
		
		+ Zuletzt aktualisiert: 7. Juni 2026
		
		+ Note
		
		Special characters in the text (e.g. note references) split the GREP search results. A single match 
		can result in multiple hits. Solution: First highlight matches with conditional text, and then search 
		for that conditional text? Or merge consecutive sections of text?
		
		+ Freies Script fuer private und kommerzielle Nutzung (Creativ Commons Lizenz: Roland Dreger, CC BY 3.0 AT). 
		+ Verwendung auf eigene Gefahr.
		
		+ Free Script for private and commercial use (Creativ Commons Licence: Roland Dreger, CC BY 3.0 AT). 
		+ Use at your own risk.
		
*/


var _global = {};


/**
 * Intl Collator class
 * @param {string} _langCode e.g. de_DE
 * @param {*} _optionsObj 
 * 	Options:
 * 	caseSensitive: boolean; 
 * 	sortMode: "word" | "letter"; 
 * 	sortOrder: ascending | descending;
 * 	ignoredCharacters: string;
 * 	rankedPunctuations: boolean;
 * 	rankedBrackets: boolean;
 * 
 */
function IntlCollator(_langCode, _optionsObj) {

	if (!_optionsObj || typeof _optionsObj !== "object") {
		_optionsObj = {};
	}

	this.langCode = _langCode;

	/* Sort mode */
	this.sortMode = _optionsObj.sortMode || "";

	/* Sort order */
	this.sortOrder = _optionsObj.sortOrder || "";
	this.isCaseSensitive = (_optionsObj.caseSensitive === true) ? true : false;

	/* Ignored characters */
	var _ignoreChars = (!_optionsObj.ignoredCharacters) ? "»«›‹\"\'„”“‚‘’" : _optionsObj.ignoredCharacters; /* +±≠~≤≥÷×ø%§¢¶#*&…|·•¬ı†‡◊°º©™® */
	this.ignoreCharsRegExp = new RegExp("[" + this.__escapeRegExpCharClass(_ignoreChars) + "]", "ig");

	/* Punctuations */
	var _arePunctuationsRanked = (_optionsObj.rankedPunctuations === true) ? true : false;
	this.punctuationReplacementChar = ",";
	this.punctuationChars = (_arePunctuationsRanked) ? ",;.:!?¿¡" : this.punctuationReplacementChar;
	this.punctuationRegExp = (_arePunctuationsRanked) ? new RegExp("[]", "ig") : new RegExp("[,;.:!?¿¡]", "ig");

	/* Brackets */
	var _areBracketsRanked = (_optionsObj.rankedBrackets === true) ? true : false;
	this.bracketsReplacementChar = "(";
	this.bracketChars = (_areBracketsRanked) ? "([{<>}])" : this.bracketsReplacementChar;
	this.bracketRegExp = (_areBracketsRanked) ? new RegExp("[]", "ig") : new RegExp("[\\[{<())}>\\]]", "ig");

	/* Word Separator */
	this.wordSeparator = "∞";
	this.wordSeparatorsRegExp = new RegExp("[\\s\\-–/&]", "ig");

	this.collationTableMap = {
		"de_DE": "0123456789 A[Ä]a[ä]BbCcDdEeFfGgHhIiJjKkLlMmNnO[Ö]o[ö]PpQqRrS[ẞ]s[ß]TtU[Ü]u[ü]VvWwXxYyZz@[{SANKT;ST.}]@[{Sankt;St.}]@[{sankt;st.}]",
		"en_GB": "0123456789 A[ÁÀÂÄÅĀĄĂÆ]a[áàâäåāąăæ]BbC[ÇĆČĊ]c[çćčċ]D[ĎĐ]d[ďđ]E[ÉÈÊËĘĒĔĖĚ]e[éèêëęēĕėě]FfG[ĢĜĞĠ]g[ģĝğġ]H[ĤĦ]h[ĥħ]I[ÍÌÎÏĪĨĬĮİ]i[íìîïīĩĭįi̇]J[Ĵ]j[ĵ]K[Ķ]k[ķ]L[ŁĹĻĽ]l[łĺļľ]MmN[ÑŃŇŅŊ]n[ñńňņŋ]O[ÓÒÔÖŌŎŐØŒ]o[óòôöōŏőøœ]PpQqR[ŔŘŖ]r[ŕřŗ]S[ŚŠŜŞȘẞ]s[śšŝşșß]T[ŢȚŤŦ]t[ţțťŧ]ÞþU[ÚÙÛÜŮŪŲŨŬŰŲ]u[úùûüůūųũŭűų]VvW[Ŵ]w[ŵ]XxY[ŸÝŶ]y[ÿýŷ]Z[ŹŻŽ]z[źżž]",
		"cz_CZ": "0123456789 A[Á]a[á]BbCcČčD[Ď]d[ď]E[ÉĚ]e[éě]FfGgHh@[{CH}]@[{ch}]I[Í]i[í]JjKkLlMmN[Ň]n[ň]O[Ó]o[ó]PpQqRrŘřSsŠšT[Ť]t[ť]U[ÚŮ]u[úů]VvWwXxY[Ý]y[ý]ZzŽž",
		"default": "0123456789 A[ÁÀÂÄÅĀĄĂÆ]a[áàâäåāąăæ]BbC[ÇĆČĊ]c[çćčċ]D[ĎĐ]d[ďđ]E[ÉÈÊËĘĒĔĖĚ]e[éèêëęēĕėě]FfG[ĢĜĞĠ]g[ģĝğġ]H[ĤĦ]h[ĥħ]I[ÍÌÎÏĪĨĬĮ]i[íìîïīĩĭį]J[Ĵ]j[ĵ]K[Ķ]k[ķ]L[ŁĹĻĽ]l[łĺļľ]MmN[ÑŃŇŅŊ]n[ñńňņŋ]O[ÓÒÔÖŌŎŐØŒ]o[óòôöōŏőøœ]PpQqR[ŔŘŖ]r[ŕřŗ]S[ŚŠŜŞȘẞ]s[śšŝşșß]T[ŢȚŤŦ]t[ţțťŧ]U[ÚÙÛÜŮŪŲŨŬŰŲ]u[úùûüůūųũŭűų]VvW[Ŵ]w[ŵ]XxY[ŸÝŶ]y[ÿýŷ]Z[ŹŻŽ]z[źżž]"
	};

	this.compare = this.__createCompareFunction();
}


/**
 * Compare function as callback in Array sort method
 * @returns {number}
 */
IntlCollator.prototype.__createCompareFunction = function () {

	var _fallbackComparator = function (a, b) {
		return 0;
	};

	/* Define collation table */
	var _collationTable = this.collationTableMap[this.langCode] || this.collationTableMap["default"];

	/* Check: Collation table OK? */
	var _openCurlyBracketArray = (_collationTable.match(/{/ig) || []);
	var _closeCurlyBracketArray = (_collationTable.match(/}/ig) || []);
	var _openSquareBracketArray = (_collationTable.match(/\[/ig) || []);
	var _closeSquareBracketArray = (_collationTable.match(/\]/ig) || []);
	if (_openCurlyBracketArray.length !== _closeCurlyBracketArray.length || _openSquareBracketArray.length !== _closeSquareBracketArray.length) {
		return _fallbackComparator;
	}

	/* Analyze collation table */
	var _analyzeResultObj = this.analyzeCollationTable(_collationTable, []);
	if (!_analyzeResultObj) {
		return _fallbackComparator;
	}

	/* Check: Analysis results OK? */
	var _mergedCollationTable = _analyzeResultObj["mergedCollationTable"];
	var _replaceObjArray = _analyzeResultObj["replaceObjects"];
	if (!_mergedCollationTable || _mergedCollationTable.constructor !== String || !_replaceObjArray || !(_replaceObjArray instanceof Array)) {
		return _fallbackComparator;
	}

	/**
	 * Special characters
	 */
	_replaceObjArray.push({ "findWhat": this.bracketRegExp, "changeTo": this.bracketsReplacementChar });
	_replaceObjArray.push({ "findWhat": this.punctuationRegExp, "changeTo": this.punctuationReplacementChar });
	_replaceObjArray.push({ "findWhat": this.ignoreCharsRegExp, "changeTo": "" });

	/**
	 * Word separators: spaces, slashes, and forward slashes
	 */
	var _targetCollationTable = "";
	switch (this.sortMode) {
		/* Word by Word */
		case "word":
			_replaceObjArray.push({ "findWhat": this.wordSeparatorsRegExp, "changeTo": this.wordSeparator });
			_targetCollationTable = this.punctuationChars + this.bracketChars + this.wordSeparator + _mergedCollationTable;
			break;
		/* Letter by Letter */
		case "letter":
			_replaceObjArray.push({ "findWhat": this.wordSeparatorsRegExp, "changeTo": "" });
			_targetCollationTable = this.punctuationChars + this.bracketChars + _mergedCollationTable;
			break;
		default:
			return _fallbackComparator;
	}

	var _isCaseSensitive = this.isCaseSensitive;
	var _orderValue = (this.sortOrder === "descending") ? -1 : 1;

	/* Array sort function */
	return function (a, b) {

		var _numberRegExp = new RegExp("\\d+", "");

		/* Convert case */
		if (!_isCaseSensitive) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}

		/* Replace Charcters */
		for (var n = 0; n < _replaceObjArray.length; n += 1) {
			var _curReplaceObj = _replaceObjArray[n];
			if (!_curReplaceObj) {
				continue;
			}
			var _findWhat = _curReplaceObj["findWhat"];
			if (!_findWhat || !(_findWhat instanceof RegExp)) {
				continue;
			}
			var _changeTo = _curReplaceObj["changeTo"];
			if (_changeTo == null || _changeTo.constructor !== String) {
				continue;
			}
			a = a.replace(_findWhat, _changeTo);
			b = b.replace(_findWhat, _changeTo);
		}

		/* Replace numbers */
		var _aNumArray = a.match(_numberRegExp);
		var _bNumArray = b.match(_numberRegExp);
		if (_aNumArray !== null && _bNumArray !== null) {

			var _aNum = Number(_aNumArray[0]);
			var _bNum = Number(_bNumArray[0]);

			if (_aNum > _bNum) {
				a = a.replace(_numberRegExp, "2");
				b = b.replace(_numberRegExp, "1");
			} else if (_aNum < _bNum) {
				a = a.replace(_numberRegExp, "1");
				b = b.replace(_numberRegExp, "2");
			} else {
				a = a.replace(_numberRegExp, "1");
				b = b.replace(_numberRegExp, "1");
			}
		}

		if (a === b) {
			return 0;
		}

		/* Analyze: sort order */
		var i = 0;
		var _min = Math.min(a.length, b.length);

		while (i < _min && a.charAt(i) === b.charAt(i)) {
			i++;
		}

		if (i >= _min) {
			if (a.length === b.length) {
				return 0;
			}
			return (a.length < b.length) ? -_orderValue : _orderValue;
		}

		var _charAIndex = _targetCollationTable.indexOf(a.charAt(i));
		var _charBIndex = _targetCollationTable.indexOf(b.charAt(i));

		if (_charAIndex === -1) {
			return _orderValue;
		}
		if (_charBIndex === -1) {
			return -_orderValue;
		}
		if (_charAIndex === _charBIndex) {
			return 0;
		}

		return (_charAIndex > _charBIndex) ? _orderValue : - _orderValue;
	};
};


/**
 * Analyze collation table
 * e.g. "&A[ÁÀÂÄÅ}ĀĄĂÆ]BC[ÇĆČĊ]D...s@[{ß;ss}]...y[ÿ]z"
 * @param {*} _collationTable 
 * @param {*} _replaceObjArray 
 * @returns { Array of Objects: [{ "findWhat":Regular Expression, "changeTo":String }] }
 */
IntlCollator.prototype.analyzeCollationTable = function (_collationTable, _replaceObjArray) {

	if (!_replaceObjArray || !(_replaceObjArray instanceof Array)) {
		return false;
	}
	if (_collationTable == null || _collationTable.constructor !== String) {
		return false;
	}

	var _multipleCharMarker = "@";
	var _multipleCharMarkerRegExp = new RegExp(_multipleCharMarker, "ig");
	var _multipleCharSeparator = ";";
	var _bracketRegExp = new RegExp("\\[[^\\]]*?\\]", "ig");

	var _prevChar;
	var _singleChar = false;
	var _multipleChar = false;
	var _findWhatSingleChar = "";
	var _findWhatMultipleChar = "";
	var _changeTo = "";

	for (var i = 0; i < _collationTable.length; i += 1) {

		var _curChar = _collationTable.charAt(i);

		if (_curChar === "[") {
			_changeTo = _prevChar;
			_singleChar = true;
			_multipleChar = false;
			_findWhatSingleChar = "";
			continue;
		}
		if (_curChar === "]") {
			if (_findWhatSingleChar !== "") {
				_replaceObjArray.push({
					"findWhat": new RegExp("[" + this.__escapeRegExpCharClass(_findWhatSingleChar) + "]", "g"),
					"changeTo": _changeTo
				});
			}
			_singleChar = false;
			_multipleChar = false;
			_findWhatSingleChar = "";
			continue;
		}

		if (_curChar === "{") {
			_singleChar = false;
			_multipleChar = true;
			_findWhatMultipleChar = "";
			continue;
		}
		if (_curChar === "}") {
			if (_findWhatMultipleChar !== "" && _findWhatMultipleChar.indexOf(_multipleCharSeparator) > -1) {
				var _findChangeArray = _findWhatMultipleChar.split(_multipleCharSeparator);
				var _changeToString = _findChangeArray[0] || "";
				var _findWhatString = _findChangeArray[1] || "";
				_replaceObjArray.push({
					"findWhat": new RegExp(this.__escapeRegExp(_findWhatString), "g"),
					"changeTo": _changeToString
				});
			}
			_singleChar = true;
			_multipleChar = false;
			_findWhatMultipleChar = "";
			continue;
		}

		if (_singleChar == true) {
			_findWhatSingleChar += _curChar;
		}
		if (_multipleChar == true) {
			_findWhatMultipleChar += _curChar;
		}

		_prevChar = _curChar;
	}

	var _mergedCollationTable = _collationTable.replace(_bracketRegExp, "").replace(_multipleCharMarkerRegExp, "");

	return {
		"mergedCollationTable": _mergedCollationTable,
		"replaceObjects": _replaceObjArray
	};
};


/**
 * Escape regular expression string
 * @param {string} _input 
 * @returns 
 */
IntlCollator.prototype.__escapeRegExp = function (_input) {
	if (!_input || _input.constructor !== String) {
		return "";
	}
	return _input.replace(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/g, "\\$1");
};


/**
 * Escape regular expression character class string
 * @param {string} _input 
 * @returns 
 */
IntlCollator.prototype.__escapeRegExpCharClass = function (_input) {
	if (!_input || _input.constructor !== String) {
		return "";
	}
	return _input.replace(/([\\\]\-\^])/g, "\\$1");
};










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
	_tabPanel.margins = [8, 8, 0, 4];


	/* Paragraph Styles */
	var _pStyleTab = _tabPanel.add("tab", undefined, localize(_global.paragraphStyleTabLabel));
	_pStyleTab.alignChildren = "fill";
	_pStyleTab.spacing = 0;

	var _bookmarkLevel1Group = _pStyleTab.add("group");
	_bookmarkLevel1Group.margins = [5, 0, 5, 0];
	var _bookmarkLevel1Statictext = _bookmarkLevel1Group.add("statictext", undefined, localize(_global.bookmarkLevel1Label));
	_bookmarkLevel1Statictext.justify = "left";

	var _pStyleLevel1ListboxOptions = {
		"numberOfColumns": 3,
		"columnWidths": [250, 250, 120],
		"showHeaders": true,
		"columnTitles": [localize(_global.styleNameLabel), localize(_global.styleGroupLabel), localize(_global.pdfExportTagLabel)],
		"multiselect": true
	};
	var _pStyleLevel1Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel1ListboxOptions);
	_pStyleLevel1Listbox.minimumSize = [640, 181];
	_pStyleLevel1Listbox.maximumSize = [640, 181];

	var _pStyleListboxHelpTextGroup = _pStyleTab.add("group");
	_pStyleListboxHelpTextGroup.spacing = 40;
	_pStyleListboxHelpTextGroup.margins = [5, 10, 5, 5];
	_pStyleListboxHelpTextGroup.add("statictext", undefined, localize(_global.listBoxMultiselectHelpTip));
	_pStyleListboxHelpTextGroup.add("statictext", undefined, localize(_global.listBoxDeselectHelpTip));

	var _bookmarkLevel2Group = _pStyleTab.add("group");
	_bookmarkLevel2Group.margins = [5, 10, 5, 0];
	var _bookmarkLevel2Statictext = _bookmarkLevel2Group.add("statictext", undefined, localize(_global.bookmarkLevel2Label));
	_bookmarkLevel2Statictext.justify = "left";

	var _pStyleLevel2ListboxOptions = {
		"numberOfColumns": 3,
		"columnWidths": [250, 250, 120],
		"showHeaders": true,
		"columnTitles": [localize(_global.styleNameLabel), localize(_global.styleGroupLabel), localize(_global.pdfExportTagLabel)],
		"multiselect": true
	};
	var _pStyleLevel2Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel2ListboxOptions);
	_pStyleLevel2Listbox.minimumSize = [640, 141];
	_pStyleLevel2Listbox.maximumSize = [640, 141];

	var _bookmarkLevel3Group = _pStyleTab.add("group");
	_bookmarkLevel3Group.margins = [5, 15, 5, 0];
	var _bookmarkLevel3Statictext = _bookmarkLevel3Group.add("statictext", undefined, localize(_global.bookmarkLevel3Label));
	_bookmarkLevel3Statictext.justify = "left";

	var _pStyleLevel3ListboxOptions = {
		"numberOfColumns": 3,
		"columnWidths": [250, 250, 120],
		"showHeaders": true,
		"columnTitles": [localize(_global.styleNameLabel), localize(_global.styleGroupLabel), localize(_global.pdfExportTagLabel)],
		"multiselect": true
	};
	var _pStyleLevel3Listbox = _pStyleTab.add("listbox", undefined, " ", _pStyleLevel3ListboxOptions);
	_pStyleLevel3Listbox.minimumSize = [640, 141];
	_pStyleLevel3Listbox.maximumSize = [640, 141];

	var _pStyleActionButtonGroup = _pStyleTab.add("group");
	_pStyleActionButtonGroup.margins.top = 15;
	_pStyleActionButtonGroup.margins.right = 5;
	var _selectPDFHeadingsButton = _pStyleActionButtonGroup.add("button", undefined, localize(_global.selectPDFHeadingsButtonLabel));
	var _sortPStylesCheckbox = _pStyleActionButtonGroup.add("checkbox", undefined, localize(_global.sortPStylesCheckboxLabel));
	_sortPStylesCheckbox.alignment = ["right", "middle"];
	_sortPStylesCheckbox.helpTip = localize(_global.sortPStylesCheckboxHelpTip);

	/* Character Styles */
	var _cStyleTab = _tabPanel.add("tab", undefined, localize(_global.characterStyleTabLabel));
	_cStyleTab.alignChildren = "fill";

	var _cStyleLevel1ListboxOptions = {
		"numberOfColumns": 2,
		"columnWidths": [250, 370],
		"showHeaders": true,
		"columnTitles": [localize(_global.styleNameLabel), localize(_global.styleGroupLabel)],
		"multiselect": true
	};
	var _cStyleLevel1Listbox = _cStyleTab.add("listbox", undefined, " ", _cStyleLevel1ListboxOptions);
	_cStyleLevel1Listbox.minimumSize = [640, 421];
	_cStyleLevel1Listbox.maximumSize = [640, 421];

	var _cStyleListboxHelpTextGroup = _cStyleTab.add("group");
	_cStyleListboxHelpTextGroup.spacing = 40;
	_cStyleListboxHelpTextGroup.margins = [5, 5, 5, 10];
	_cStyleListboxHelpTextGroup.add("statictext", undefined, localize(_global.listBoxMultiselectHelpTip));
	_cStyleListboxHelpTextGroup.add("statictext", undefined, localize(_global.listBoxDeselectHelpTip));


	/* GREP */
	var _grepTab = _tabPanel.add("tab", undefined, localize(_global.grepSearchTabLabel));
	_grepTab.alignChildren = "fill";

	_grepTab.add("statictext", undefined, localize(_global.grepFindWhatLabel));
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
	_startButton.alignment = ["fill", "top"];
	_startButton.helpTip = localize(_global.startButtonHelpText);

	var _refreshButton = _actionButtonGroup.add("button", undefined, localize(_global.refreshButtonLabel));
	_refreshButton.alignment = ["fill", "top"];
	_refreshButton.helpTip = localize(_global.refreshButtonHelpText);

	var _cancelButton = _actionButtonGroup.add("button", undefined, localize(_global.cancelButtonLabel), { name: "cancel" });
	_cancelButton.alignment = ["fill", "bottom"];
	_cancelButton.helpTip = localize(_global.cancelButtonHelpText);


	/**
	 *  Callbacks
	 */
	_pStyleLevel1Listbox.onChange = function () {
		if (_pStyleLevel1Listbox.selection) {
			_bookmarkLevel2Statictext.visible = true;
			_pStyleLevel2Listbox.visible = true;
			__deselectStylesListboxItems(_pStyleLevel2Listbox, this.selection);
			var _combinedSelectionArray = [].concat(_pStyleLevel1Listbox.selection, _pStyleLevel2Listbox.selection);
			__deselectStylesListboxItems(_pStyleLevel3Listbox, _combinedSelectionArray);
		} else {
			_bookmarkLevel2Statictext.visible = false;
			_pStyleLevel2Listbox.visible = false;
			_pStyleLevel2Listbox.selection = null;
			_bookmarkLevel3Statictext.visible = false;
			_pStyleLevel3Listbox.visible = false;
			_pStyleLevel3Listbox.selection = null;
		}
	};

	_pStyleLevel2Listbox.onChange = function () {
		if (_pStyleLevel2Listbox.selection) {
			_bookmarkLevel3Statictext.visible = true;
			_pStyleLevel3Listbox.visible = true;
			var _combinedSelectionArray = [].concat(_pStyleLevel1Listbox.selection, _pStyleLevel2Listbox.selection);
			__deselectStylesListboxItems(_pStyleLevel3Listbox, _combinedSelectionArray);
		} else {
			_bookmarkLevel3Statictext.visible = false;
			_pStyleLevel3Listbox.visible = false;
			_pStyleLevel3Listbox.selection = null;
		}
	};

	_selectPDFHeadingsButton.onClick = function () {
		__selectListboxItemsByExportTags(_pStyleLevel1Listbox, 1);
		__selectListboxItemsByExportTags(_pStyleLevel2Listbox, 2);
		__selectListboxItemsByExportTags(_pStyleLevel3Listbox, 3);
		_parentBookmarkCheck.value = false;
	};

	_sortPStylesCheckbox.onClick = function () {
		_refreshButton.notify();
	};

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

		if (!_global) {
			return;
		}
		if (app.documents.length === 0 || app.layoutWindows.length === 0) {
			_ui.text = localize(_global.addBookmarks);
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

		switch (_tabPanel.selection) {
			/* Paragraph Style */
			case _pStyleTab:
				if (!!_pStyleLevel1Listbox.selection) {
					var _selectedPStyleObjArray = __getSelectedStyleObjects([_pStyleLevel1Listbox, _pStyleLevel2Listbox, _pStyleLevel3Listbox]);
					_argsArray = [_selectedPStyleObjArray, _parentBookmark];
					_addedBookmarks = app.doScript(__makeBookmarksByParagraphStyles, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
				}
				break;
			/* Character Style */
			case _cStyleTab:
				if (!!_cStyleLevel1Listbox.selection) {
					var _selectedCStyleObjArray = __getSelectedStyleObjects([_cStyleLevel1Listbox]);
					_argsArray = [_selectedCStyleObjArray, _parentBookmark];
					_addedBookmarks = app.doScript(__makeBookmarksByCharacterStyles, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
				}
				break;
			/* GREP */
			case _grepTab:
				if (!!_grepInputField.text) {
					_argsArray = [_grepInputField.text, _parentBookmark];
					_addedBookmarks = app.doScript(__makeBookmarksByGREP, ScriptLanguage.JAVASCRIPT, _argsArray, UndoModes.ENTIRE_SCRIPT, localize(_global.goBackLabel));
				}
				break;
			default:
				_ui.text = localize(_global.addBookmarks);
				break;
		}

		_ui.text = __buildResultString(_addedBookmarks);
	};


	/* Refresh dialog */
	_refreshButton.onClick = function () {
		if (!_global) {
			return;
		}
		var _areSorted = _sortPStylesCheckbox.value;
		__fillStylesListbox(_pStyleLevel1Listbox, "paragraph styles", 1, _areSorted);
		__fillStylesListbox(_pStyleLevel2Listbox, "paragraph styles", 2, _areSorted);
		__fillStylesListbox(_pStyleLevel3Listbox, "paragraph styles", 3, _areSorted);
		__fillStylesListbox(_cStyleLevel1Listbox, "character styles", 1, _areSorted);
		_bookmarkLevel2Statictext.visible = false;
		_pStyleLevel2Listbox.visible = false;
		_bookmarkLevel3Statictext.visible = false;
		_pStyleLevel3Listbox.visible = false;
		_grepInputField.text = "";
		_parentBookmarkCheck.value = false;
		_parentBookmarkDropdown.hide();
		_ui.text = localize(_global.addBookmarks);
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
	var _areSorted = _sortPStylesCheckbox.value;
	__fillStylesListbox(_pStyleLevel1Listbox, "paragraph styles", 1, _areSorted);
	__fillStylesListbox(_pStyleLevel2Listbox, "paragraph styles", 2, _areSorted);
	__fillStylesListbox(_pStyleLevel3Listbox, "paragraph styles", 3, _areSorted);
	__fillStylesListbox(_cStyleLevel1Listbox, "character styles", 1, _areSorted);

	_bookmarkLevel2Statictext.visible = false;
	_pStyleLevel2Listbox.visible = false;
	_bookmarkLevel3Statictext.visible = false;
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
 * @param {string} _styleType 
 * @param {number} _level 
 * @param {boolean} _areSorted default: false
 * @returns 
 */
function __fillStylesListbox(_listbox, _styleType, _level, _areSorted) {

	if (!_listbox || !(_listbox instanceof ListBox)) {
		return null;
	}
	if (!_styleType || typeof _styleType !== "string") {
		return;
	}
	if (_level === undefined || _level === null || typeof _level !== "number") {
		return;
	}
	if (_areSorted !== true && _areSorted !== false) {
		_areSorted = false;
	}

	/* Reset listbox */
	_listbox.removeAll();

	if (app.documents.length === 0 || app.layoutWindows.length === 0) {
		return;
	}

	var _doc = app.activeDocument;
	if (!_doc.isValid) {
		return;
	}

	var _styleObjArray = __getAllStyles(_doc, _styleType);
	if (_areSorted) {
		_styleObjArray = __sortStyleObjects(_styleObjArray);
	}

	for (var s = 0; s < _styleObjArray.length; s += 1) {

		var _styleObj = _styleObjArray[s];
		if (!_styleObj) {
			continue;
		}

		var _stylePathArray = _styleObj.path;
		if (!_stylePathArray || !(_stylePathArray instanceof Array) || _stylePathArray.length < 1) {
			continue;
		}

		var _style = _styleObj.style;
		if (!_style || !_style.isValid) {
			continue;
		}

		var _styleName = _stylePathArray[_stylePathArray.length - 1] || "";
		var _listItem = _listbox.add("item", _styleName);
		if (!_listItem) {
			continue;
		}

		/* Subitems */
		if (_listItem.subItems[0]) {
			var _stylePath = _stylePathArray.slice(0, -1).join(" → ");
			_listItem.subItems[0].text = _stylePath;
		}
		if (_listItem.subItems[1]) {
			var _pdfExportTag = _styleObj.exportTags.pdf || "";
			_listItem.subItems[1].text = _pdfExportTag;
		}

		/* Item props */
		_listItem.style = _style;
		_listItem.level = _level;
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
 * Select istbox items
 * @param {ListBox} _listbox 
 * @param {Number} _level 
 * @returns {boolean}
 */
function __selectListboxItemsByExportTags(_listbox, _level) {

	if (!_listbox || !(_listbox instanceof ListBox)) {
		return false;
	}
	if (!_level || typeof _level !== "number" || _level < 1 || _level > 6) {
		return false;
	}


	/* Reset */
	_listbox.selection = null;

	/* Select items */
	var _listboxItemArray = _listbox.items;

	for (var i = 0; i < _listboxItemArray.length; i += 1) {

		var _listboxItem = _listboxItemArray[i];
		if (!_listboxItem || _listboxItem.subItems.length < 2) {
			continue;
		}

		if (_listboxItem.subItems[1].text === "H" + _level) {
			_listboxItem.selected = true;
		}
	}

	return true;
}


/**
 * Get selected styles
 * @param {Array} _listboxArray 
 * @returns {Array<{"style": ParagraphStyle|CharacterStyle, "level": number}>}
 */
function __getSelectedStyleObjects(_listboxArray) {

	if (!_listboxArray || !(_listboxArray instanceof Array)) {
		return [];
	}

	var _styleObjArray = [];

	for (var i = 0; i < _listboxArray.length; i += 1) {

		var _listbox = _listboxArray[i];
		if (!_listbox || !(_listbox instanceof ListBox)) {
			continue;
		}

		var _listboxSelection = _listbox.selection;
		if (!_listboxSelection) {
			continue;
		}

		for (var j = 0; j < _listboxSelection.length; j += 1) {

			var _listboxItem = _listboxSelection[j];
			if (!_listboxItem) {
				continue;
			}

			var _style = _listboxItem.style;
			if (!_style || !(_style instanceof Object) || !_style.isValid) {
				continue;
			}
			var _level = _listboxItem.level;
			if (_level === undefined || _level === null || typeof _level !== "number") {
				continue;
			}

			_styleObjArray.push({
				"style": _style,
				"level": _level
			});
		}
	}

	return _styleObjArray;
}


/**
 * Get all styles
 * Style Object: 
 * {
 * 	"style": InDesign.Style,
 * 	"path": Array<string>,
 * 	"exportTags": {
 *  	pdf: string;
 * 		epub: string;
 * 	}
 * }
 * @param { Document } _doc 
 * @param { "paragraph style" | "character styles" | "object styles" | "table styles" | "cell styles" } _styleType 
 * @returns { Array<{ "style": ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle, "path": Array<string>, "exportTags": { "pdf": string, "epub": string} }> }
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

		var _stylePathArray = __getStyleName(_style, [_style.name], _styleGroupInstance);
		var _exportTagObj = __getExportTags(_style);

		_styleObjArray.push({
			"style": _style,
			"path": _stylePathArray,
			"exportTags": _exportTagObj
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
 * Get export tags
 * @param {ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle } _style 
 * @returns {{ "pdf": string, "epub": string }}
 */
function __getExportTags(_style) {

	var _exportTagObj = {
		"pdf": "",
		"epub": ""
	};

	if (!_style || !_style.hasOwnProperty("styleExportTagMaps") || !_style.isValid) {
		return _exportTagObj;
	}

	var _styleExportTagMapArray = _style.styleExportTagMaps;

	for (var i = 0; i < _styleExportTagMapArray.length; i += 1) {

		var _styleExportTagMap = _styleExportTagMapArray[i];
		if (!_styleExportTagMap) {
			continue;
		}

		var _exportType = _styleExportTagMap.exportType;
		var _exportTag = _styleExportTagMap.exportTag || "";

		if (_exportType === "PDF") {
			_exportTagObj.pdf = _exportTag;
		} else if (_exportType === "EPUB") {
			_exportTagObj.epub = _exportTag;
		}
	}

	return _exportTagObj;
}

/**
 * Sort styles objects
 * @param { Array<{ "style": ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle, "path": Array<string>, "exportTags": { "pdf": string, "epub": string} }> } _styleObjArray
 * @returns { Array<{ "style": ParagraphStyle | CharacterStyle | ObjectStyle | TableStyle | CellStyle, "path": Array<string>, "exportTags": { "pdf": string, "epub": string} }> } 
 */
function __sortStyleObjects(_styleObjArray) {

	if (!_styleObjArray || !(_styleObjArray instanceof Array)) {
		return [];
	}

	var _collator = new IntlCollator("default", {
		caseSensitive: false,
		sortMode: "word",
		sortOrder: "ascending"
	});

	var _sortedStyleObjArray = _styleObjArray.slice().sort(function (_a, _b) {

		if (!_a || !(_a instanceof Object) || !_a.hasOwnProperty("path")) {
			return -1;
		}
		if (!_b || !(_b instanceof Object) || !_b.hasOwnProperty("path")) {
			return 1;
		}

		var _aPathArray = _a.path;
		if (!_aPathArray || !(_aPathArray instanceof Array) || _aPathArray.length === 0) {
			return -1;
		}
		var _bPathArray = _b.path;
		if (!_bPathArray || !(_bPathArray instanceof Array) || _bPathArray.length === 0) {
			return 1;
		}

		var _aName = _aPathArray[_aPathArray.length - 1] || "";
		var _bName = _bPathArray[_bPathArray.length - 1] || "";

		var _sortOrder = _collator.compare(_aName, _bName);
		if (_sortOrder !== 0) {
			return _sortOrder;
		}

		var _aPath = _aPathArray.join(" ");
		var _bPath = _bPathArray.join(" ");

		return _collator.compare(_aPath, _bPath);
	});

	return _sortedStyleObjArray;
}


/**
 * Fill parent bookmark dropdown
 * @param {*} _dropDown 
 * @returns 
 */
function __fillParentBookmarkDropdown(_dropDown) {

	if (!_global) {
		return;
	}
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
		var _fullName = __createBookmarkFullName(_bookmark);
		if (!_fullName) {
			_fullName = localize(_global.defaultBookmarkName);
		}
		var _dropDownItem = _dropDown.add("item", _fullName);
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

	var _pStyleObjArray = _doScriptArgumentArray[0];
	if (!_pStyleObjArray || !(_pStyleObjArray instanceof Array)) {
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
	outer: for (var s = 0; s < _pStyleObjArray.length; s += 1) {

		var _pStyleObj = _pStyleObjArray[s];
		if (!_pStyleObj) {
			continue;
		}
		var _targetPStyle = _pStyleObj.style;
		if (!_targetPStyle || !_targetPStyle.isValid) {
			continue;
		}
		var _bookmarkLevel = _pStyleObj.level;
		if (_bookmarkLevel === undefined || _bookmarkLevel === null || typeof _bookmarkLevel !== "number") {
			continue;
		}

		var _pStyleMatchArray = __findGREP(_doc, { "findWhat": "(.|\n|~F)+", "appliedParagraphStyle": _targetPStyle }, "forward");
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

				var _bookmark = __addBookmark(_doc, _targetParagraph, _parentBookmark);
				if (_bookmark && _bookmark.isValid) {
					_bookmark.insertLabel("level", String(_bookmarkLevel));
					_bookmarkCounter += 1;
				} else {
					_errorCounter += 1;
				}
			}
		}
	}

	if (_bookmarkCounter > 0) {

		/* Sort bookmarks */
		var _areBookmarksSorted = __sortBookmarks();

		/* Nest bookmarks */
		if (_areBookmarksSorted) {
			__nestBookmarks(_doc, _parentBookmark);
		}
	}

	_global["progressbar"].close();

	return [
		_bookmarkCounter,
		_errorCounter
	];
}


/* Sort bookmarks */
function __sortBookmarks() {

	try {
		app.menuActions.itemByID(95498).invoke();
	} catch (_error) {
		alert(_error.message);
		return false;
	}

	return true;
}


/* Nest bookmarks */
function __nestBookmarks(_doc, _parent) {

	if (!_doc || !_doc.isValid) {
		return false;
	}
	if (!_parent) {
		_parent = _doc;
	}

	var _leve1Bookmark;
	var _leve2Bookmark;

	var _bookmarkArray = _parent.bookmarks.everyItem().getElements();

	for (var i = 0; i < _bookmarkArray.length; i++) {

		var _bookmark = _bookmarkArray[i];
		if (!_bookmark || !_bookmark.isValid) {
			continue;
		}

		var _bookmarkLevel = _bookmark.extractLabel("level");
		if (!_bookmarkLevel) {
			continue;
		}

		switch (Number(_bookmarkLevel)) {
			case 1:
				_leve1Bookmark = _bookmark;
				_leve2Bookmark = null;
				break;
			case 2:
				_leve2Bookmark = _bookmark;
				if (_leve1Bookmark && _leve1Bookmark.isValid) {
					_bookmark.move(LocationOptions.AT_END, _leve1Bookmark);
				}
				break;
			case 3:
				if (_leve2Bookmark && _leve2Bookmark.isValid) {
					_bookmark.move(LocationOptions.AT_END, _leve2Bookmark);
				} else if (_leve1Bookmark && _leve1Bookmark.isValid) {
					_bookmark.move(LocationOptions.AT_END, _leve1Bookmark);
				}
				break;
		}

		/* Reset script label */
		try {
			_bookmark.insertLabel("level", "");
		} catch (_error) {
			/* $.writeln(_error.message; */
		}
	}

	return true;
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

	var _cStyleObjArray = _doScriptArgumentArray[0];
	if (!_cStyleObjArray || !(_cStyleObjArray instanceof Array)) {
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
	outer: for (var s = 0; s < _cStyleObjArray.length; s += 1) {

		var _cStyleObj = _cStyleObjArray[s];
		if (!_cStyleObj) {
			continue;
		}

		var _targetCStyle = _cStyleObj.style;
		if (!_targetCStyle || !_targetCStyle.isValid) {
			continue;
		}

		var _cStyleMatchArray = __findGREP(_doc, { "findWhat": "(.|\n|~F)+", "appliedCharacterStyle": _targetCStyle }, "forward");
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

			var _bookmark = __addBookmark(_doc, _cStyleMatch, _parentBookmark);
			if (_bookmark && _bookmark.isValid) {
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

		var _bookmark = __addBookmark(_doc, _grepMatch, _parentBookmark);
		if (_bookmark && _bookmark.isValid) {
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
 * @returns {Bookmark|null}
 */
function __addBookmark(_doc, _destText, _parentBookmark) {

	if (!_global) {
		return null;
	}
	if (!_doc || !_doc.isValid) {
		return null;
	}
	if (!_destText || !_destText.hasOwnProperty("contents") || !_destText.isValid) {
		return null;
	}

	var _parent = _parentBookmark;
	if (!_parent || !_parent.isValid) {
		_parent = _doc;
	}

	var _bookmarkName;
	var _destTextContents = String(_destText.contents);

	/* ToDo: mehr Zeichen entfernen??? */
	_bookmarkName = _destTextContents.replace("\n", "").replace("\\s+", " ", "g")
		.replace("[\x03\x04\x07\x08\x16\x17\x18\x19\u200B\uFEFF\uFFFC\uFFFE\u2011\u2028\u2029\u00AD\u200C\u200D\u200E\u200F\u202A-\u202E\u2063]", "", "g")
		.replace("\\s+$", "", "")
		.replace("^\\s+", "", "");

	if (!_bookmarkName) {
		_bookmarkName = localize(_global.defaultBookmarkName);
	}

	var _bookmark = null;

	try {

		/* Text anchor */
		var _destTextAnchor = _doc.hyperlinkTextDestinations.add(_destText);

		/* Bookmark */
		_bookmark = _doc.bookmarks.add(_destTextAnchor);
		_bookmark.move(LocationOptions.AT_BEGINNING, _parent);
		_bookmark.name = _bookmarkName;

	} catch (_error) {
		/* $.writeln(_error.message; */
		return null;
	}

	return _bookmark;
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
		en: "Add Bookmarks 2.3",
		de: "Add Bookmarks 2.3"
	};

	_global.goBackLabel = {
		en: "Add Bookmarks",
		de: "Lesezeichen erstellen"
	};

	_global.pStyleButtonLabel = {
		en: "Paragraph Style",
		de: "Absatzformat"
	};

	_global.cStyleButtonLabel = {
		en: "Character Style",
		de: "Zeichenformat"
	};

	_global.openBookmarkPanelLabel = {
		en: "Please open the bookmark panel: Windows → Interactive → Bookmarks",
		de: "Bitte die Lesezeichen-Palette öffnen: Fenster → Interaktiv → Lesezeichen"
	};

	_global.placeholder = {
		en: "Please select one these options.",
		de: "Bitte eine der Optionen ausw\u00E4hlen."
	};

	_global.grepButtonLabel = {
		en: "GREP",
		de: "GREP"
	};

	_global.startButtonLabel = {
		en: "Create",
		de: "Erstellen"
	};

	_global.cancelButtonLabel = {
		en: "Close",
		de: "Schlie\u00dfen"
	};

	_global.refreshButtonLabel = {
		en: "Refresh",
		de: "Aktualisieren"
	};

	_global.clearButtonLabel = {
		en: "Clear",
		de: "Leeren"
	};

	_global.defaultBookmarkName = {
		en: "Bookmark",
		de: "Lesezeichen"
	};

	_global.paragraphStyleTabLabel = {
		en: "Paragraph Style",
		de: "Absatzformat"
	};

	_global.characterStyleTabLabel = {
		en: "Character Style",
		de: "Zeichenformat"
	};

	_global.grepSearchTabLabel = {
		en: "GREP Search",
		de: "GREP-Suche"
	};

	_global.bookmarkLevel1Label = {
		en: "1. Bookmarks Level",
		de: "1. Lesezeichen-Ebene"
	};

	_global.bookmarkLevel2Label = {
		en: "2. Bookmarks Level",
		de: "2. Lesezeichen-Ebene"
	};

	_global.bookmarkLevel3Label = {
		en: "3. Bookmarks Level",
		de: "3. Lesezeichen-Ebene"
	};

	_global.styleNameLabel = {
		en: "Style Name",
		de: "Formatname"
	};

	_global.styleGroupLabel = {
		en: "Style Group",
		de: "Formatgruppe"
	};

	_global.pdfExportTagLabel = {
		en: "Export Tag (PDF)",
		de: "Export-Tag (PDF)"
	};

	_global.selectPDFHeadingsButtonLabel = {
		en: "Select PDF Headings (PDF)",
		de: "\u00dcberschriften ausw\u00E4hlen (PDF)"
	};

	_global.sortPStylesCheckboxLabel = {
		en: "Sort paragraph styles",
		de: "Absatzformate sortieren"
	};

	_global.sortPStylesCheckboxHelpTip = {
		en: "The paragraph styles are sorted alphabetically. The display is being updated.",
		de: "Die Absatzformate werden alphabetisch sortiert. Die Anzeige wird aktualisiert."
	};

	_global.bookmarksAddedAlert = {
		en: "Bookmarks added",
		de: "Lesezeichen erstellt"
	};

	_global.refreshBookmarkListDoScriptLabel = {
		en: "Refresh bookmarks list",
		de: "Lesezeichen-Liste aktualisieren"
	};

	_global.errorsAlert = {
		en: "Search results skipped",
		de: "Fundstellen \u00fcbersprungen"
	};

	_global.parentBookmarkCheckboxLabel = {
		en: "Parent Bookmark",
		de: "\u00dcbergeordnetes Lesezeichen"
	};

	_global.cancelWithESCLabel = {
		en: "Cancel with ESC",
		de: "Abbrechen mit ESC"
	};

	_global.addBookmarksLabel = {
		en: "Add bookmarks",
		de: "Lesezeichen hinzufügen"
	};

	_global.startButtonHelpText = {
		en: "Create bookmarks",
		de: "Lesezeichen erstellen"
	};

	_global.refreshButtonHelpText = {
		en: "Refresh dialog window",
		de: "Dialogfenster aktualisieren"
	};

	_global.cancelButtonHelpText = {
		en: "Close dialog window",
		de: "Dialogfenster schlie\u00dfen"
	};

	_global.listBoxMultiselectHelpTip = {
		en: "Select multiple items: SHIFT + click",
		de: "Mehrere Einträge auswählen: SHIFT + Klick"
	};

	_global.listBoxDeselectHelpTip = {
		en: "Remove item from selection: CMD + click",
		de: "Eintrag aus Auswahl entfernen: CMD + Klick"
	};

	_global.grepFindWhatLabel = {
		en: "Find what:",
		de: "Suchen nach:"
	};
}