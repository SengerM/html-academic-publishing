const ERROR_IS_HERE_STR = ' <span style="color:red;font-size:140%;font-weight: bold;background-color: yellow;">← ERROR is here</span>';

try {
	document.getElementById("document_title").innerHTML = document.title;
} catch {}

// Parse <author> tags -------------------------------------------------
var authors = document.getElementsByTagName('author');
if (authors.length > 0) {
	var affiliations_list = new Set();
	for (var i=0; i<authors.length; i++) {
		var current_author_affiliations = authors[i].getAttribute('affiliation').split('|');
		for (var k=0; k<current_author_affiliations.length; k++) {
			affiliations_list.add(current_author_affiliations[k]);
		}
	}
	affiliations_list = Array.from(affiliations_list);
	affiliations_list.sort();
	var authors_names_container = document.createElement('div');
	authors_names_container.setAttribute('id', 'authors_names_container');
	authors[0].parentNode.insertBefore(authors_names_container, authors[0]);
	for (var i=0; i<authors.length; i++) {
		authors_names_container.appendChild(authors[i]);
		var current_author_affiliations = authors[i].getAttribute('affiliation').split('|');
		console.log(current_author_affiliations);
		var current_author_affiliations_text_with_references = '';
		var affiliations_processed = 0;
		for (var k=0; k<affiliations_list.length; k++) {
			if (current_author_affiliations.indexOf(affiliations_list[k]) > -1) { // if affiliations_list[k] in current_author_affiliations:
				current_author_affiliations_text_with_references += `${k+1}`;
				affiliations_processed += 1;
			} else
				continue;
			if (affiliations_processed<current_author_affiliations.length)
				current_author_affiliations_text_with_references += ',';
		}
		authors[i].innerHTML += '<sup>' + current_author_affiliations_text_with_references + '</sup>';
	}
	var authors_affiliations_container = document.createElement('div');
	authors_affiliations_container.setAttribute('id', 'authors_affiliations_container');
	authors_names_container.parentNode.insertBefore(authors_affiliations_container, authors_names_container.nextSibling);
	for (var i=0; i<affiliations_list.length; i++) {
		var current_affiliation_element = document.createElement('div');
		current_affiliation_element.setAttribute('class', 'author_affiliation');
		authors_affiliations_container.appendChild(current_affiliation_element);
		current_affiliation_element.innerHTML = `<sup>${i+1}</sup>&nbsp;${affiliations_list[i]}`;
	}
}
// Parse <figure> tags -------------------------------------------------
var figures = document.getElementsByTagName("figure");
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
var equations = document.getElementsByTagName("equation");
var equations_reference_texts = {};
var equations_reference_popup_texts = {};
for(var i = 0; i < equations.length; i++) {
	var equation_number_display_str = `(${i+1})`;
	const numbered_equation_container = document.createElement('div');
	numbered_equation_container.className = "numbered_equation_container";
	equations[i].parentNode.insertBefore(numbered_equation_container, equations[i]);
	numbered_equation_container.appendChild(equations[i])
	const equation_number = document.createElement('div');
	equation_number.className = "equation_number";
	equation_number.innerHTML = `${"&nbsp;".repeat(5)}${equation_number_display_str}`;
	numbered_equation_container.appendChild(equation_number);
	equations[i].className = "equation_content";
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
var numbered_headings = get_all_numbered_h(document);
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
var footnotes = document.getElementsByTagName("footnote");
var footnotes_reference_texts = {};
var footnotes_reference_popup_texts = {};
if (footnotes.length != 0) {
	if (document.getElementById("footnotes_list") == null) {
		footnotes[0].innerHTML = '[' + footnotes[0].innerHTML + '] <b>You inserted at least this footnote but there is nowhere the <code>&lt;div id="footnotes_list">&lt;/div></code>, please add it somewhere in your HTML doucment where you want the footnotes list to be displayed, for example at the end close to <code>&lt;/body></code>.</b>' + ERROR_IS_HERE_STR;
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
		current_footnote_entry.innerHTML = `<a href=#${footnotes[i].id} class="footnote_key_link">` + footnotes_reference_texts[current_footnote_entry.id] + '</a> ' + current_footnote_content;
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
		li.innerHTML = `<a href="#${node.id}">${node.textContent}</a>`
		//~ node.innerHTML = `<a class="offset-anchor" id="section_${node.innerHTML}"></a>` + node.innerHTML
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
var crossref = document.getElementsByTagName("crossref");
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
			if (popup_text.includes('<footnote>')) {
				// Let's give a nice format to footnotes within in popups.
				popup_text = popup_text.replaceAll('<footnote>','<sup>[').replaceAll('</footnote>',']</sup>')
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

