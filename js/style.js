// check device
$(document).on('ready', function() {

	/*footer-하단고정*/
	var f_height =  $('footer').height();
	$('.wrapper').css("padding-bottom",f_height);

	/*주메뉴*/
	$('.gnb>ul>li').on('mouseenter',function(){
		$(this).find('.two-depth').addClass('on');
	});
	$('.gnb>ul>li').on('mouseleave',function(){
		$(this).find('.two-depth').removeClass('on');
	});

	/*gnb 서브메뉴 left값 자동계산*/
	$('.gnb-wrap .two-depth').each( function() {
		var $self = $(this);
		$self.css({
			position: 'relative',
			display: 'block',
		});
		$self.css({
			width: $self.outerWidth() + 'px',
			position: 'absolute',
			display: '',
		});

		var $parent = $self.closest('li').find('a');
		var left = ( $parent.outerWidth() - $self.outerWidth() ) / 2;
		$self.css('left', left + 'px');
	});

	/*테이블스타일 게시판*/

	$('.tb-style-board .item >a').each(function(){
		var StatusIndex = 0;
		$(this).click(function(){
			if(StatusIndex === 0){
				$(this).addClass('on');
				$(this).next('.item-detail').slideDown();
				StatusIndex ++;
			}
			else{
				$(this).removeClass('on');
				$(this).next('.item-detail').slideUp();
				StatusIndex = 0;
			}
		});
	});

	/*카테고리 버튼 온오프*/
	$('.category-form.detail ul li a').click(function(){
		$('.category-form.detail ul li a').removeClass('on');
		$(this).addClass('on');
	});

	/*컨텐츠 비디오,이미지 리스트영역*/
	$('.content-items .item a').click(function(){
		$('.content-items .item a').find('.img-box').removeClass('on');
		$(this).find('.img-box').addClass('on');
	});

	/*동의하기 체크박스*/
	$('.agree-box').each(function(){
		var agreeIndex = 0;
		$('.agree-box label').click(function(){
			if(agreeIndex === 0){
				$(this).addClass('on');
				agreeIndex ++;
			}
			else{
				$(this).removeClass('on');
				agreeIndex = 0;
			}

		});
	});

	/*인풋 스피너*/
	$('.spinner').each(function(){
		var spinner_number = 0;
		$(this).find('.number').text(spinner_number+'개');
		$('.spinner .buttons .up').click(function(){
			spinner_number ++;
			$(this).parents('.spinner').find('.number').text(spinner_number+'개');
		});
		$('.spinner .down').click(function(){

			if(spinner_number > 0 ){
				spinner_number--;
			}
			$(this).parents('.spinner').find('.number').text(spinner_number+'개');
		});
	});


});


