const ERROR_IS_HERE_STR = ' <b>← ERROR is here</b>';

document.getElementById("document_title").innerHTML = document.title;

// Parse <figure> tags -------------------------------------------------
var figures = document.getElementById("document-content").getElementsByTagName("figure");
var figures_reference_texts = {}
for(var i = 0; i < figures.length; i++) {
	var caption = figures[i].getElementsByTagName("figcaption")[0];
	caption.innerHTML = `<b>Figure ${i+1}. </b>` + caption.innerHTML;
	figures_reference_texts[figures[i].id] = `${i+1}`; // This text will be placed where there is a reference to this figure.
}
delete figures_reference_texts['']; // Remove elements that may have appeared with no id defined.
// Parse <equation> tags -----------------------------------------------
var equations = document.getElementById("document-content").getElementsByTagName("equation");
var equations_reference_texts = {};
for(var i = 0; i < equations.length; i++) {
	equations_reference_texts[equations[i].id] = `(${i+1})`; // This text will be placed where there is a reference to this equation.
	const equation_container = document.createElement('div');
	equation_container.className = "equation";
	equations[i].parentNode.insertBefore(equation_container, equations[i]);
	equation_container.appendChild(equations[i])
	const equation_number = document.createElement('div');
	equation_number.className = "equation__number";
	equation_number.innerHTML = `${"&nbsp;".repeat(5)}${equations_reference_texts[equations[i].id]}`;
	equation_container.appendChild(equation_number);
	equations[i].className = "equation__content";
}
delete equations_reference_texts['']; // Remove elements that may have appeared with no id defined.
// Parse <h_> tags -----------------------------------------------------
function get_all_numbered_h(document) {
	var arr = [];
	if (!document) return arr;
	var all_el = document.getElementsByTagName('*');
	for (var i = 0, n = all_el.length; i < n; i++) {
		if (/^h\d{1}$/gi.test(all_el[i].nodeName) && all_el[i].className!='unnumbered') {
			arr.push(all_el[i]);
		}
	}
	return arr;
}
var numbered_headings = get_all_numbered_h(document);
var headings_reference_texts = {};
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
	numbered_headings[i].id = current_id; // If the heading had no id, this will set it. Otherwise it does nothing.
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
				elm = li.appendChild(document.createElement("ol"));
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

var all = document.getElementById("document-content").getElementsByTagName("*");
var nodes = [];
for(var i = all.length; i--; nodes.unshift(all[i]));
var result = document.createElement("ol");
result.setAttribute("id", "table-of-contents-ol");
buildRec(nodes, result, 1);
document.getElementById("table-of-contents").appendChild(result);
// Parse <crossref> tags -----------------------------------------------
var crossref = document.getElementById("document-content").getElementsByTagName("crossref");
const texts_for_cross_references_by_id = Object.assign({}, figures_reference_texts, equations_reference_texts, headings_reference_texts); // This is a dictionary of the form dict[id] = "text_to_be_shown_in_the_reference".
for(var i = 0; i < crossref.length; i++) {
	var ref_to_this_id = crossref[i].innerHTML;
	if (ref_to_this_id in texts_for_cross_references_by_id) {
		crossref[i].innerHTML = `<a class="cross-reference-link" href="#${ref_to_this_id}">${texts_for_cross_references_by_id[ref_to_this_id]}</a>`;
	} else {
		crossref[i].innerHTML = crossref[i].innerHTML + ERROR_IS_HERE_STR;
		crossref[i].scrollIntoView();
		throw `ERROR: You are trying to do a <crossref> to the id "${ref_to_this_id}" was not defined anywhere. Look for it in your HTML code and fix this problem.`;
	}
}
