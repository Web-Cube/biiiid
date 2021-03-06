import { config } from "../config";
import 'jquery-ui/ui/widgets/draggable';


var player = {

	updateProgressBar: (playerContainer) => {
		let item = playerContainer.find('.player__item')[0];
		let percentage = 100 / item.duration * item.currentTime;
		// let percentage = Math.floor((100 / item.duration) * item.currentTime);
		let $dot = playerContainer.find('.player__bar-dot')
		let $progress = playerContainer.find('.player__bar-progress')


		if(!$dot.hasClass('ui-draggable-dragging')){
			$dot
				.removeAttr('style')
				.css('left', `${percentage}%`);

			$progress
				.removeAttr('style')
				.width(`${percentage}%`);			
		}

	},

	reset: (item) => {
		let playerContainer = $(item).closest('.js-player');
		let $button = playerContainer.find('.player__nav-button');
		let $dot = playerContainer.find('.player__bar-dot')
		let $progress = playerContainer.find('.player__bar-progress')

		item[0].currentTime = 0;
		$button.removeClass('is-active')	
		$dot.removeAttr('style')
		$progress.removeAttr('style')
	},

	position: (x, playerContainer, dot = false) =>{

		let $item = playerContainer.find('.player__item'),
			$dot = playerContainer.find('.player__bar-dot'),
			$button = playerContainer.find('.player__nav-button'),
			item = $item[0];

		if(!$item.length)
			return false;

		item.pause();

		if(!dot){
			playerContainer
				.find('.player__bar-dot')
				.removeAttr('style')
				.css('left', x);
		}

		playerContainer
			.find('.player__bar-progress')
			.removeAttr('style')
			.width(x);

		let position = 100 / (playerContainer.find('.player__bar-line').width() / x);
		let sound_position = item.duration / 100 * position;
		
		item.currentTime = sound_position;

		if(!dot){
			item.play();
			$button.addClass('is-active')			
		}


	},

	stop: (e) => {

		let $t = $(e);
		let $item = $t.find('.player__item');
		let $button = $t.find('.player__nav-button');

		if($item.length){
			$button.removeClass('is-active')
			$item[0].pause()
		}

	},

	load: (file, playerContainer, type = 'video', callback) => {

		let playerItem = playerContainer.find('.player__item');

		if(!playerItem.length){

			playerContainer.addClass('is-loading').append(config.preloader);

			let req = new XMLHttpRequest();

			req.open('GET', file, true);

			req.responseType = 'blob';

			req.onload = function() {

				if (this.status === 200) {

					let template = (type == 'video') ? `<video width="300" height="170" class="player__item object-fit"><source src="${file}" type="video/mp4"/></video>` :
						`<audio class="player__item"><source src="${file}" type="audio/mpeg"></audio>`;

					let video = template;
					
					let jsPlayer = playerContainer.closest('.js-player');

					playerContainer
						.removeClass('is-loading')
						.prepend(video)
						.find('.preloader')
						.addClass('is-hidden')
						.on(config.transitionEnd, e => {
							if(e.originalEvent.propertyName == 'opacity'){
								playerContainer.find('.preloader').remove()
							}
						})

					
					playerItem = playerContainer.find('.player__item');
					
					playerItem
						.bind({
							timeupdate: e => {
								config.log('timeupdate')
								player.updateProgressBar(jsPlayer)
							},
							ended: e => {
								config.log('onended')
								player.reset(playerItem)
							}
						});

					jsPlayer.addClass('is-loaded')

					callback();

				}

			}

			req.onerror = () => {
			// Error
			}

			req.send();

		}else{
			callback();
		}

	},

	play: (e) => {

		let $this = $(e.currentTarget);
		let $button = $this.find('.player__nav-button');
		let $container = $this.find('.player__container');
		let video = $this.data('file');

		let type = $this.attr('data-audio') ? 'audio' : 'video';

		$('.js-player').not($this).each((i, el) => {
			player.stop(el)
		})


		if($container.hasClass('is-loading') ||
			$(e.target).attr('class').indexOf('player__bar') !== -1)
			return false;

		player.load(video, $container, type, () => {

			let $item = $container.find('.player__item');

			if($item.length){
				if(!$button.hasClass('is-active')){
					$item[0].play()
				}else{
					$item[0].pause()
				}				
			}

			$button.toggleClass('is-active')
		})

	},

	init: () => {

		$('.player__bar-line').on('click', e => {

			let $this = $(e.currentTarget);
			let $player = $this.closest('.js-player');
			let x = e.pageX - $this.offset().left;

			player.position(x, $player);

		})

		$('.player__bar-dot').draggable({ 
			axis: "x", 
			containment: "parent",
			drag: function() {
				let $this = $(this).parent();
				let $player = $this.closest('.js-player');
				let $bar = $player.find('.player__bar-line');
				let x = $(this).offset().left - $bar.offset().left;

				player.position(x, $player, true);
			},
			stop: function() {
				let $this = $(this);
				let $player = $this.closest('.js-player');				
				let item = $player.find('.player__item')[0];				
				let $button = $player.find('.player__nav-button');	

				item.play();
				$button.addClass('is-active')	
			}
		});

		$('.js-player').on('click', player.play)

	}

}

export { player }