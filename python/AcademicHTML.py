from bs4 import BeautifulSoup

def section(name: str, level: int, id=None, unnumbered=False):
	"""Creates a new tag with the correct structure for a section.
	Parameters:
	- name: str, is the name of the header.
	- level: int, 1 is section, 2 is subsection and so on.
	- id: str, optional, the id for referencing this section.
	- unnumbered: bool, default False.
	Returns:
	- The section tag."""
	VALID_LEVELS = {1,2,3,4,5,6}
	if level not in VALID_LEVELS:
		raise ValueError(f'<level> must be one of {VALID_LEVELS}, received {level}.')
	if not isinstance(name, str):
		raise TypeError(f'<name> must be a string, received object of type {type(name)}.')
	if id is not None and unnumbered == True:
		raise ValueError(f'<unnumbered> is True and <id> is not None, this is an error since you cannot reference unnumbered sections.')
	tag = BeautifulSoup(features='lxml').new_tag(f'h{level}')
	if id is not None:
		if not isinstance(id, str):
			raise TypeError(f'<id> must be a string, received object of type {type(id)}.')
		tag['id'] = id
	if unnumbered:
		tag['class'] = 'unnumbered'
	tag.string = name
	return tag

def equation(latex: str, id=None):
	"""Creates a numbered equation using the <equation> tag."""
	if not isinstance(latex, str):
		raise TypeError(f'<latex> must be a string containing the latex code for the equation, received object of type {type(latex)}.')
	tag = BeautifulSoup(features='lxml').new_tag('equation')
	if id is not None:
		if not isinstance(id, str):
			raise TypeError(f'<id> must be a string, received object of type {type(id)}.')
		tag['id'] = id
	if latex[:2] not in {'$$',r'\['}:
		latex = '$$' + latex
		latex += '$$'
	tag.string = latex
	return tag

def new_float(float_class: str, content, caption, id=None):
	"""Creates a float using the <float> tag. 
	Parameters:
	- float_class: A string specifying the type of float, e.g. "Figure".
	- content: Whatever you want to put in this float. It can be anythin
	accepted by the "append" method of BeautifulSoup (e.g. a string with
	the HTML code as well as a tag object).
	- caption: The caption. It can be anything accepted by the "append"
	method of BeautifulSoup (e.g. a string with the HTML as well as a 
	tag object).
	Returns:
	- The float tag.
	- """
	if not isinstance(float_class, str):
		raise TypeError(f'<float_class> must be a string, received object of type {type(float_class)}.')
	float_tag = BeautifulSoup(features='lxml').new_tag('float')
	float_tag['class'] = float_class
	float_tag.append(content)
	caption_tag = BeautifulSoup(features='lxml').new_tag('floatcaption')
	caption_tag.append(caption)
	float_tag.append(caption_tag)
	return float_tag

def crossref(toid: str):
	if not isinstance(toid, str):
		raise TypeError(f'<toid> must be a string, received object of type {type(toid)}.')
	return BeautifulSoup(features='lxml').new_tag('crossref', toid=toid)

def new_tag(*args, **kwargs):
	"""Just a wrapper."""
	return BeautifulSoup(features='lxml').new_tag(*args, **kwargs)

def footnote(content):
	"""Creates a footnote using the <footnote> tag.
	Parameters:
	- content: Whatever you want to place in the footnote. It can be a 
	string or a tag element.
	Returns:
	- The footnote tag."""
	tag = BeautifulSoup(features='lxml').new_tag('footnote')
	tag.append(content)
	return tag

class AcademicHTML(BeautifulSoup):
	def __init__(self, title: str, path_to_template: str):
		with open(path_to_template, 'r') as ifile:
			super().__init__(ifile.read(), 'html.parser')
		if not isinstance(title, str):
			raise TypeError(f'<title> must be a string, received object of type {type(title)}.')
		self.head.title.string = title
		self._reference_items = []
	
	def add_reference_item(self, content, id:str):
		"""Adds a bibliography item according to the specifications of AcademicHTML.
		Parameters:
		- content: Whatever you want to display in the bibliography entry. Any object 
		accepted by the method append of BeautifulSoup is fine, e.g. string
		or a tag object.
		Returns:
		- None"""
		if not isinstance(id, str):
			raise TypeError(f'<id> must be a string, received object of type {type(id)}.')
		item = self.new_tag('reference')
		item['id'] = id
		item.append(content)
		self._reference_items.append(item)
	
	def write_to_file(self, fname):
		# Add CSS ---
		css_to_append = {
			'https://sengerm.github.io/html-academic-publishing/css_and_scripts/style.css',
		}
		for src in css_to_append:
			tag = self.new_tag('link', rel='stylesheet', href=src)
			self.head.append(tag)
		# Add footnotes ---
		if len(self.find_all('footnote')) > 0: # There are footnotes, create the space to display footnotes.
			footnotes_div = self.new_tag('div')
			footnotes_div['id'] = 'footnotes_list'
			footnotes_div.append(section(name='Footnotes', level=1, unnumbered=True))
			self.body.append(footnotes_div)
		# Add references ---
		if len(self._reference_items) > 0:
			div = self.new_tag('div')
			div['id'] = 'references_list'
			div.append(section('References', level=1, unnumbered=True))
			for item in self._reference_items:
				div.append(item)
			self.body.append(div)
		# Add JS ---
		scripts_to_append = {
			'https://sengerm.github.io/html-academic-publishing/css_and_scripts/script.js',
			'https://sengerm.github.io/html-academic-publishing/css_and_scripts/authors.js',
		}
		for src in scripts_to_append:
			tag = self.new_tag('script', src=src)
			self.body.append(tag)
		for tag in self.find_all('unwrap_me'):
			tag.unwrap()
		# Write it to a file ---
		with open(fname, 'w') as file:
			file.write(str(self.prettify()))
	
if __name__ == '__main__':
	soup = AcademicHTML(
		title = 'Test document',
		path_to_template = 'template.html'
	)
	document = soup.body
	document.append(section('Introduction', level=1, id='Section: Introduction'))
	p = soup.new_tag('p')
	p.append('This is the first paragraph')
	p.append(footnote('This does not mean that it is the most important paragraph though.'))
	p.append(' and I am testing this Python script. I will now insert a reference to an external material: please see ')
	p.append(crossref('Reference: paper EPR'))
	reference = soup.new_tag('span')
	reference.append('Einstein, A., B. Podolsky, and N. Rosen. “Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?” Physical Review 47, no. 10 (May 15, 1935): 777–80. ')
	a = soup.new_tag('a', href='https://doi.org/10.1103/PhysRev.47.777')
	a.append('https://doi.org/10.1103/PhysRev.47.777')
	reference.append(a)
	reference.append('.')
	soup.add_reference_item(reference, id='Reference: paper EPR')
	p.append('. Now we move to a new section')
	document.append(p)	
	document.append(section('Results', level=1))
	
	
	caption_content = soup.new_tag('unwrap_me')
	caption_content.append('A picture of a mountain. See ')
	caption_content.append(crossref('Section: Introduction'))
	caption_content.append(' for more info')
	footnote_content = soup.new_tag('unwrap_me')
	footnote_content.append('This is a footnote in the caption of a figure, and it has a reference: ')
	footnote_content.append(crossref('Reference: paper EPR'))
	footnote_content.append('.')
	caption_content.append(footnote(footnote_content))
	caption_content.append('.')
	soup.body.append(
		new_float(
			float_class = 'Figure',
			content = BeautifulSoup(features='lxml').new_tag(
				'image', 
				src = 'https://www.planetware.com/wpimages/2019/10/switzerland-in-pictures-most-beautiful-places-matterhorn.jpg',
				style = 'max-width: 100%;',
			),
			caption = caption_content,
		)
	)
	for tag in soup.find_all('unwrap_me'):
		tag.unwrap()
	soup.write_to_file('processed_document.html')
