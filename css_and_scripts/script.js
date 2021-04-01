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
var figures_ids = []
for(var i = 0; i < figures.length; i++) {
	var caption = figures[i].getElementsByTagName("figcaption")[0];
	caption.innerHTML = `<b>Figure ${i+1}. </b>` + caption.innerHTML;
	figures_ids.push(figures[i].id);
}
// Parse <crossref> tags -----------------------------------------------
var crossref = document.getElementById("document-content").getElementsByTagName("crossref");
for(var i = 0; i < crossref.length; i++) {
	var ref_to_this_id = crossref[i].innerHTML;
	if (figures_ids.includes(ref_to_this_id)) {
		crossref[i].innerHTML = `<a href="#${ref_to_this_id}">${figures_ids.indexOf(ref_to_this_id)+1}</a>`;
	} else {
		crossref[i].innerHTML = `<b>ERROR: You are trying to do a &lt;crossref> to the id "${ref_to_this_id}" but it was not defined anywhere, please search for it in your HTML code and fix this</b>`;
		throw `ERROR: You are trying to do a <crossref> to the id "${ref_to_this_id}" was not defined anywhere. Look for it in your HTML code and fix this problem.`;
	}
}
