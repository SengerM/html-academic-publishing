document.getElementById("document_title").innerHTML = document.title;

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
// Parse <crossref> tags -----------------------------------------------
var crossref = document.getElementById("document-content").getElementsByTagName("crossref");
const texts_for_cross_references_by_id = Object.assign({}, figures_reference_texts, equations_reference_texts); // This is a dictionary of the form dict[id] = "text_to_be_shown_in_the_reference".
for(var i = 0; i < crossref.length; i++) {
	var ref_to_this_id = crossref[i].innerHTML;
	if (ref_to_this_id in texts_for_cross_references_by_id) {
		crossref[i].innerHTML = `<a href="#${ref_to_this_id}">${texts_for_cross_references_by_id[ref_to_this_id]}</a>`;
	} else {
		crossref[i].innerHTML = `<b>ERROR: You are trying to do a &lt;crossref> to the id "${ref_to_this_id}" but it was not defined anywhere, please search for it in your HTML code and fix this</b>`;
		crossref[i].scrollIntoView();
		throw `ERROR: You are trying to do a <crossref> to the id "${ref_to_this_id}" was not defined anywhere. Look for it in your HTML code and fix this problem.`;
	}
}
