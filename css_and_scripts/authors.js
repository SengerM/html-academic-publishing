var authors = document.getElementsByTagName('author');
if (authors.length > 0) {
	var affiliations_list = new Set();
	for (var i=0; i<authors.length; i++) {
		var current_author_affiliations = authors[i].getAttribute('affiliation');
		if (current_author_affiliations == null)
			continue;
		current_author_affiliations = current_author_affiliations.split('|');
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
		var current_author_affiliations = authors[i].getAttribute('affiliation');
		if (current_author_affiliations == null)
			continue;
		current_author_affiliations = current_author_affiliations.split('|');
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
