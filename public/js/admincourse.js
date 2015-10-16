$(document).ready(function(){
	$('a').tooltip();
	$('.form-sub-add').submit(function(e){
		var err = 0;
		if($('#coursename').val().length == 0){
			$('#coursename').parent().append('<center><p class="error">Error! Please enter course name.</p></center>');
			err = 1;
		}
		else{
			$('#username').siblings('center').slideUp(300);
		}

		if($('#courseslug').val().length == 0){
			$('#courseslug').parent().append('<center><p class="error">Error! Please enter a unique course slug.</p></center>');
			err = 1;
		}
		else{
			$('#courseslug').siblings('center').slideUp(300);
		}

		if(err==1){
			return false;
		}
	});
});

$(window).load(function () {
	$('#TheHeading').animate({'opacity' : '1'},200);
	$('#TheHeading2').animate({'opacity' : '1'},200);
	$('#TheTagline').animate({'opacity' : '1'},900);
	$('#TheMobileLinks').animate({'opacity' : '1'},900);
	$('#TheLogo').animate({'opacity' : '1'},750);
	$('#TheLogo2').animate({'opacity' : '1'},950);
	$('#TheLogo3').animate({'opacity' : '1'},1150);
});