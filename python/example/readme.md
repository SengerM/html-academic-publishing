To produce an HTML from the LyX file in this example just run the `lyx_to_html.py` script as follows:
```
$ python lyx_to_html.py --lyx-document <path_to_LyX_doc>
```
and that's it. You will need LyX installed and also some Python packages that the script will tel you. The script first exports the LyX file to Latex, and then translates the Latex into AcademicHTML.

The `example.html` file is what you should obtain as result.
