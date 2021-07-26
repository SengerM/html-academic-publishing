import AcademicHTML as A
import TexSoup

PARAGRAPH_ENDS_STRING = '\n\n'

def new_dummy_tag():
	return A.new_tag('dummy_tag')

def translate_inlinemath(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == '$':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"$"}`')
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
	if not isinstance(latex_node, TexSoup.data.TexNode) or not latex_node.name == 'thebibliography':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"thebibliography"}`')
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
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'cite':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"cite"}`')
	# As the cite may contain many citations all together, we have to create one <crossref> for each:
	wrapper_tag = new_dummy_tag()
	for cite in latex_node[0].split(','):
		wrapper_tag.append(A.crossref(toid=str(cite).replace(' ','')))
		wrapper_tag.append('\xa0')
	return wrapper_tag

def translate_ref(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'ref':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"ref"}`')
	return A.crossref(toid=str(latex_node.string))

def translate_url(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'url':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"url"}`')
	tag = A.new_tag('a')
	tag['href'] = str(latex_node.string)
	tag.string = str(latex_node.string)
	return tag

def translate_string(latex_string):
	return str(latex_string).replace('~',u'\xa0').replace(r'\&','&')

def translate_figure(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'figure':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"figure"}`')
	image_tag = A.new_tag(
		'image', 
		src = latex_node.includegraphics.contents[-1], # Hopefully this is the path to the image file.
		style = 'max-width: 100%;',
	)
	caption_tag = new_dummy_tag()
	for caption_content in  latex_node.caption.contents:
		if isinstance(caption_content, TexSoup.data.TexNode) and caption_content.name == 'label':
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
		content = image_tag,
		caption = caption_tag,
		id = id,
	)

def translate_item(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'item':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"item"}`')
	tag = A.new_tag('li')
	for i in latex_node.contents:
		tag.append(translate_node(i))
	return tag

def translate_itemize(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'itemize':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"itemize"}`')
	html_tag = A.new_tag('ul')
	for item_node in latex_node.contents:
		html_tag.append(translate_node(item_node))
	return html_tag

def translate_enumerate(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'enumerate':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"enumerate"}`')
	html_tag = A.new_tag('ol')
	for item_node in latex_node.contents:
		html_tag.append(translate_node(item_node))
	return html_tag

def translate_footnote(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'footnote':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"footnote"}`')
	dummy_tag = new_dummy_tag()
	for content in latex_node.contents:
		dummy_tag.append(translate_node(content))
	return A.footnote(dummy_tag)

def translate_emph(latex_node):
	if not isinstance(latex_node, TexSoup.data.TexNode) and latex_node.name == 'emph':
		raise ValueError(f'<latex_node> must be an instance of {TexSoup.data.TexNode} and have `latex_node.name=={"emph"}`')
	em_tag = A.new_tag('em')
	for content in latex_node:
		em_tag.append(translate_node(content))
	return em_tag

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
	}
	html_node = new_dummy_tag()
	if isinstance(latex_node, str): # This means that we received one of this annoying "only text" nodes that are of type string.
		html_node.append(translate_string(latex_node))
	else: # `latex_node` is a node indeed...
		if latex_node.name in TRANSLATORS:
			html_node.append(TRANSLATORS[latex_node.name](latex_node))
		else:
			print(f'Dont know how to translate "{latex_node.name}".')
			tag = A.new_tag('b')
			tag.append(f'ERROR: Did not know how to translate "{latex_node.name}" from Latex to HTML, just letting you know.')
			html_node.append(tag)
	return html_node

def translate_document(latex_document):
	if not isinstance(latex_document, TexSoup.data.TexNode) or not latex_document.name=='document':
		raise ValueError(f'<latex_document> must be the "document" node parsed by TexSoup.')
	html_node = new_dummy_tag()
	for content in latex_document.contents:
		if isinstance(content, TexSoup.data.TexNode) and 'section' in content.name:
			# First must finish paragraph.
			if 'p' in locals():
				html_node.append(p)
				del(p)
			html_node.append(
				A.section(
					name = content.contents[0], 
					level = content.name.count('sub')+1, 
					unnumbered = True if '*' in content.name else False,
				)
			)
			continue
		else: # Whatever is not a section, goes inside a paragraph.
			if 'p' not in locals(): # This would happen if we just appended a paragraph.
				p = A.new_tag('div')
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
				if content.name in {'thebibliography'}:
					continue
				else:
					# Delegate the task...
					p.append(translate_node(content))
	if 'p' in locals():
		html_node.append(p)
		del(p)
	return html_node

if __name__ == '__main__':
	import argparse
	from pathlib import Path
	
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
	
	ifile_path = Path(args.latex_path)

	with open(ifile_path, 'r') as ifile:
		latex_soup = TexSoup.TexSoup(ifile.read())
	html_soup = A.AcademicHTML(
		title = 'Test document',
		path_to_template = 'template.html'
	)

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
