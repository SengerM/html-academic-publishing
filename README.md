# HTML scientific documents

I want to replace the PDF format, which is tied to the concept of a paper-printed document, with something more modern that is not tied to that. 

You can see how this "PDF replacement attempt" looks like in [this link](https://sengerm.github.io/html-academic-publishing/).

# HTML-SD specificaitons

Throughout this file I will refer to "HTML scientific documents" as HTML-SD".

## Document structure

As this is HTML, the main structure must follow that of an HTML document. See [here](https://www.w3schools.com/html/html_intro.asp) for example. Within the `<body>`, HTML-SD requires to insert a `<div id="document_content">` where the content of the document will be (sections, figures, equations, text, etc.). Stuff outside this tag will be rendered but not used by HTML-SD. E.g. a section or a figure outside the `<div id="document_content">` will not be numbered, referenced, etc.

## Document title

In an HTML document the title is specified by the tag `<title>` within the `<head>` (see [here](https://www.w3schools.com/html/html_intro.asp)). This title is usually not rendered in the page. In scientific documents we always have a title to show. To avoid duplication of information, HTML-SD will use this title and place it in the `<div id="document_title"></div>` element. You can place this wherever you want, but usually you will put this in the beginning, just after `<div id="document_content">`.

## Sections and subsections

Scientific documents are always sturctured following sections, subsections, subsubsections and so on. In HTML this is done using the `<h1>` ... `<h6>` tags, see [here](https://www.w3schools.com/html/html_headings.asp). In HTML-SD all `<h_>` tags inside the `<div id="document_content">` will be automatically numbered (unless otherwise specified with `<h1 class="unnumbered">`), listed in the table of contents, available for cross referencing, etc.

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

**Not yet implemented**

I still don't decide which is the best way to implement this, but it is definitely important for scientific documents. 
