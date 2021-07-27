from latex_to_html import script_core as latex_to_html
import subprocess

def script_core(lyx_file: str):
	lyx_file_path = Path(lyx_file)
	
	subprocess.run(['lyx', '--export','latex', str(lyx_file_path)])
	
	latex_to_html(lyx_file_path.with_suffix('.tex'))

if __name__ == '__main__':
	import argparse
	from pathlib import Path
	
	parser = argparse.ArgumentParser(description='Converts a Lyx document into an AcademicHTML document.')
	parser.add_argument(
		'--lyx-document',
		metavar = 'path', 
		help = 'Path to the Lyx document to be converted.',
		required = True,
		dest = 'lyx_path',
		type = str,
	)
	args = parser.parse_args()
	
	script_core(args.lyx_path)
