$(document).ready(function(){
	$('a').tooltip();
	$('#upload-note').submit(function(e){
		$('.error').remove();
		// e.preventDefault();
		var err = 0;

		if($('#course-title').val().length == 0){
			$('#course-title')
			.parent()
			.append('<center><p class="error">Error! Please enter course name.</p></center>');
			err = 1;
		}
		else{
			$('#course-title').siblings('center').slideUp(300);
		}

		if($('#notes-title').val().length == 0){
			$('#notes-title')
			.parent()
			.append('<center><p class="error">Error! Please enter note\'s name.</p></center>');
			err = 1;
		}
		else{
			$('#notes-title').siblings('center').slideUp(300);
		}

		if($('#input-file').val().length == 0){
			$('#input-file')
			.parent()
			.append('<center><p class="error">Error! Please select a file.</p></center>');
			err = 1;
		}
		else{
			$('#input-file').siblings('center').slideUp(300);
		}
	});
});
$(window).load(function () {
	$('#TheHeading').animate({'opacity' : '1'},200);
	$('#TheTagline').animate({'opacity' : '1'},900);
	$('#TheMobileLinks').animate({'opacity' : '1'},900);
	$('#TheLogo').animate({'opacity' : '1'},750);
	$('#TheLogo2').animate({'opacity' : '1'},950);
	$('#TheLogo3').animate({'opacity' : '1'},1150);
});

var courseDatumCreator = function(names){
    var datumCustom = new Array();
    jQuery.each(names, function(i, data){
        datumCustom.push({
        	name: data.name,
            slug: data.slug,
            value: data.name,
            tokens: [data.name, data.slug]
        });
    });
    return datumCustom;
};

$(document).ready(loadSubs());

function loadSubs(){
	$.ajax({
		url: '/loadTASubs',
		type: 'POST',
		dataType: 'JSON',
		success: function(data, textStatus, XMLHttpRequest){
            $('#course-title').typeahead({
            	name: 'Courses',
				local: courseDatumCreator(data)
			}).bind('typeahead:selected', function(obj, datum){
				$('#course-slug').attr('value', datum.slug);
			});
        },
        fail: function(){
        	console.log("Failed");
        },
        error: function(textStatus, XMLHttpRequest, errorThrown){
			console.log(errorThrown);
		}
	});
}

$('#upload-note').ajaxForm({
	dataType : 'json',
    uploadProgress: function ( event, position, total, percentComplete ) {
        if (percentComplete == 100) {
            $('.progress-bar').css('width',percentComplete+'%').html('Processing...');
        } 
        else{
            $('progress-bar').css('width',percentComplete+'%').html(percentComplete+'%');
        }
    },
    complete: function(){
    	location.assign('/managenotes?msg=saved');
    }
}); 