import AcademicHTML as A
import argparse
import TexSoup
from pathlib import Path

PARAGRAPH_ENDS_STRING = '\n\n'

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

def translate_inlinemath(content):
	return str(content.expr)

def translate_displaymath(content):
	"""Given a "content" from TexSoup with a "displaymath" object, it 
	translates this into an <equation> tag for AcademicHTML."""
	if not content.name in {'displaymath', 'equation'}:
		raise ValueError(f'`content.name` must be "displaymath", received `content.name={content.name}`.')
	if content.name == 'displaymath': # This is just a displayed equation.
		return str(content.expr)
	elif content.name == 'equation': # This one is more complicated, it has an ID for reference and must be numbered.
		latex_string = ''.join([str(s) for s in content.contents if r'\label' not in str(s)])
		for stuff in content.contents:
			if isinstance(stuff, TexSoup.data.TexNode) and 'label' in stuff.name:
				id = str(stuff.string)
		return A.equation(latex_string, id)
	else:
		raise ValueError(f'Dont know how to translate an equation of type {content.name}.')
	# ~ return A.equation(str(content.expr))

def parse_thebibliography(content):
	references_dict = {}
	current_bibitem_idx = 0
	while current_bibitem_idx < len(content.contents):
		while current_bibitem_idx < len(content.contents): # Look for the next bibitem object ---
			if isinstance(content.contents[current_bibitem_idx], TexSoup.data.TexNode) and content.contents[current_bibitem_idx].name == 'bibitem':
				break
			current_bibitem_idx += 1
		thisreference_content = A.new_tag('unwrap_me')
		i = 1
		while current_bibitem_idx+i < len(content.contents): # Look for all the non bibitem objects ---
			if isinstance(content.contents[current_bibitem_idx+i], TexSoup.data.TexNode) and content.contents[current_bibitem_idx+i].name == 'bibitem':
				break
			thisreference_content.append(str(content.contents[current_bibitem_idx+i]))
			i += 1
		if current_bibitem_idx < len(content.contents):
			references_dict[str(content.contents[current_bibitem_idx].string)] = thisreference_content
		current_bibitem_idx += 1
	return references_dict

def translate_cite(content):
	return A.crossref(toid=str(content.string))

def translate_ref(content):
	return A.crossref(toid=str(content.string))

TRANSLATORS = {
	'$': translate_inlinemath,
	'displaymath': translate_displaymath,
	'equation': translate_displaymath,
	'cite': translate_cite,
	'ref': translate_ref,
}

for content in latex_soup.document.contents:
	if isinstance(content, TexSoup.data.TexNode) and 'section' in content.name:
		# First must finish paragraph.
		if 'p' in locals():
			html_document.append(p)
			del(p)
		html_document.append(
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
					html_document.append(p)
					p = html_soup.new_tag('p')
		else: # Manually have to decide what to do with each type of element.
			if content.name in TRANSLATORS:
				p.append(TRANSLATORS[content.name](content))
			elif content.name in {'thebibliography'}:
				continue
			else:
				print(f'Skipping "{content.name}":')
				print(content)
if 'p' in locals():
	html_document.append(p)
	del(p)

for thebibliography in latex_soup.find_all('thebibliography'):
	references_dict = parse_thebibliography(thebibliography)
	for key, content in references_dict.items():
		html_soup.add_reference_item(
			id = key,
			content = content,
		)

html_soup.write_to_file(Path('/'.join(Path(args.latex_path).parts[:-1]))/Path('test.html'))
