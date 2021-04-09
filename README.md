# HTML scientific documents

I want to replace the PDF format, which is tied to the concept of a paper-printed document, with something more modern that is not tied to that. 

You can see how this "PDF replacement attempt" looks like in [this link](https://sengerm.github.io/html-academic-publishing/).

## Template

You can find a template [here](https://github.com/SengerM/html-academic-publishing/blob/main/template.html). Just download it and start playing. Open it with your favourite text editor and at the same time with your favourite web browser. Let the magic begin...

## Tests that this works

As of 5-April-2021 I tested this in the following browsers:

- Firefox in Linux: Works perfect.
- Chrome in Windows: Works perfect.
- Edge in Windows: Works perfect.
- Chrome in Android (mobile): Works fine but equations render small.
- Firefox in Android (mobile): Works fine but equations render small.

# HTML-SD specificaitons

Throughout this file I will refer to "HTML scientific documents" as "HTML-SD".

## Document structure

As this is HTML, the main structure must follow that of an HTML document. See [here](https://www.w3schools.com/html/html_intro.asp) for example. Within the `<body>` you just write the stuff.

## Document title

In an HTML document the title is specified by the tag `<title>` within the `<head>` (see [here](https://www.w3schools.com/html/html_intro.asp)). This title is usually not rendered in the page. In scientific documents we always have a title to show. To avoid duplication of information, HTML-SD will use this title and place it in the `<div id="document_title"></div>` element. You can place this wherever you want, but usually you will put this in the beginning, just after `<body>`.

## Authors

To specify the authors of the document use the `<author>` tag like this:
```html
<author affiliation="Universität Zürich|Fermilab|Princeton|Cambridge|Universidad de Buenos Aires|CERN|Oxford">
	Smart Guy
</author>
<author	affiliation="Universität Zürich|Weird Institution with Such a Long Name That you Barely Konw How to Write" email="juanca@gmail.com">
	Juan Carlos
</author>
<author affiliation="The Pirates University" email="theblackpearl@tortuga.com.pi">
	Captain Jack Sparrow<footnote>Yo ho, yo ho, a pirate's life for me.</footnote>
</author>
```
The order of the authors is the one you write them. The list of affiliations is automatically assembled and ordered alphabetically.

## Sections and subsections

Scientific documents are always sturctured following sections, subsections, subsubsections and so on. In HTML this is done using the `<h1>` ... `<h6>` tags, see [here](https://www.w3schools.com/html/html_headings.asp). In HTML-SD all `<h_>` tags will be automatically numbered unless otherwise specified with `<h1 class="unnumbered">`, listed in the table of contents, available for cross referencing, etc.

### Table of contents

If you want a table of contents, just insert `<div id="table-of-contents"></div>` wherever you want it. You can also add a title, for example:
```html
<div id="table-of-contents">
	<h2 class="unnumbered">Table of contents</h2> <!-- Feel free to change this title. -->
	<!-- Here will be placed the table of contents -->
</div>
```

## Figures and tables

To keep everything as close as possible to the standard, figures and tables are entered in the same way as in HTML. So for figures you would do [this](https://www.w3schools.com/tags/tag_figcaption.asp) and for tables [this](https://www.w3schools.com/tags/tag_caption.asp). Note that figures and tables will be automatically numbered by HTML-SD and if an `id` is provided made available for cross referencing. The `id` is specified not in the caption but in the `<figure>` or `<table>` tags, e.g. 

```html
<figure id="plot of x^2">
	<img src="plot.png">
	<figcaption>This is the plot of the function $x^2$</figcaption>
</figure>
```
Now this figure can be referenced via its `id` in another part of the document. 

## Math

Latex is very practical and widespread for coding math expressions. Thus, HTML-SD uses the same syntax as in Latex for this. So `$f(x)=x^2$` is an inline equation and `$$f(x)=x^2$$` is a "presented equation" or whatever name it has. Using `$` or `$$` alone creates an equation that will be displayed but not numbered. If you want to obtain a numbered equation you should use the non-standard tag `<equation>` and place your equation within it, for example

```html
<equation id="definition of f">$$f(x)=x^2$$</equation>
```
This equation will automatically be numbered. The `id` is optional, if you provide it you can make a reference to this equation in another part of the document.

## Cross references

Cross references are extremely useful in scientific documents. To insert a cross reference in HTML-SD we use the non-standard tag `<crossref>` and inside it we put the `id` of whatever we want to refer to. For example 
```html
<h1>The first section</h1>
<p>This is some random text, and now an equation:
	<equation id="definition of f">$$f(x)=x^2$$</equation>
Now I can insert a reference to the equation by <crossref>definition of f</crossref> and also to the section by <crossref>The first section</crossref>.</p>

```
Note that for figures, tables and equations you must previously define an `id`. For sections (`<h1>` to `<h6>`) you can avoid the `id` if and only if there are not two sections with the same name. Otherwise you will be required to make such sections different by assigning them different `id`s. 

When using `<crossref>` the text displayed will automatically match that of what you are refering to, if it is a figure, a table or a section the corresponding number will be shown, if it is an equation a pair of parentheses will be added. They will also be linked for clicking and a popup bubble will show the refered object on mouse hover. 

### Defining the `id`s for cross referencing

The `id`s are defined in the same way as is standard in HTML. Examples:
```html
<h1 id="this is the id of this section>Title of the section</h1>

<h2 id="this is the id of the subsection">Title of the subsection</h2>

<equation id="id of the equation">$$f(x)=x^2$$</equation>

<figure id="id of the figure">
	<img src="plot.png">
	<figcaption>This is the plot of the function $x^2$</figcaption>
</figure>

<table id="id of the table">
	<caption>Monthly savings</caption>
	<tr>
		<th>Month</th>
		<th>Savings</th>
	</tr>
	<tr>
		<td>January</td>
		<td>$100</td>
	</tr>
</table> 
```

## Footnotes

To insert footnotes use the non-standard `<footnote>` tag, for example `<footnote>This is a footnote.</footnote>`. All footnotes will be automatically numbered and added to the footnotes list. For the moment you must tell where the footnotes list will be located by inserting `<div id="footnotes_list"></div>` somewhere in the document (it can be anywhere). You can add extra elements, for example:
```html
<div id="footnotes_list">
	<h2 class="unnumbered">Footnotes</h2>
	<!-- The list of footnotes will be placed here -->
</div>
```

## Bibliography

To insert bibliography follow these steps:

1. Insert your bibliography elements within `<reference>` tags and assign each of them a unique ID, like this:
```html
<reference id="book Jackson Classical Electrodynamics">Jackson, J. D. (1999). Classical electrodynamics.</reference>
<reference id="paper EPR">Einstein, A., B. Podolsky, and N. Rosen. “Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?” Physical Review 47, no. 10 (May 15, 1935): 777–80. <a href="https://doi.org/10.1103/PhysRev.47.777">https://doi.org/10.1103/PhysRev.47.777</a>.</reference>
<reference id="paper Bell">Bell, John Stewart. “On the Einstein Podolsky Rosen Paradox” 1, no. 3 (1964): 6.</reference>
```
This can be done in any part of the document, however it is recommended to put them all together. Note that whatever text you put within the `<reference>` and `</reference>` tags is what will be displayed. Simple and easy.
2. Create a `<div id="references_list">` element wherever you want your bibliography list to be displayed. Usually close to the end, but you choose. 
3. Cite your elements as if they were just a cross reference using `<crossref>`, for example 
```html
See reference <crossref>paper EPR</crossref> for more details.
```

The list of bibliography will be assembled automatically, this means that elements will appear in the order you cited them and elements that are not cited are not shown.

Note that you can put everything together like this:
```html
<div id="references_list">
	<h1 class="unnumbered">References</h1>
	<reference id="book Jackson Classical Electrodynamics">Jackson, J. D. (1999). Classical electrodynamics.</reference>
	<reference id="paper EPR">Einstein, A., B. Podolsky, and N. Rosen. “Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?” Physical Review 47, no. 10 (May 15, 1935): 777–80. <a href="https://doi.org/10.1103/PhysRev.47.777">https://doi.org/10.1103/PhysRev.47.777</a>.</reference>
	<reference id="paper Bell">Bell, John Stewart. “On the Einstein Podolsky Rosen Paradox” 1, no. 3 (1964): 6.</reference>
</div>
```
