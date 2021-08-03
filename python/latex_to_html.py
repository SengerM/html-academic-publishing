import AcademicHTML as A
import TexSoup
from pathlib import Path

PARAGRAPH_ENDS_STRING = '\n\n'

def check_node_type_rise_error_else(node, variable_name: str, expected_node_name: str):
	if not isinstance(node, TexSoup.data.TexNode) or node.name != expected_node_name:
		raise ValueError(f'<{variable_name}> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={expected_node_name}`')

def new_dummy_tag():
	return A.new_tag('dummy_tag')

def translate_inlinemath(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', '$')
	return str(latex_node.expr)

def translate_displaymath(latex_node):
	"""Given a "latex_node" from TexSoup with a "displaymath" object, it 
	translates this into an <equation> tag for AcademicHTML."""
	if not latex_node.name in {'displaymath', 'equation'}:
		raise ValueError(f'`latex_node.name` must be "displaymath", received `latex_node.name={latex_node.name}`.')
	if latex_node.name == 'displaymath': # This is just a displayed equation.
		return str(latex_node.expr)
	elif latex_node.name == 'equation': # This one is more complicated, it has an ID for reference and must be numbered.
		id = None
		latex_string = ''.join([str(s) for s in latex_node.contents if r'\label' not in str(s)])
		for stuff in latex_node.contents:
			if isinstance(stuff, TexSoup.data.TexNode) and 'label' in stuff.name:
				id = str(stuff.string)
		return A.equation(latex_string, id)
	else:
		raise ValueError(f'Dont know how to translate an equation of type {latex_node.name}.')

def parse_thebibliography(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'thebibliography')
	references_dict = {}
	current_bibitem_idx = 0
	while current_bibitem_idx < len(latex_node.contents):
		while current_bibitem_idx < len(latex_node.contents): # Look for the next bibitem object ---
			if isinstance(latex_node.contents[current_bibitem_idx], TexSoup.data.TexNode) and latex_node.contents[current_bibitem_idx].name == 'bibitem':
				break
			current_bibitem_idx += 1
		thisreference_content = new_dummy_tag()
		i = 1
		while current_bibitem_idx+i < len(latex_node.contents): # Look for all the non bibitem objects ---
			if isinstance(latex_node.contents[current_bibitem_idx+i], TexSoup.data.TexNode) and latex_node.contents[current_bibitem_idx+i].name == 'bibitem':
				break
			thisreference_content.append(translate_node(latex_node.contents[current_bibitem_idx+i]))
			i += 1
		if current_bibitem_idx < len(latex_node.contents):
			references_dict[str(latex_node.contents[current_bibitem_idx].string).replace(' ','')] = thisreference_content
		current_bibitem_idx += 1
	return references_dict

def translate_cite(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'cite')
	# As the cite may contain many citations all together, we have to create one <crossref> for each:
	wrapper_tag = new_dummy_tag()
	for cite in latex_node[0].split(','):
		wrapper_tag.append(A.crossref(toid=str(cite).replace(' ','')))
		wrapper_tag.append('\xa0')
	return wrapper_tag

def translate_ref(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'ref')
	return A.crossref(toid=str(latex_node.string))

def translate_url(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'url')
	tag = A.new_tag('a')
	tag['href'] = str(latex_node.string)
	tag.string = str(latex_node.string)
	return tag

def translate_string(latex_string):
	return str(latex_string).replace('~',u'\xa0').replace(r'\&','&').replace('``','"').replace("''",'"')

def translate_figure(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'figure')
	float_content_tag = A.new_tag('div')
	float_content_tag['style'] = 'display: flex; width: 100%;'
	for tag in latex_node.find_all('htmltag'):
		args_dict = {}
		for arg in tag.args:
			args_dict[arg.string.split('=',1)[0]] = arg.string.split('=',1)[1].replace(r'\%','%')
		tag_name = args_dict['tag_name']
		args_dict.pop('tag_name')
		float_content_tag.append(
			A.new_tag(
				tag_name,
				**args_dict,
			)
		)
	caption_tag = new_dummy_tag()
	for caption_content in  latex_node.caption.contents:
		if isinstance(caption_content, TexSoup.data.TexNode) and caption_content.name == 'label':
			# The label is processed independently from the rest of the stuff.
			continue
		caption_tag.append(translate_node(caption_content))
	try:
		id = str(latex_node.caption.label.string)
	except:
		try:
			id = str(latex_node.label.string)
		except:
			id = None
	return A.new_float(
		float_class = 'Figure',
		content = float_content_tag,
		caption = caption_tag,
		id = id,
	)

def translate_item(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'item')
	tag = A.new_tag('li')
	for i in latex_node.contents:
		tag.append(translate_node(i))
	return tag

def translate_itemize(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'itemize')
	html_tag = A.new_tag('ul')
	for item_node in latex_node.contents:
		html_tag.append(translate_node(item_node))
	return html_tag

def translate_enumerate(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'enumerate')
	html_tag = A.new_tag('ol')
	for item_node in latex_node.contents:
		html_tag.append(translate_node(item_node))
	return html_tag

def translate_footnote(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'footnote')
	dummy_tag = new_dummy_tag()
	for content in latex_node.contents:
		dummy_tag.append(translate_node(content))
	return A.footnote(dummy_tag)

def translate_emph(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'emph')
	em_tag = A.new_tag('em')
	for content in latex_node:
		em_tag.append(translate_node(content))
	return em_tag

def translate_href(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'href')
	a = A.new_tag('a', href=latex_node.args[0].string)
	a.append(latex_node.args[1].string)
	return a

def translate_textbackslash(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'textbackslash')
	return '\\'

def translate_author(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'author')
	return A.author(author_name = latex_node.string)

def translate_tableofcontents(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'tableofcontents')
	div = A.new_tag('div')
	div['id'] = 'table-of-contents'
	div.append(A.section(
		name = 'Table of contents',
		level = 2,
		unnumbered = True,
	))
	return div

def translate_section_of_any_kind(latex_node):
	return A.section(
		name = latex_node.contents[0], 
		level = latex_node.name.count('sub')+1, 
		unnumbered = True if '*' in latex_node.name else False,
	)

def translate_textquotedblleft_and_textquotedblright(latex_node):
	return '"'

def translate_BraceGroup(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'BraceGroup')
	return str(latex_node.contents[0])

def translate_def(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'def')
	# Only support for equations as I use in macros.
	translated = fr'\def\{latex_node.contents[-1]}' 
	for idx, content in enumerate(latex_node.parent.contents):
		if repr(latex_node) == repr(content):
			index_in_parent = idx
			break
	extend_parsing_idx = 0
	while not isinstance(latex_node.parent.contents[index_in_parent+1+extend_parsing_idx], TexSoup.data.TexNode) or not latex_node.parent.contents[index_in_parent+1+extend_parsing_idx].name == 'BraceGroup':
		extend_parsing_idx += 1
		translated += str(latex_node.parent.contents[index_in_parent+extend_parsing_idx])
	translated += repr(latex_node.parent.contents[index_in_parent+extend_parsing_idx+1])
	return '$' + translated + '$'

def translate_alignstar(latex_node):
	check_node_type_rise_error_else(latex_node, 'latex_node', 'align*')
	return '$$' + repr(latex_node) + '$$'

def translate_abstract(latex_node):
	abstract_tag = A.new_tag('abstract')
	abstract_paragraph = A.new_tag('div') # For the moment a single paragraph is accepted. To implement multiple paragraphs something similar to "translate_document" has to be done.
	for node in latex_node.contents:
		abstract_paragraph.append(translate_node(node))
	abstract_tag.append(abstract_paragraph)
	return abstract_tag

def translate_CommentBox(latex_node):
	box_tag = A.new_tag('div')
	box_tag['class'] = 'CommentBox'
	content_tag = A.new_tag('div')
	content_tag['class'] = 'CommentBoxBody'
	for idx, node in enumerate(latex_node.contents):
		if idx == 0: # This is the title.
			box_title_tag = A.new_tag('div')
			box_title_tag['class'] = 'CommentBoxTitle'
			box_title_tag.append(translate_node(node))
			box_tag.append(box_title_tag)
			continue
		
		if isinstance(node, TexSoup.data.TexNode) and ('section' in node.name):
			# First must finish paragraph.
			if 'p' in locals():
				content_tag.append(p)
				del(p)
			# Now we add whatever we received.
			if node.name == 'section':
				content_tag.append(translate_section_of_any_kind(node))
				continue
			elif node.name == 'tableofnodes':
				content_tag.append(translate_tableofnodes(node))
				continue
		else: # Whatever is not a section, goes inside a paragraph.
			if 'p' not in locals(): # This would happen if we just appended a paragraph.
				p = A.new_tag('div')
				p['style'] = 'margin-top: 10px; margin-bottom: 10px;'
			if isinstance(node, str):
				# In this case we are receiving a "chunk of paragraphs". It may be a bunch of sentences for the current paragraph, or it can be even a bunch of whole paragraphs that have only text.
				append_last_paragraph_chunk_to_html_document = False
				if node.endswith(PARAGRAPH_ENDS_STRING):
					append_last_paragraph_chunk_to_html_document = True
					node = node[:-len(PARAGRAPH_ENDS_STRING)]
				n_chunks = len(node.split(PARAGRAPH_ENDS_STRING))
				for n_chunk, paragraph_chunk in enumerate(node.split(PARAGRAPH_ENDS_STRING)):
					p.append(translate_string(paragraph_chunk))
					if n_chunk < n_chunks-1 or append_last_paragraph_chunk_to_html_document == True:
						content_tag.append(p)
						p = A.new_tag('div')
			else:
				if node.name in {'thebibliography', 'maketitle', 'input', 'title'}:
					continue
				else:
					# Delegate the task...
					p.append(translate_node(node))
		
	box_tag.append(content_tag)
	
		
	
	return box_tag

def translate_node(latex_node):
	TRANSLATORS = {
		'$': translate_inlinemath,
		'displaymath': translate_displaymath,
		'equation': translate_displaymath,
		'cite': translate_cite,
		'ref': translate_ref,
		'url': translate_url,
		'figure': translate_figure,
		'itemize': translate_itemize,
		'enumerate': translate_enumerate,
		'item': translate_item,
		'footnote': translate_footnote,
		'emph': translate_emph,
		'href': translate_href,
		'textbackslash': translate_textbackslash,
		'author': translate_author,
		'textquotedblleft': translate_textquotedblleft_and_textquotedblright,
		'textquotedblright': translate_textquotedblleft_and_textquotedblright,
		'BraceGroup': translate_BraceGroup,
		'def': translate_def,
		'align*': translate_alignstar,
		'abstract': translate_abstract,
		'CommentBox': translate_CommentBox,
	}
	html_node = new_dummy_tag()
	if isinstance(latex_node, str): # This means that we received one of this annoying "only text" nodes that are of type string.
		html_node.append(translate_string(latex_node))
	else: # `latex_node` is a node indeed...
		if latex_node.name in TRANSLATORS:
			html_node.append(TRANSLATORS[latex_node.name](latex_node))
		else:
			print(f'Dont know how to translate "{latex_node.name}".')
			if latex_node.name in {'global', 'long'}:
				return ''
			tag = A.new_tag('b')
			tag.append(f'ERROR: Did not know how to translate "{latex_node.name}" from Latex to HTML, just letting you know.')
			html_node.append(tag)
	return html_node

def translate_document(latex_document):
	if not isinstance(latex_document, TexSoup.data.TexNode) or not latex_document.name=='document':
		raise ValueError(f'<latex_document> must be the "document" node parsed by TexSoup.')
	html_node = new_dummy_tag()
	for content in latex_document.contents:
		if isinstance(content, TexSoup.data.TexNode) and ('section' in content.name or content.name == 'tableofcontents'):
			# First must finish paragraph.
			if 'p' in locals():
				html_node.append(p)
				del(p)
			# Now we add whatever we received.
			if content.name == 'section':
				html_node.append(translate_section_of_any_kind(content))
				continue
			elif content.name == 'tableofcontents':
				html_node.append(translate_tableofcontents(content))
				continue
		else: # Whatever is not a section, goes inside a paragraph.
			if 'p' not in locals(): # This would happen if we just appended a paragraph.
				p = A.new_tag('div')
				p['style'] = 'margin-top: 10px; margin-bottom: 10px;' # This is a workaround instead of using <p> (because <p> is limited in what it can contain).
			if isinstance(content, str):
				# In this case we are receiving a "chunk of paragraphs". It may be a bunch of sentences for the current paragraph, or it can be even a bunch of whole paragraphs that have only text.
				append_last_paragraph_chunk_to_html_document = False
				if content.endswith(PARAGRAPH_ENDS_STRING):
					append_last_paragraph_chunk_to_html_document = True
					content = content[:-len(PARAGRAPH_ENDS_STRING)]
				n_chunks = len(content.split(PARAGRAPH_ENDS_STRING))
				for n_chunk, paragraph_chunk in enumerate(content.split(PARAGRAPH_ENDS_STRING)):
					p.append(translate_string(paragraph_chunk))
					if n_chunk < n_chunks-1 or append_last_paragraph_chunk_to_html_document == True:
						html_node.append(p)
						p = A.new_tag('div')
			else:
				if content.name in {'thebibliography', 'maketitle', 'input', 'title'}:
					continue
				else:
					# Delegate the task...
					p.append(translate_node(content))
	if 'p' in locals():
		html_node.append(p)
		del(p)
	return html_node

def script_core(latex_file: str):
	ifile_path = Path(latex_file)
	
	try:
		with open(ifile_path, 'r') as ifile:
			latex_soup = TexSoup.TexSoup(ifile.read())
	except UnicodeDecodeError:
		with open(ifile_path, 'r', encoding="ISO-8859-1") as ifile:
			latex_soup = TexSoup.TexSoup(ifile.read())
	
	html_soup = A.AcademicHTML(
		title = 'Test document',
		path_to_template = 'template.html'
	)
	
	html_soup.head.title.string = latex_soup.title.string

	html_soup.body.append(translate_document(latex_soup.document))
	
	for thebibliography in latex_soup.find_all('thebibliography'):
		references_dict = parse_thebibliography(thebibliography)
		for key, content in references_dict.items():
			html_soup.add_reference_item(
				id = key,
				content = content,
			)
	
	for tag in html_soup.find_all(new_dummy_tag().name):
		tag.unwrap()

	html_soup.write_to_file(ifile_path.with_suffix('.html'))


if __name__ == '__main__':
	import argparse
	
	parser = argparse.ArgumentParser(description='Converts a Latex document into an AcademicHTML document.')
	parser.add_argument(
		'--latex-document',
		metavar = 'path', 
		help = 'Path to the Latex document to be converted.',
		required = True,
		dest = 'latex_path',
		type = str,
	)
	args = parser.parse_args()
	
	script_core(args.latex_path)
