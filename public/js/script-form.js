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

$(document).ready(function(){
	$('a').tooltip();
	$('#regform').submit(function(e){
		$('.error').remove();
		// e.preventDefault();
		var err = 0;
		if($('#username').val().length == 0){
			$('#username')
			.parent()
			.append('<center><p class="error">Error! Please enter your name.</p></center>');
			err = 1;
		}
		else{
			$('#username').siblings('center').slideUp(300);
		}
		// Check if the ID is in form 2011a4ps110u or 2011a4ts002u
		if($('#bid').val().length !== 12){
			$('#bid').parent()
			.append('<center><p class="error">Error! Please enter valid BITS ID. Example:2007AAPS001U, 2011A4PS067U, etc!</p></center>');
			err = 1;
		}
		else{
			$('#bid').siblings('center').slideUp(300);
		}
		//check email address
		if($('#usermail').val().length === 0){
			$('#usermail').parent()
			.append('<center><p class="error">Error! Enter a valid Email address!</p></center>');
			err = 1;
		}
		else{
			$('#usermail').siblings('center').slideUp(300);
		}
		//Valid Password?
		if($('#pass1').val().length < 8){
			$('#pass1').parent()
			.append('<center><p class="error">Error! Password should be minimum of 8 characters!</p></center>');
			err = 1;
		}
		else{
			$('#pass1').siblings('center').slideUp(300);
		}
		//Password Equal?
		if($('#pass1').val() !== $('#pass2').val()){
			$('#pass2').parent().append('<center><p class="error">Error! Passwords do not match!</p></center>');
			err = 1;

		}
		else{
			$('#pass2').siblings('center').slideUp(300);
		}
		if(err==1){
			loadSubs();
			return false;
		}
	}); 
	$('#courses-tr').on("click", '.delete',function(){
        $(this).parent().remove();
    });
});

$(document).ready(loadSubs());

function loadSubs(){
	$.ajax({
		url: '/loadTASubs',
		type: 'POST',
		dataType: 'JSON',
		success: function(data, textStatus, XMLHttpRequest){
            $('#course-input').typeahead({
            	name: 'Courses',
				local: courseDatumCreator(data)
			}).bind('typeahead:selected', function(obj, datum){
				if(jQuery('.'+datum.slug).length > 0){
                    jQuery('#courses-tr ').append('<p class="error error-course">Course already added.</p>').delay(2000).queue(function(){
                        jQuery('.error-course').fadeOut();
                    });
                }
                else{
                    var htmlString = '<div class="course-box '+datum.slug+'">'
                    + '<p class="name">'+datum.name+'</p>'
                    + '<div class="delete"><button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button></div>'
                    + '<input type="hidden" name="courses[]" value="'+datum.slug+'"></div><!--End #course-box-->';
                    // $('.course-title').fadeIn();
                    jQuery('#courses-tr').append(htmlString);
                }
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

$(window).load(function () {
	$('#TheHeading').animate({'opacity' : '1'},200);
	$('#TheTagline').animate({'opacity' : '1'},900);
	$('#TheMobileLinks').animate({'opacity' : '1'},900);
	$('#TheLogo').animate({'opacity' : '1'},1750);
	$('#Android').animate({'opacity' : '1'},400);
	$('#WindowsPhone').animate({'opacity' : '1'},1000);
	$('#iOS').animate({'opacity' : '1'},1600);                                                                
});
