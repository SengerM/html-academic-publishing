var slide_blocks = document.getElementsByClassName("slide_block");
var last_shown_slide_block = 0;
for (var i=0; i<slide_blocks.length; i++) {
	slide_blocks[i].id = `slide_block_${i}`;
	if (i>0)
		slide_blocks[i].classList.add("slide_block_hidden");
}

var show_next_button = document.createElement('button');
show_next_button.id = 'show_next_button';
show_next_button.innerHTML = 'Next';
show_next_button.setAttribute('onClick', 'showNextSlideBlock()');

var show_all_button = document.createElement('button');
show_all_button.id = 'show_all_button';
show_all_button.innerHTML = 'Show all';
show_all_button.setAttribute('onClick', 'showAllSlideBlocks()');

var buttons_at_the_bottom_container = document.createElement('div');
buttons_at_the_bottom_container.id = 'buttons_at_the_bottom_container';
slide_blocks[last_shown_slide_block].parentNode.insertBefore(buttons_at_the_bottom_container, slide_blocks[last_shown_slide_block].nextSibling);
buttons_at_the_bottom_container.appendChild(show_next_button);
buttons_at_the_bottom_container.appendChild(show_all_button);

function showNextSlideBlock() {
	if (last_shown_slide_block < slide_blocks.length -1) {
		last_shown_slide_block += 1;
		slide_blocks[last_shown_slide_block].classList.remove('slide_block_hidden');
		slide_blocks[last_shown_slide_block].parentNode.insertBefore(buttons_at_the_bottom_container, slide_blocks[last_shown_slide_block].nextSibling);
		slide_blocks[last_shown_slide_block].scrollIntoView();
	}
	if (last_shown_slide_block == slide_blocks.length - 1) {
		show_next_button.remove();
		show_all_button.remove();
	}
}

async function showAllSlideBlocks() {
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	while (last_shown_slide_block < slide_blocks.length-1) {
		showNextSlideBlock();
		await sleep(1111/slide_blocks.length);
	}
	await sleep(777);
	document.body.scrollTop = document.documentElement.scrollTop = 0;
}
