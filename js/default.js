// jqBinder
var jqBinder = {
	list: [],
	register: function(targetSelector, eventType, callback) {
		var self = jqBinder;
		var e = {
			'targetSelector': targetSelector,
			'eventType': eventType,
			'callback': callback,
		};
		self.list.push(e);
	},
	applyAll: function() {
		var self = jqBinder;
		for(var i=0; i<self.list.length; i++) {
			var e = self.list[i];

			if( e.eventType == 'each' ) {
				$(e.targetSelector).not('.em-set').addClass('em-set').each(function () {
					e.callback($(this));
				});
			} else if( e.eventType == 'popover' ) {
				$(e.targetSelector).not('.em-set').addClass('em-set').popover();
			} else {
				$(e.targetSelector).not('.em-set').addClass('em-set').bind(e.eventType, e.callback);
			}
		}
	},
}; // END jqBinder


jqBinder.register('a[data-confirm]', 'click', function() {
	var msg = $(this).data('confirm');
	var cf = confirm(msg);
	if( cf ) {
		location.href = $(this).data('href');
	}
});

jqBinder.register('select[data-select_submit=1]', 'change', function() {
	$(this).closest('form').trigger('submit');
	$(this).val($(this).data('current'));
	return false;
});

jqBinder.register('input[data-date_submit=1]', 'change', function() {
	$(this).closest('form').trigger('submit');
	$(this).val($(this).data('current'));
	return false;
});


jqBinder.register('.page-head h2, .page-head li.active', 'click', function() {
	// location.reload();
	location.href = location.href.split('?')[0];
});

jqBinder.register('.bs-dropdown-select-wrapper select', 'change', function() {
	var text = $(this).find('option:selected').text();
	var parent = $(this).closest('.bs-dropdown-select-wrapper');
	parent.find('button span.value').text(text);
	parent.closest('div.input-group').find('input').focus();
});

jqBinder.register('.bs-dropdown-select-wrapper .dropdown-menu li', 'click', function() {
	var key = $(this).data('key');
	var parent = $(this).closest('.bs-dropdown-select-wrapper');
	var select = parent.find('select');
	select.val(key).change();
});

jqBinder.register('input[name=begin_date],input[name=end_date]', 'change', function() {
	var val = $(this).val();
	var begin_date = $('input[name=begin_date]').val();
	var end_date = $('input[name=end_date]').val();

	if( begin_date == '' || end_date == '' ) {
		return;
	}

	if( begin_date > end_date ) {
		alert('잘못 입력하셨습니다');
		return;
	}

	$(this).closest('form').submit();
});

// 이미지 업로드
var FormImageUpload = function($self) {
	var $wrapper = $('<div />', {
		class: 'form-image-upload'
	});
	var input = $self;
	var imgId = 'img-' + input.attr('name').replace(/[\[\]]/g, '-');
	var uploadUrl = '/files/upload/image.json';
	var $img;

	if( input.data('fiu-img') ) {
		$img = $(input.data('fiu-img'));
		$img.attr('id', imgId);
	} else {
		var tag = '<img />';
		if( input.data('form-image-upload-video') ) {
			tag = '<video />';
		}
		if ($self.hasClass('has-custom-img-preview') ) {
			$img = $self.parent().find('.custom-img-preview');
		} else {
			$img = $(tag, {
				id: imgId,
				class: 'form-img-preview',
				src: '' + input.val(),
				click: function() {
					window.open( $(this).attr('src') );
				}
			});
		}
	}
	if( input.val() ) {
		$img.show();
	}
	$(input).change(function(e) {
		var prefix = 'http://cdn.rookieasia.kr/src/';
		if( e.target.value.substring(0, prefix.length) == prefix ) {
			$img.attr('src', $(this).val());
		} else {
			var linkUploadUrl = uploadUrl.replace('upload/image', 'upload/link') + '?url=' + encodeURIComponent(e.target.value);
			input.attr('disabled', 'disabled');

			$.ajax({
				url: linkUploadUrl,
				type: 'GET',
				processData: false,
				contentType: false,
				success: function(data) {
					if( data.result != 1 ) {
						alert('잘못된 링크입니다');
					} else {
						$img.attr('src', data.file.url);
						$img.show();
						input.val(data.file.url);

						if( window.onUploadSuccess ) {
							onUploadSuccess();
						}
					}
					$uploadBtn.removeAttr('disabled');
					input.removeAttr('disabled');
				},
				error: function(xhr, msg, err) {
					alert(msg);
					console.log(xhr.response);
				}
			});
		}
	});
	$(input).keyup( function(e) {
		if( input.val().length > 10 ) {
			$(input).trigger('change');
		}
	});

	$inputGroup = $('<div />', {
		class: 'input-group'
	});
	if ($self.hasClass('has-custom-upload-btn') ) {
		var $uploadBtn = $self.parent().find('.custom-upload-btn');
	} else {
		var $uploadBtn = $('<span class="input-group-btn"><button type="button" class="btn btn-default">파일선택</span></span>');
	}
	if( input.attr('type') == 'hidden' ) {
		$uploadBtn.hide();
	}

	// event - uploadBtn
	$uploadBtn.click( function() {
		$('<input type="file" />').change( function(event) {
			var formData = new FormData();
			formData.append('userfile', $(this)[0].files[0]);

			$uploadBtn.attr('disabled', 'disabled');
			$.ajax({
				url: uploadUrl,
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(data) {
					$img.attr('src', data.file.url);
					$img.show();
					input.val(data.file.url);

					$uploadBtn.removeAttr('disabled');

					if( window.onUploadSuccess ) {
						onUploadSuccess();
					}
				},
				error: function(xhr, msg, err) {
					alert(msg);
					console.log(xhr.response);
				}
			});
		}).trigger('click');
	});

	// attach
	$inputGroup.insertBefore(input);
	input.detach().appendTo($inputGroup);
	$uploadBtn.insertAfter(input);
	$wrapper.insertBefore($inputGroup);
	$inputGroup.detach().appendTo($wrapper);
	if (!$self.hasClass('has-custom-img-preview') ) {
		$img.insertAfter($inputGroup);
	}

	if( $self.hasClass('upload-image-float') ) {
		$('<span>&nbsp;&nbsp;<div class="btn btn-default btn-uif-up">▲</div>&nbsp;<div class="btn btn-default btn-uif-down">▼</div>&nbsp;<div class="btn btn-danger btn-uif-remove">✕</div></span>').insertAfter($img);
		jqBinder.applyAll();

		var $parent = $wrapper.parent();
		$parent.find('.btn-uif-up, .btn-uif-down').css('opacity', 1.0);
		$parent.find('.form-image-upload .btn-uif-up:first').css('opacity', 0.3);
		$parent.find('.form-image-upload .btn-uif-down:last').css('opacity', 0.3);
	}
};

jqBinder.register('input[data-form-image-upload], input.upload-image', 'each', function($self) {
	FormImageUpload($self);
});

jqBinder.register('.upload-image-multiple', 'change', function(e) {
	var $self = $(e.currentTarget);
	var inputName = $self.data('input-name');

	var files = $self[0].files;
	if( files.length == 0 ) {
		return;
	}

	$parent = $self.parent();
	var cnt = files.length;

	$self.attr('disabled', 'disabled');
	$('#save').attr('disabled', 'disabled');

	if( onUploadCompleted == undefined ) {
		var onUploadCompleted = function() {
			$self.removeAttr('disabled');
			$('#save').removeAttr('disabled');

			// resetting file input
			$self.wrap('<form>').closest('form').get(0).reset();
			$self.unwrap();

			jqBinder.applyAll();
		}
	}
	for(var i=0; i<files.length; i++) {
		var formData = new FormData();
		formData.append('userfile', files[i]);

		$.ajax({
			url: '/files/upload/image.json',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function(data) {
				$('<input />', {
					'type': 'text',
					'name': inputName,
					'class': 'form-control upload-image upload-image-float',
					'value': data.file.url,
				}).appendTo($parent);

				cnt -= 1;
				if( cnt == 0 ) {
					onUploadCompleted($self);
				}
			},
			error: function(xhr, msg, err) {
				alert(msg);
				console.log(xhr.response);

				cnt -= 1;
				if( cnt == 0 ) {
					onUploadCompleted($self);
				}
			}
		});
	}
});

jqBinder.register('.btn-uif-up, .btn-uif-down', 'click', function(e) {
	var $self = $(e.currentTarget);
	var $fiu = $self.closest('.form-image-upload');

	if( $self.hasClass('btn-uif-up') ) {
		$fiu.insertBefore( $fiu.prev('.form-image-upload') );
	} else {
		$fiu.insertAfter( $fiu.next('.form-image-upload') );
	}

	var $parent = $fiu.parent();
	$parent.find('.btn-uif-up, .btn-uif-down').css('opacity', 1.0);
	$parent.find('.form-image-upload .btn-uif-up:first').css('opacity', 0.3);
	$parent.find('.form-image-upload .btn-uif-down:last').css('opacity', 0.3);
});

jqBinder.register('.btn-uif-remove', 'click', function(e) {
	var $self = $(e.currentTarget);
	var $fiu = $self.closest('.form-image-upload');
	var $parent = $fiu.parent();
	$fiu.remove();

	$parent.find('.btn-uif-up, .btn-uif-down').css('opacity', 1.0);
	$parent.find('.form-image-upload .btn-uif-up:first').css('opacity', 0.3);
	$parent.find('.form-image-upload .btn-uif-down:last').css('opacity', 0.3);
});

// mul ids
$('.mul-ids-form-group').parent('form').submit( function() {
	$('.mul-ids-form option').prop('selected', true);
});
$('.mul-ids-items').change( function() {
	if( $(this).val() == '' ) {
		return;
	}

	var $fgroup = $(this).closest('.mul-ids-form-group');
	var $options = $fgroup.find('select.mul-ids-form option');
	for(var i=0; i<$options.length; i++) {
		if( $options.eq(i).val() == $(this).val() ) {
			alert('이미 추가되었습니다');
			$(this).val('');
			return;
		}
	}

	var $option = $('<option value="' + $(this).val() + '">' + $(this).find('option:selected').text() + '</option>');
	$fgroup.find('select.mul-ids-form').append($option);
	$(this).val('');
});
$('.mul-ids-btnRemoveItem').click( function() {
	$(this).closest('.mul-ids-form-group').find('select.mul-ids-form option:selected').remove();
});

jqBinder.register('.multiselect-input', 'keydown', function(e) {
	if( e.keyCode == 13 ) {
		e.preventDefault();

		var value = $(this).val();
		var $select = $('.' + $(this).data('for'));

		if( value.trim() == '' ) {
			return;
		}

		var shouldReturn = false;
		$select.find('option').each( function() {
			if( $(this).val() == value ) {
				alert('이미 등록되어 있습니다');
				shouldReturn = true;
			}
		});
		if( shouldReturn ) {
			return;
		}

		$select.append( $('<option />', {
			value: value,
			text: value,
			selected: 'selected',
		})).trigger('change');

		$(this).val('');
	}
});

jqBinder.register('.mf-object .btn-add-item', 'click', function(e) {
	var $parent = $(this).closest('.mf-object');
	var $template = $parent.find('.item-template');

	var $clone = $template.clone();
	$clone.removeClass('item-template').addClass('item');
	$clone.find('.em-set').removeClass('em-set');

	$clone.insertBefore($parent.find('.add-block')).show();
	$clone.find('input:disabled').removeAttr('disabled');
	$clone.find('input:first')[0].focus();
	$clone.find('input').each( function() {
		var $elm = $(this);
		var oldName = $elm.attr('name');
		var newId = (new Date()).getTime() % 500000;
		$elm.attr('name', oldName.replace(/\[00000\]/, '[' + newId + ']'));
	});

	jqBinder.applyAll();
});

jqBinder.register('.mf-object .item .btn-remove-item', 'click', function(e) {
	$(this).closest('.item').remove();
});

var drawMfObjects = function(name, rows) {
	if( rows == null ) {
		return;
	}
	var $parent = $('.mf-object.' + name);
	var $template = $parent.find('.item-template');

	for(var i in rows) {
		var row = rows[i];

		var $clone = $template.clone();
		$clone.removeClass('item-template').addClass('item');
		$clone.find('.em-set').removeClass('em-set');

		$clone.insertBefore($parent.find('.add-block')).show();
		$clone.find('input:disabled').removeAttr('disabled');

		for(var key in row) {
			if( key == 'id' ) {
				continue;
			}
			var sel = '.input-' + name + '-' + key;
			var $elm = $clone.find(sel);
			if( $elm.length == 0 ) {
				continue;
			}
			var oldName = $elm.attr('name');

			$elm.attr('name', oldName.replace(/\[00000\]/, '[' + row.id + ']'));
			$elm.val(row[key]);
		}

		$clone.find('input:first')[0].focus();
	}
};

jqBinder.register('.upload-file-multiple', 'change', function(e) {
	var $self = $(e.currentTarget);
	var inputName = $self.data('input-name');

	var files = $self[0].files;
	if( files.length == 0 ) {
		return;
	}

	$parent = $self.parent();
	var cnt = files.length;

	$self.attr('disabled', 'disabled');
	$('#save').attr('disabled', 'disabled');

	if( onUploadCompleted == undefined ) {
		var onUploadCompleted = function() {
			$self.removeAttr('disabled');
			$('#save').removeAttr('disabled');

			// resetting file input
			$self.wrap('<form>').closest('form').get(0).reset();
			$self.unwrap();

			jqBinder.applyAll();
		}
	}
	for(var i=0; i<files.length; i++) {
		var formData = new FormData();
		formData.append('userfile', files[i]);

		$.ajax({
			url: '/files/upload/rawfile.json',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function(data) {
				var $wrapper = $('<div />', {
					'class': 'upload-file-wrapper',
				});
				if( $self.hasClass('has-custom-single-file-preview') ) {
					$('.upload-file-wrapper').remove();
					$wrapper.addClass('has-custom-single-file-preview');
				}

				var newId = (new Date()).getTime() % 500000;
				$wrapper.append($('<input />', {
					'type': 'text',
					'name': inputName + '[' + newId + '][file_url]',
					'class': 'file_url',
					'value': data.file.url,
				}));
				$wrapper.append($('<input />', {
					'type': 'hidden',
					'name': inputName + '[' + newId + '][original_name]',
					'class': 'original_name',
					'value': data.file.original_name,
				}));
				$wrapper.appendTo($parent);

				cnt -= 1;
				if( cnt == 0 ) {
					onUploadCompleted($self);
				}
			},
			error: function(xhr, msg, err) {
				alert(msg);
				console.log(xhr.response);

				cnt -= 1;
				if( cnt == 0 ) {
					onUploadCompleted($self);
				}
			}
		});
	}
});

jqBinder.register('.upload-file-wrapper', 'each', function($self) {
	$self.find('.file_url').hide();
	var originalName = $self.find('.original_name').val();
	var file_url = '/files/download.file?url=' + encodeURIComponent($self.find('.file_url').val()) + '&original_name=' + encodeURIComponent(originalName);
	var ext = originalName.split('.').pop();
	if( $self.hasClass("has-custom-single-file-preview")) {
		$('.custom-single-file-preview').val(originalName);
	} else {
		$self.append('<li class="file"><span class="label label-info ext">' + ext.toUpperCase() + '</span><a href="' + file_url + '" target="_blank">&nbsp; ' + originalName + ' &nbsp; </a><label class="label label-danger btn-remove-file"><span class="glyphicon glyphicon-trash"></span></label></li>');
	}
	jqBinder.applyAll();
});

jqBinder.register('.upload-file-wrapper .btn-remove-file', 'click', function() {
	$(this).closest('.upload-file-wrapper').remove();
});

window.qs = function(obj, prefix) {
	var str = [];
	for(var p in obj) {
		if (obj.hasOwnProperty(p)) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			if( typeof v == 'object' ) {
				str.push(qs(v, k));
			} else if( v != undefined && v != 'undefined' ) {
				str.push( k + "=" + encodeURIComponent(v));
			}
		}
	}
	return str.join("&");
}

jqBinder.register('table .md-chk-all', 'click', function() {
	var prop = $(this).prop('checked');

	$('.md-chk').prop('checked', prop);
});
jqBinder.register('.paging-wrap .btn-multiple-delete', 'click', function() {
	var url = $(this).data('delete_url');
	var id_name = $(this).data('id_name');

	var $checks = $('.md-chk:checked');
	if( $checks.length == 0 ) {
		alert('선택된 아이템이 없습니다');
		return;
	}

	var item_ids = [];
	$checks.each( function() {
		item_ids.push($(this).data('item_id'));
	});
	item_ids.push(4);
	item_ids.push(6);
	var obj = {};
	obj[id_name] = item_ids;

	if( url.indexOf('?') !== -1 ) {
		url += '&' + qs(obj);
	} else {
		url += '?' + qs(obj);
	}
	$.ajax({
		url: url,
		success: function(data) {
			if( data.result != 1 ) {
				alert(data.message);
				return;
			}
			location.reload();
		},
	})
});

jqBinder.register('.btn-clip-copy', 'click', function() {
	var from = $(this).data('copy-from');
	var msg = $('#' + from).text();
	var $textarea = $('<textarea id="abc">' + msg + '</textarea>');
	$textarea.appendTo('body');
	copylink('abc');
	$textarea.remove();

})

jqBinder.register('.btn-show-contest', 'click', function() {
	var contest_id = $(this).data('contest_id');

	$('#product-detail .product-detail').html('');
	openModal('product-detail');

	var url = '/contests/show.partial?contest_id=' + contest_id;
	$.ajax({
		url: url,
		success: function(data) {
			$('#product-detail .product-detail').html(data);

			jqBinder.applyAll();
		},
	})
});

jqBinder.register('.product-detail .btn-like', 'click', function() {
	var $self = $(this);
	var contest_id = $self.data('contest_id');

	var func = null;
	var mode = 'like';
	if( $self.find('span').hasClass('active') ) {
		func = Contest.unlike;
		mode = 'unlike';
	} else {
		func = Contest.like;
	}

	$self.attr('disabled', 'disabled');

	func({
		contest_id: contest_id,
	}, function(err, data) {
		if( data.result == 1 ) {
			if( mode == 'like' ) {
				$self.find('span').addClass('active');

				$('.product-list-favorites .item a[data-contest_id=' + contest_id + ']').closest('.item').show();
				$('.favorites_cnt').text( parseInt($('.favorites_cnt').text()) + 1 );
			} else {
				$self.find('span').removeClass('active');

				$('.product-list-favorites .item a[data-contest_id=' + contest_id + ']').closest('.item').hide();
				$('.favorites_cnt').text( parseInt($('.favorites_cnt').text()) - 1 );
			}
			$('.likes-cnt').text( data.contest.likes_cnt );
		} else {
			alert(data.message);
		}
		$self.removeAttr('disabled');
	});
});

var FormRawFileUpload = function($self) {
	var $wrapper = $('<div />', {
		class: 'form-raw-file-upload'
	});
	var input = $self;
	var uploadUrl = '/files/upload/rawfile.json';

	$inputGroup = $('<div />', {
		class: 'input-group'
	});

	// desc
	var $desc = $('<input type="text" class="form-control" readonly />');
	if( $self.data('desc_name') ) {
		$desc.attr('name', $self.data('desc_name'));
	}
	if( $self.data('desc_value') ) {
		$desc.attr('value', $self.data('desc_value'));
	}
	$inputGroup.append($desc);

	// uploadBtn
	var $uploadBtn = $('<span class="input-group-btn"><button type="button" class="btn btn-default">파일선택</span></span>');
	if( input.attr('type') == 'hidden' ) {
		$uploadBtn.hide();
	}

	// event - uploadBtn
	$uploadBtn.click( function() {
		$('<input type="file" />').change( function(event) {
			var formData = new FormData();
			formData.append('userfile', $(this)[0].files[0]);

			$uploadBtn.attr('disabled', 'disabled');
			$.ajax({
				url: uploadUrl,
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(data) {
					input.val(data.file.url);
					$desc.val(data.file.original_name);
					$uploadBtn.removeAttr('disabled');

					if( window.onUploadSuccess ) {
						onUploadSuccess();
					}
				},
				error: function(xhr, msg, err) {
					alert(msg);
					console.log(xhr.response);
				}
			});
		}).trigger('click');
	});

	// attach
	$inputGroup.insertBefore(input);
	input.attr('type', 'hidden');
	input.detach().appendTo($inputGroup);
	$uploadBtn.insertAfter(input);
	$wrapper.insertBefore($inputGroup);
	$inputGroup.detach().appendTo($wrapper);
}

jqBinder.register('input.upload-raw-file', 'each', function($self) {
	FormRawFileUpload($self);
});

jqBinder.register('.btn-history-go-back', 'click', function() {
	history.go(-1);
});

jqBinder.register('.click-message', 'click', function() {
	var message = $(this).data('message');
	alert(message);
});

$(document).ready( function() {
	if(window.location.hash) {
		var hash = window.location.hash;
		switch(hash) {
			case '#login':
				$('.btn-login').trigger('click');
				break;
		}
	}
});


jqBinder.register('.custom-select', 'each', function($self) {
	var txt=$self.find('option:selected').text();
	var w=$self.data('width');
	$self.wrap('<div class="custom-select-wrap" style="width:'+w+'"></div>');
	$self.parent().append('<span class="txt">'+txt+'</span><span class="icon-select-arrow"></span>');
	$self.on('change', function(){
		var txt=$(this).find('option:selected').text();
		$(this).parent().find('.txt').text(txt);
	});
});

jqBinder.register('.click-on-submit', 'click', function() {
	var $form = $(this).closest('form');
	$form.trigger('submit');
});

jqBinder.register('tr[data-href]', 'click', function() {
	var href = $(this).data('href');
	location.href = href;
});


var FormRawFileUpload = function($self) {
	var $wrapper = $('<div />', {
		class: 'form-raw-file-upload'
	});
	var input = $self;
	var uploadUrl = '/files/upload/rawfile.json';

	$inputGroup = $('<div />', {
		class: 'input-group'
	});

	// desc
	var $desc = $('<input type="text" class="form-control" readonly />');
	if( $self.data('desc_name') ) {
		$desc.attr('name', $self.data('desc_name'));
	}
	if( $self.data('desc_value') ) {
		$desc.attr('value', $self.data('desc_value'));
	}
	$inputGroup.append($desc);

	// uploadBtn
	var $uploadBtn = $('<span class="input-group-btn"><button type="button" class="btn btn-default">파일선택</span></span>');
	if( input.attr('type') == 'hidden' ) {
		$uploadBtn.hide();
	}

	// event - uploadBtn
	$uploadBtn.click( function() {
		$('<input type="file" />').change( function(event) {
			var formData = new FormData();
			formData.append('userfile', $(this)[0].files[0]);

			$uploadBtn.attr('disabled', 'disabled');
			$.ajax({
				url: uploadUrl,
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(data) {
					input.val(data.file.url);
					$desc.val(data.file.original_name);
					$uploadBtn.removeAttr('disabled');

					if( window.onUploadSuccess ) {
						onUploadSuccess();
					}
				},
				error: function(xhr, msg, err) {
					alert(msg);
					console.log(xhr.response);
				}
			});
		}).trigger('click');
	});

	// attach
	$inputGroup.insertBefore(input);
	input.attr('type', 'hidden');
	input.detach().appendTo($inputGroup);
	$uploadBtn.insertAfter(input);
	$wrapper.insertBefore($inputGroup);
	$inputGroup.detach().appendTo($wrapper);
}

jqBinder.register('input.upload-raw-file', 'each', function($self) {
	FormRawFileUpload($self);
});

jqBinder.register('[click-to-href]', 'click', function(e) {
	if( $(e.target).closest('.manage').length != 0 ) {
		return;
	}
	var href = $(this).attr('click-to-href');
	location.href = href;
});