# HTML scientific documents

I want to replace the PDF format, which is tied to the concept of a paper-printed document, with something more modern that is not tied to that. 

You can see how this "PDF replacement attempt" looks like in [this link](https://sengerm.github.io/html-academic-publishing/).

## Tested

As of April 2021 this was tasted in the following browsers and operating systems:

- Firefox in Linux.
- Chrome in Windows.
- Edge in Windows.
- Chrome in Android.
- Firefox in Android.
- Brave in Android.

In all cases no issues were found.

## Reference, documentation and template

You can find documentation [here](https://sengerm.github.io/html-academic-publishing/). You can also use that file as a template. Just download it and start playing. Open it with your favourite text editor and at the same time with your favourite web browser. Let the magic begin...

## Installation

You don't need to install anything as you already have a web browser (Firefox, Chrome, etc., whichever you want) and a text editor (Notepad, etc.). Just download any of the [examples](examples), open it with the web browser and simultaneously with the text editor, modify it in the text editor and refresh the browser to see the changes.

## LyX → HTML

[LyX](https://www.lyx.org/) is a really nice software for writing scientific documents, it implements a graphical interface and writes LaTeX in the background. In the normal workflow you end up with a nice PDF file. But what if you want an HTML? LyX offers some built in options to export HTML, but they are not nice.

I implemented a simple [Python script](python/lyx_to_html.py) to export a limited subset of what you can do in LyX into a nice HTML.

![Screenshot](/python/example/Screenshot_2021-07-30_19-09-45.png)
