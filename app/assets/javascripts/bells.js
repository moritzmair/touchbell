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

  //reload every 20 min
  setTimeout(function(){
    window.location.reload(1);
  }, 1000*60*20);

});

function ringring(id){
  var success = false
  $('#bell'+id).modal('hide');
  $('#request_send').modal('show');
  $('.alert').html('request send')
  $.get( "/ringring/"+id, function( data ) {
    success = true
    $('#ring_info').html('Klingel wurde erfolgreich ausgelöst.')
  });
  setTimeout(function(){
    if(success){
      hide_requst_modal();
    }else{
      $('#ring_info').html('Klingel konnte nicht ausgelöst werden.')
      setTimeout(function(){
        hide_requst_modal();
      }, 5000);
    }
    
  }, 5000);
}

function hide_requst_modal(){
  $('#request_send').modal('hide'); reset();
}

function reset(){
  $('#ring_info').html('...')
}