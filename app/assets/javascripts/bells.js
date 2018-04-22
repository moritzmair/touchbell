// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function(){

  $(".modal").on('show.bs.modal', function () {
    $('.blur').addClass('blur_active');
  });

  $(".modal").on('hide.bs.modal', function () {
    $('.blur').removeClass('blur_active');
  });

  document.ontouchmove = function (e) {
    e.preventDefault();
  }
  
});

function ringring(id){
  $.get( "/ringring/"+id, function( data ) {
    $('#bell'+id).modal('hide');
  });
}