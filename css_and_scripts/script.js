const ERROR_IS_HERE_STR = ' <span style="color:red;font-size:140%;font-weight: bold;background-color: yellow;">← ERROR is here</span>';

const document_content = document.getElementById("document_content")
if (document_content == null) {
	throw 'ERROR: HTML-SD requires a <div id="document_content"> object in which you put your document. This object could not be found in your HTML document.';
}

try {
	document.getElementById("document_title").innerHTML = document.title;
} catch {}

// Parse <figure> tags -------------------------------------------------
var figures = document_content.getElementsByTagName("figure");
var figures_reference_texts = {};
var figures_reference_popup_texts = {};
for(var i = 0; i < figures.length; i++) {
	var caption = figures[i].getElementsByTagName("figcaption")[0];
	caption.innerHTML = `<b>Figure ${i+1}. </b>` + caption.innerHTML;
	if (!figures[i].hasAttribute('id'))
		continue;
	if (figures[i].id in figures_reference_texts) {
		caption.innerHTML = caption.innerHTML + ERROR_IS_HERE_STR;
		figures[i].scrollIntoView();
		throw `ERROR: The id "${figures[i].id}" is used in more than one figure in the document. ids cannot repeat, please fix this.`;
	}
	figures_reference_texts[figures[i].id] = `${i+1}`; // This text will be placed where there is a reference to this figure.
	figures_reference_popup_texts[figures[i].id] = caption.innerHTML;
}
// Parse <equation> tags -----------------------------------------------
var equations = document_content.getElementsByTagName("equation");
var equations_reference_texts = {};
var equations_reference_popup_texts = {};
for(var i = 0; i < equations.length; i++) {
	var equation_number_display_str = `(${i+1})`;
	const equation_container = document.createElement('div');
	equation_container.className = "equation";
	equations[i].parentNode.insertBefore(equation_container, equations[i]);
	equation_container.appendChild(equations[i])
	const equation_number = document.createElement('div');
	equation_number.className = "equation__number";
	equation_number.innerHTML = `${"&nbsp;".repeat(5)}${equation_number_display_str}`;
	equation_container.appendChild(equation_number);
	equations[i].className = "equation__content";
	if (!equations[i].hasAttribute('id'))
		continue;
	if (equations[i].id in equations_reference_texts) {
		equation_number.innerHTML = ERROR_IS_HERE_STR;
		equations[i].scrollIntoView();
		throw `ERROR: The id "${equations[i].id}" is used in more than one equation in the document. ids cannot repeat, please fix this.`
	}
	equations_reference_texts[equations[i].id] = equation_number_display_str; // This text will be placed where there is a reference to this equation.
	equations_reference_popup_texts[equations[i].id] =  equations[i].innerHTML.replaceAll('$$','$');// This will appear in the popup window when the mouse hovers over the reference.
}
// Parse <h_> tags -----------------------------------------------------
function get_all_numbered_h(elements) {
	var arr = [];
	if (!elements) return arr;
	var all_el = elements.getElementsByTagName('*');
	for (var i = 0, n = all_el.length; i < n; i++) {
		if (/^h\d{1}$/gi.test(all_el[i].nodeName) && all_el[i].className!='unnumbered') {
			arr.push(all_el[i]);
		}
	}
	return arr;
}
var numbered_headings = get_all_numbered_h(document_content);
var headings_reference_texts = {};
var headings_reference_popup_texts = {};
var current_section_numbering = [0];
for (var i=0; i<numbered_headings.length; i++) {
	var current_indentation_level = parseInt(numbered_headings[i].tagName.toLowerCase().replace('h', ''));
	if (current_section_numbering.length == current_indentation_level) {
		current_section_numbering[current_section_numbering.length - 1] += 1;
	} else {
		var new_section_numbering = Array(current_indentation_level).fill(1)
		for (var k=0; k < (current_section_numbering.length<new_section_numbering.length ? current_section_numbering.length : new_section_numbering.length); k++) {
			new_section_numbering[k] = current_section_numbering[k];
		}
		if (current_section_numbering.length > new_section_numbering.length) {
			new_section_numbering[new_section_numbering.length -1] += 1;
		}
		current_section_numbering = new_section_numbering;
	}
	// Here we have the "2.4.3..." numbering for the current section stored in "current_section_numbering".
	var current_id = numbered_headings[i].hasAttribute('id') ? numbered_headings[i].id : numbered_headings[i].innerHTML;
	numbered_headings[i].innerHTML = current_section_numbering.join('.') + '. ' + numbered_headings[i].innerHTML;
	if (current_id in headings_reference_texts) {
		numbered_headings[i].innerHTML = numbered_headings[i].innerHTML + ERROR_IS_HERE_STR;
		numbered_headings[i].scrollIntoView();
		throw `ERROR: The id/name "${current_id}" is used in more than one heading in the document. If you manually defined this id please change one of them as they cannot repeat, if you have more than one section with the same name please assign them different ids to the section in order to use the same title.`;
	}
	headings_reference_texts[current_id] = current_section_numbering.join('.');
	headings_reference_popup_texts[current_id] = numbered_headings[i].innerHTML;
	numbered_headings[i].id = current_id; // If the heading had no id, this will set it. Otherwise it does nothing.
}
// Parse footnotes -----------------------------------------------------
var footnotes = document_content.getElementsByTagName("footnote");
var footnotes_reference_texts = {};
var footnotes_reference_popup_texts = {};
if (footnotes != null) {
	if (document.getElementById("footnotes_list") == null) {
		throw 'ERROR: You inserted footnotes in your document but there is nowhere to put the list of footnotes. Please add "<div id="footnotes_list></div>" somewhere in your document.';
	}
	var footnotes_list = document.createElement("ul");
	footnotes_list.setAttribute('id', 'footnotes_list');
	for (var i=0; i<footnotes.length; i++) {
		var current_footnote_id = `footnote_${i+1}`;
		var current_footnote_content = footnotes[i].innerHTML;
		if (current_footnote_content.includes('<footnote>')) {
			footnotes[i].innerHTML = footnotes[i].innerHTML + ERROR_IS_HERE_STR;
			footnotes[i].scrollIntoView();
			throw `ERROR: Found a footnote that contains a footnote inside it. This is not allowed, sorry. The footnote content is "${current_footnote_content}"`;
		}
		var current_footnote_entry = document.createElement('li');
		footnotes_list.appendChild(current_footnote_entry);
		current_footnote_entry.setAttribute('id', current_footnote_id + '_list_element');
		footnotes_reference_texts[current_footnote_entry.id] = `<sup>[${i+1}]</sup>`;
		footnotes[i].setAttribute('id', current_footnote_id);
		footnotes[i].innerHTML = '<crossref>' + current_footnote_entry.id + '</crossref>';
		current_footnote_entry.innerHTML = `<a href=#${footnotes[i].id}>` + footnotes_reference_texts[current_footnote_entry.id] + '</a> ' + current_footnote_content;
		footnotes_reference_popup_texts[current_footnote_entry.id] = current_footnote_content;
	}
	document.getElementById("footnotes_list").appendChild(footnotes_list);
}
// Automatic table of contents -----------------------------------------
//     This was taken from https://stackoverflow.com/a/17430494/8849755                                 
//     Here there is a working example http://jsfiddle.net/funkyeah/s8m2t/3/                            
function buildRec(nodes, elm, level) {
	var node;
	do { // filter
		node = nodes.shift();
	} while(node && (!(/^h[123456]$/i.test(node.tagName)) || (node.classList.contains("unnumbered"))));
	if(node) { // process the next node
		var ul, li, cnt;
		var curlevel = parseInt(node.tagName.substring(1));
		if(curlevel == level) { // same level append an il
			cnt = 0;
		} else if(curlevel < level) { // walk up then append il
			cnt = 0;
			do {
				elm = elm.parentNode.parentNode;
				cnt--;
			} while(cnt > (curlevel - level));
		} else if(curlevel > level) { // create children then append il
			cnt = 0;
			do {
				li = elm.lastChild;
				if(li == null)
					li = elm.appendChild(document.createElement("li"));
				elm = li.appendChild(document.createElement("ul"));
				cnt++;
			} while(cnt < (curlevel - level));
		}
		li = elm.appendChild(document.createElement("li"));
		// replace the next line with archor tags or whatever you want
		li.innerHTML = `<a href="#section_${node.innerHTML}">${node.textContent}</a>`
		node.innerHTML = `<a class="offset-anchor" id="section_${node.innerHTML}"></a>` + node.innerHTML
		buildRec(nodes, elm, level + cnt);
	}
}

if (document.getElementById("table-of-contents") != null) {
	var all = document.getElementsByTagName("*");
	var nodes = [];
	for(var i = all.length; i--; nodes.unshift(all[i]));
	var result = document.createElement("ul");
	result.setAttribute("id", "table-of-contents-ol");
	buildRec(nodes, result, 1);
	document.getElementById("table-of-contents").appendChild(result);
}
// Parse <crossref> tags -----------------------------------------------
var crossref = document_content.getElementsByTagName("crossref");
const texts_for_cross_references_by_id = Object.assign({}, 
	figures_reference_texts, 
	equations_reference_texts, 
	headings_reference_texts,
	footnotes_reference_texts
); // This is a dictionary of the form dict[id] = "text_to_be_shown_in_the_reference".
const texts_for_popup_windows_by_id = Object.assign({}, 
	equations_reference_popup_texts, 
	headings_reference_popup_texts, 
	figures_reference_popup_texts,
	footnotes_reference_popup_texts
);
for(var i = 0; i < crossref.length; i++) {
	var ref_to_this_id = crossref[i].innerHTML;
	var reference_str;
	if (ref_to_this_id in texts_for_cross_references_by_id) {
		reference_str = `<a class="cross-reference-link" href="#${ref_to_this_id}">${texts_for_cross_references_by_id[ref_to_this_id]}</a>`;
		if (ref_to_this_id in texts_for_popup_windows_by_id) {
			var popup_text = texts_for_popup_windows_by_id[ref_to_this_id];
			if (popup_text.includes('<crossref>')) {
				// Before inserting the text we have to replace all the possible crossrefs by their respective text:
				popup_text = popup_text.replaceAll('<crossref>','').replaceAll('</crossref>','');
				for (var id in texts_for_popup_windows_by_id) {
					if (popup_text.includes(id)) {
						popup_text = popup_text.replace(id, texts_for_cross_references_by_id[id]);
					}
				}
			} 
			reference_str = `<span class="popup_cross_reference" onMouseOver="javascript:this.className='popup_cross_reference_hover'" onMouseOut="javascript:this.className='popup_cross_reference'">` + reference_str + `<span>${popup_text}</span></span>`;
		}
	} else {
		crossref[i].innerHTML = crossref[i].innerHTML + ERROR_IS_HERE_STR;
		crossref[i].scrollIntoView();
		throw `ERROR: You are trying to do a <crossref> to the id "${ref_to_this_id}" was not defined anywhere. Look for it in your HTML code and fix this problem.`;
	}
	crossref[i].innerHTML = reference_str;
}

