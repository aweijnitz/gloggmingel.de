$(function () {

    $('#xmoreInfoLink').click(function () {
        showInfo();
    });

    $('#xdismissLink').click(function () {
        hideInfo();
    });

    function showInfo() {
        $('.frontpage-container').hide(250);
        //$('.frontpage-container').fadeOut(150);

        $('.page-moreInfo').slideToggle( "medium", function() {
            // Animation complete.
        });
    }

    function hideInfo() {

        $('.page-moreInfo').slideToggle( "fast", function() {
            $('.frontpage-container').show(150);
            //$('.frontpage-container').fadeIn(250);
        });

    }

});
