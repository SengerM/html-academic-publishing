var presentation_display_blocks = document.getElementsByTagName("presentation_display_block");
var last_shown_presentation_display_block = 0;
for (var i=0; i<presentation_display_blocks.length; i++) {
	presentation_display_blocks[i].id = `presentation_display_block_${i}`;
	if (i>0)
		presentation_display_blocks[i].classList.add("presentation_display_block_hidden");
	else {
		var loading_msg = document.createElement('div');
		loading_msg.id = 'presentation_display_blocks_loading_msg';
		presentation_display_blocks[i].parentNode.insertBefore(loading_msg, presentation_display_blocks[i].nextSibling);
	}
}

var show_next_button = document.createElement('button');
show_next_button.id = 'show_next_button';
show_next_button.innerHTML = 'Next';
show_next_button.setAttribute('onClick', 'showNextSlideBlock()');

var show_all_button = document.createElement('button');
show_all_button.id = 'show_all_button';
show_all_button.innerHTML = 'Show all remaining';
show_all_button.setAttribute('onClick', 'showAllSlideBlocks()');

var buttons_at_the_bottom_container = document.createElement('div');
buttons_at_the_bottom_container.id = 'buttons_at_the_bottom_container';
presentation_display_blocks[last_shown_presentation_display_block].parentNode.insertBefore(buttons_at_the_bottom_container, presentation_display_blocks[last_shown_presentation_display_block].nextSibling);
buttons_at_the_bottom_container.appendChild(show_next_button);
buttons_at_the_bottom_container.appendChild(show_all_button);

function showNextSlideBlock() {
	if (last_shown_presentation_display_block < presentation_display_blocks.length -1) {
		last_shown_presentation_display_block += 1;
		presentation_display_blocks[last_shown_presentation_display_block].classList.remove('presentation_display_block_hidden');
		presentation_display_blocks[last_shown_presentation_display_block].parentNode.insertBefore(buttons_at_the_bottom_container, presentation_display_blocks[last_shown_presentation_display_block].nextSibling);
		presentation_display_blocks[last_shown_presentation_display_block].scrollIntoView();
	}
	if (last_shown_presentation_display_block == presentation_display_blocks.length - 1) {
		show_next_button.remove();
		show_all_button.remove();
	}
}

async function showAllSlideBlocks() {
	const current_presentation_display_block = last_shown_presentation_display_block;
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	while (last_shown_presentation_display_block < presentation_display_blocks.length-1) {
		showNextSlideBlock();
		//~ await sleep(777/presentation_display_blocks.length);
	}
	//~ await sleep(555);
	//~ presentation_display_blocks[current_presentation_display_block].scrollIntoView();
}

setTimeout(function() {
	document.body.classList.add("loaded");
}, 1000);
