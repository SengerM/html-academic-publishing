const ERROR_IS_HERE_STR = ' <span style="color:red;font-size:140%;font-weight: bold;background-color: yellow;">← ERROR is here</span>';

try {
	document.getElementById("document_title").innerHTML = document.title;
} catch {}

var elements_for_cross_references = {}; // This is a dictinary of the form
// elements_for_cross_references[id] = {
//     display_text: '1.1.1',
//     popup_text: '1.1.1 The best section',
// }
// Parse <float> tags -------------------------------------------------
var floats = document.getElementsByTagName("float");
var float_counters_by_float_class = {};
for(var i = 0; i < floats.length; i++) {
	var caption = floats[i].getElementsByTagName("floatcaption");
	if (caption.length == 0) {
		floats[i].innerHTML = floats[i].innerHTML + 'This float has no floatcaption!' + ERROR_IS_HERE_STR;
		floats[i].scrollIntoView();
		throw `ERROR: You inserted a <float> without a <floatcaption>, this is not allowed because I don't know what to do. The problem is in the <float> number ${i+1} starting from the top of the document. Otherwise, see the rendered HTML to find out where the problem is.`;
	}
	if (caption.length > 1) {
		floats[i].innerHTML = floats[i].innerHTML + 'This float has more than one floatcaption!' + ERROR_IS_HERE_STR;
		floats[i].scrollIntoView();
		throw `ERROR: You inserted a <float> with more than one <floatcaption>, this is not allowed because I don't know what to do. The problem is in the <float> number ${i+1} starting from the top of the document. Otherwise, see the rendered HTML to find out where the problem is.`;
	}
	caption = caption[0];
	var current_float_class = floats[i].getAttribute('class')
	if (current_float_class == null)
		continue;
	if (! (current_float_class in float_counters_by_float_class))
		float_counters_by_float_class[current_float_class] = 0; // Initialize a new counter for this class.
	float_counters_by_float_class[current_float_class] += 1;
	caption.innerHTML = `<b>${current_float_class} ${float_counters_by_float_class[current_float_class]}.&nbsp;&nbsp;</b>` + caption.innerHTML;
	if (!floats[i].hasAttribute('id'))
		continue;
	if (floats[i].id in elements_for_cross_references) {
		caption.innerHTML = caption.innerHTML + ERROR_IS_HERE_STR;
		floats[i].scrollIntoView();
		throw `ERROR: The id "${floats[i].id}" is used in more than one element in the document. ids cannot repeat, please fix this.`;
	}
	elements_for_cross_references[floats[i].id] = {};
	elements_for_cross_references[floats[i].id]['display_text'] = `${current_float_class}&nbsp;${float_counters_by_float_class[current_float_class]}`; // This text will be placed where there is a reference to this figure.
	elements_for_cross_references[floats[i].id]['popup_text'] = caption.innerHTML;
}
// Parse <equation> tags -----------------------------------------------
var equations = document.getElementsByTagName("equation");
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
	if (equations[i].id in elements_for_cross_references) {
		equation_number.innerHTML = ERROR_IS_HERE_STR;
		equations[i].scrollIntoView();
		throw `ERROR: The id "${equations[i].id}" is used in more than one element in the document. ids cannot repeat, please fix this.`
	}
	elements_for_cross_references[equations[i].id] = {}
	elements_for_cross_references[equations[i].id]['display_text'] = 'Eq.' + '&nbsp;' + equation_number_display_str; // This text will be placed where there is a reference to this equation.
	elements_for_cross_references[equations[i].id]['popup_text'] =  equations[i].innerHTML.replaceAll('$$','$');// This will appear in the popup window when the mouse hovers over the reference.
	var current_id = equations[i].id;
	equations[i].id = '';
	numbered_equation_container.id = current_id;
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
	if (current_id in elements_for_cross_references) {
		numbered_headings[i].innerHTML = numbered_headings[i].innerHTML + ERROR_IS_HERE_STR;
		numbered_headings[i].scrollIntoView();
		throw `ERROR: The id/name "${current_id}" is used in more than one heading/object in the document. If you manually defined this id please change one of them as they cannot repeat, if you have more than one section with the same name please assign them different ids to the section in order to use the same title.`;
	}
	elements_for_cross_references[current_id] = {};
	elements_for_cross_references[current_id]['display_text'] = 'Section' + '&nbsp;' + current_section_numbering.join('.');
	elements_for_cross_references[current_id]['popup_text'] = numbered_headings[i].innerHTML;
	numbered_headings[i].id = current_id; // If the heading had no id, this will set it. Otherwise it does nothing.
}
// Parse footnotes -----------------------------------------------------
var footnotes = document.getElementsByTagName("footnote");
if (footnotes.length != 0) {
	if (document.getElementById("footnotes_list") == null) {
		footnotes[0].innerHTML = '[' + footnotes[0].innerHTML + '] <b>You inserted at least this footnote but there is nowhere the <code>&lt;div id="footnotes_list">&lt;/div></code>, please add it somewhere in your HTML doucment where you want the footnotes list to be displayed, for example at the end close to <code>&lt;/body></code>.</b>' + ERROR_IS_HERE_STR;
		throw 'ERROR: You inserted footnotes in your document but there is nowhere to put the list of footnotes. Please add "<div id="footnotes_list></div>" somewhere in your document.';
	}
	var footnotes_list = document.createElement("div");
	footnotes_list.setAttribute('id', 'footnotes_list');
	for (var i=0; i<footnotes.length; i++) {
		var current_footnote_id = `footnote_${i+1}`;
		var current_footnote_content = footnotes[i].innerHTML;
		if (current_footnote_content.includes('<footnote>')) {
			footnotes[i].innerHTML = footnotes[i].innerHTML + ERROR_IS_HERE_STR;
			footnotes[i].scrollIntoView();
			throw `ERROR: Found a footnote that contains a footnote inside it. This is not allowed, sorry. The footnote content is "${current_footnote_content}"`;
		}
		var current_footnote_entry = document.createElement('div');
		current_footnote_entry.setAttribute('class', 'footnote_entry');
		footnotes_list.appendChild(current_footnote_entry);
		current_footnote_entry.setAttribute('id', current_footnote_id + '_list_element');
		elements_for_cross_references[current_footnote_entry.id] = {};
		elements_for_cross_references[current_footnote_entry.id]['display_text'] = `<sup>[${i+1}]</sup>`;
		footnotes[i].setAttribute('id', current_footnote_id);
		footnotes[i].innerHTML = '<crossref toid="' + current_footnote_entry.id + '"></crossref>';
		var current_footnote_number_element = document.createElement('div');
		current_footnote_number_element.setAttribute('class', 'footnote_number_element__');
		current_footnote_number_element.innerHTML = `<a href=#${footnotes[i].id} class="footnote_key_link">` + elements_for_cross_references[current_footnote_entry.id]['display_text'] + '</a> ';
		current_footnote_entry.appendChild(current_footnote_number_element);
		var current_footnote_text_element = document.createElement('div');
		current_footnote_text_element.setAttribute('class', 'footnote_text_element__');
		current_footnote_text_element.innerHTML = current_footnote_content;
		current_footnote_entry.appendChild(current_footnote_text_element);
		elements_for_cross_references[current_footnote_entry.id]['popup_text'] = current_footnote_content;
	}
	document.getElementById("footnotes_list").appendChild(footnotes_list);
}
// Parse <reference> tags ----------------------------------------------
var references = document.getElementsByTagName('reference');
if (references.length > 0) {
	var references_list = document.getElementById('references_list');
	if (references_list == null) {
		throw `ERROR: Please create an element with tag <div> and id "references_list" where you want the references list to be displayed. For example <div id="references_list"></div>.`;
	}
	var cited_references_in_this_order = [];
	var crossref_elements = document.getElementsByTagName("crossref");
	for (i=0; i<crossref_elements.length; i++) {
		const ref_to_this_id = crossref_elements[i].getAttribute('toid');
		if (document.getElementById(ref_to_this_id) == null)
			continue; // This error will be reported later on when the <crossref> tags are parsed.
		if (document.getElementById(ref_to_this_id).tagName.toLowerCase() == 'reference' && !(cited_references_in_this_order.indexOf(ref_to_this_id)>-1))
			cited_references_in_this_order.push(ref_to_this_id);
	}
	for (var i=0; i<cited_references_in_this_order.length; i++) {
		var current_id = cited_references_in_this_order[i];
		var current_reference_element = document.getElementById(current_id);
		if (current_reference_element == null)
			continue; // This error will be reported later on when the <crossref> tags are parsed.
		elements_for_cross_references[current_id] = {};
		elements_for_cross_references[current_id]['display_text'] = `[${i+1}]`;
		elements_for_cross_references[current_id]['popup_text'] = current_reference_element.innerHTML;
		var reference_number_element = document.createElement('div');
		reference_number_element.setAttribute('class', 'reference_number_element__');
		reference_number_element.innerHTML = elements_for_cross_references[current_id]['display_text'];
		var reference_text_element = document.createElement('div');
		reference_text_element.setAttribute('class', 'reference_text_element__');
		reference_text_element.innerHTML = current_reference_element.innerHTML;
		current_reference_element.innerHTML = '';
		current_reference_element.appendChild(reference_number_element);
		current_reference_element.appendChild(reference_text_element);
		references_list.appendChild(current_reference_element);
	}
	for (var i=0; i<references.length; i++) {
		if (cited_references_in_this_order.indexOf(references[i].id) < 0) { // if references[i].id not in cited_references_in_this_order:
			references[i].remove();
			i -= 1;
		}
	}
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
for(var i = 0; i < crossref.length; i++) {
	var ref_to_this_id = crossref[i].getAttribute('toid');
	var reference_str;
	if (ref_to_this_id in elements_for_cross_references) {
		reference_str = `<a class="cross-reference-link" href="#${ref_to_this_id}">${elements_for_cross_references[ref_to_this_id]["display_text"]}</a>`;
		if ('popup_text' in elements_for_cross_references[ref_to_this_id]) {
			var popup_text = elements_for_cross_references[ref_to_this_id]['popup_text'];
			// If the popup text contains <crossref> elements, we want to hardcode the reference text. We don't want an infinite loop of popup messages to be displayed. This is what I do next:
			var element = document.createElement('div');
			element.innerHTML = popup_text;
			var crossrefs_within_this_popup = element.getElementsByTagName('crossref');
			const n_crossrefs_to_override = crossrefs_within_this_popup.length;
			for (var k=n_crossrefs_to_override-1; k>=0; k--) {
				var div_to_replace_the_crossref = document.createElement('invisible_tag');
				div_to_replace_the_crossref.innerHTML = elements_for_cross_references[crossrefs_within_this_popup[k].innerHTML]['display_text'];
				element.replaceChild(div_to_replace_the_crossref, crossrefs_within_this_popup[k]);
			}
			popup_text = element.innerHTML;
			if (popup_text.includes('<footnote>')) {
				// Let's give a nice format to footnotes within in popups.
				popup_text = popup_text.replaceAll('<footnote>','<sup>[').replaceAll('</footnote>',']</sup>');
			}
			if (popup_text.includes('<siglas>')) // If there are siglas we also need to leave only the short name, not the object itself.
				popup_text = popup_text.replaceAll('<siglas>','').replaceAll('</siglas>','');
			reference_str = `<span class="popup_cross_reference" onMouseOver="javascript:this.className='popup_cross_reference_hover'" onMouseOut="javascript:this.className='popup_cross_reference'">` + reference_str + `<span>${popup_text}</span></span>`;
		}
	} else {
		crossref[i].innerHTML = crossref[i].innerHTML + ERROR_IS_HERE_STR;
		crossref[i].scrollIntoView();
		throw `ERROR: You are trying to do a <crossref> to the id "${ref_to_this_id}" was not defined anywhere. Look for it in your HTML code and fix this problem.`;
	}
	crossref[i].innerHTML = reference_str;
}
// Siglas --------------------------------------------------------------
var siglas_np = {
	// This is just a namespace for constant definitions.
	display_error: function(msg) {
		return '<span style="color:red;font-size:140%;font-weight: bold;background-color: yellow;">' + '← ERROR IS HERE. ' + msg + '</span>';
	}
};

var siglas_definitions = {};
var sigla_was_already_used = {};
const siglas = document.getElementsByTagName('siglas')
for (i=0; i<siglas.length; i++) { // First parse all the definitions into a dictionary.
	if (siglas[i].className == 'definition') {
		siglas_definitions[siglas[i].getAttribute('short')] = siglas[i];
		sigla_was_already_used[siglas[i].getAttribute('short')] = false;
	}
}

for (i=0; i<siglas.length; i++) { // Now start processing each usage of each sigla.
	if (siglas[i].className == 'definition')
		continue;
	if (! (siglas[i].innerHTML in siglas_definitions)) {
		siglas[i].innerHTML = siglas[i].innerHTML + siglas_np.display_error(`The &lt;siglas> called "${siglas[i].innerHTML}" was not defined anywhere. If you use "&lt;siglas>${siglas[i].innerHTML}&lt;/siglas>" you must somewhere define "&lt;siglas class="definition" short="${siglas[i].innerHTML}" first="whatever">&lt;/siglas>".`);
		siglas[i].scrollIntoView();
		throw `ERROR: You inserted a <siglas>whatever</siglas> without a <siglas class="definition" short="whatever" first="first usage of whatever"></siglas>, this is not allowed because I don't know what to do with your siglas.`;
	}
	if (sigla_was_already_used[siglas[i].innerHTML] == false) {
		sigla_was_already_used[siglas[i].innerHTML] = true;
		siglas[i].innerHTML = siglas_definitions[siglas[i].innerHTML].getAttribute('first');
	} else {
		siglas[i].innerHTML = `<span class="popup_cross_reference" onMouseOver="javascript:this.className='popup_cross_reference_hover'" onMouseOut="javascript:this.className='popup_cross_reference'">` + siglas_definitions[siglas[i].innerHTML].getAttribute('short') + `<span>` + siglas_definitions[siglas[i].innerHTML].getAttribute('first') + `</span></span>`;
	}
	
}
