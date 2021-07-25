import AcademicHTML as A
import TexSoup

PARAGRAPH_ENDS_STRING = '\n\n'

def translate_inlinemath(latex_node):
	return str(latex_node.expr)

def translate_displaymath(latex_node):
	"""Given a "latex_node" from TexSoup with a "displaymath" object, it 
	translates this into an <equation> tag for AcademicHTML."""
	if not latex_node.name in {'displaymath', 'equation'}:
		raise ValueError(f'`latex_node.name` must be "displaymath", received `latex_node.name={latex_node.name}`.')
	if latex_node.name == 'displaymath': # This is just a displayed equation.
		return str(latex_node.expr)
	elif latex_node.name == 'equation': # This one is more complicated, it has an ID for reference and must be numbered.
		latex_string = ''.join([str(s) for s in latex_node.contents if r'\label' not in str(s)])
		for stuff in latex_node.contents:
			if isinstance(stuff, TexSoup.data.TexNode) and 'label' in stuff.name:
				id = str(stuff.string)
		return A.equation(latex_string, id)
	else:
		raise ValueError(f'Dont know how to translate an equation of type {latex_node.name}.')

def parse_thebibliography(latex_node):
	references_dict = {}
	current_bibitem_idx = 0
	while current_bibitem_idx < len(latex_node.contents):
		while current_bibitem_idx < len(latex_node.contents): # Look for the next bibitem object ---
			if isinstance(latex_node.contents[current_bibitem_idx], TexSoup.data.TexNode) and latex_node.contents[current_bibitem_idx].name == 'bibitem':
				break
			current_bibitem_idx += 1
		thisreference_content = A.new_tag('unwrap_me')
		i = 1
		while current_bibitem_idx+i < len(latex_node.contents): # Look for all the non bibitem objects ---
			if isinstance(latex_node.contents[current_bibitem_idx+i], TexSoup.data.TexNode) and latex_node.contents[current_bibitem_idx+i].name == 'bibitem':
				break
			thisreference_content.append(str(latex_node.contents[current_bibitem_idx+i]))
			i += 1
		if current_bibitem_idx < len(latex_node.contents):
			references_dict[str(latex_node.contents[current_bibitem_idx].string)] = thisreference_content
		current_bibitem_idx += 1
	return references_dict

def translate_cite(latex_node):
	return A.crossref(toid=str(latex_node.string))

def translate_ref(latex_node):
	return A.crossref(toid=str(latex_node.string))

def translate_contents(latex_node, main_call = False):
	TRANSLATORS = {
		'$': translate_inlinemath,
		'displaymath': translate_displaymath,
		'equation': translate_displaymath,
		'cite': translate_cite,
		'ref': translate_ref,
	}
	html_node = A.new_tag('translated_from_latex')
	for content in latex_node.contents:
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
				p = html_soup.new_tag('p')
			if isinstance(content, str):
				# In this case we are receiving a "chunk of paragraphs". It may be a bunch of sentences for the current paragraph, or it can be even a bunch of whole paragraphs that have only text.
				append_last_paragraph_chunk_to_html_document = False
				if content.endswith(PARAGRAPH_ENDS_STRING):
					append_last_paragraph_chunk_to_html_document = True
					content = content[:-len(PARAGRAPH_ENDS_STRING)]
				n_chunks = len(content.split(PARAGRAPH_ENDS_STRING))
				for n_chunk, paragraph_chunk in enumerate(content.split(PARAGRAPH_ENDS_STRING)):
					p.append(paragraph_chunk)
					if n_chunk < n_chunks-1 or append_last_paragraph_chunk_to_html_document == True:
						html_node.append(p)
						p = html_soup.new_tag('p')
			else: # Manually have to decide what to do with each type of element.
				if content.name in TRANSLATORS:
					p.append(TRANSLATORS[content.name](content))
				elif content.name in {'thebibliography'}:
					continue
				else:
					continue
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

	with open(Path(args.latex_path), 'r') as ifile:
		latex_soup = TexSoup.TexSoup(ifile.read())
	html_soup = A.AcademicHTML(
		title = 'Test document',
		path_to_template = 'template.html'
	)
	html_document = html_soup.body

	for content in latex_soup.document.contents:
		print('-----------------------')
		if isinstance(content, TexSoup.data.TexNode):
			print(content.name)
		elif isinstance(content, str): # This means we have a string of text.
			print(repr(content))
		else:
			raise RuntimeError('Dont know this type of content...')
	print('##############################################################')

	html_soup.body.append(translate_contents(latex_soup.document))

	for thebibliography in latex_soup.find_all('thebibliography'):
		references_dict = parse_thebibliography(thebibliography)
		for key, content in references_dict.items():
			html_soup.add_reference_item(
				id = key,
				content = content,
			)
	
	for tag in html_soup.find_all('translated_from_latex'):
		tag.unwrap()

	html_soup.write_to_file(Path('/'.join(Path(args.latex_path).parts[:-1]))/Path('test.html'))
