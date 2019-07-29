// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

const RELOAD_TIME = 1000 * 60 * 20; // 20 min

const $bells = new Map();
let $ringInfo = null;
let $requestSend = null;

$(document).ready(function() {
  $ringInfo = $('#ring_info');
  $requestSend = $('#request_send');

  $(".modal").on('show.bs.modal', function () {
    $('.blur').addClass('blur_active');
  });

  $(".modal").on('hide.bs.modal', function () {
    $('.blur').removeClass('blur_active');
  });

  document.ontouchmove = function (e) {
    e.preventDefault();
  }

  //reload every {RELOAD_TIME}
  setTimeout(function() {
    window.location.reload(1);
  }, RELOAD_TIME);
});

function ringring(id) {
  // get get bell from cache
  // if exist
  const $bell = $bells.has(id)
    ? $bells.get(id)
    : $(`#bell${id}`);

  // update bell in cache
  $bells.set(id, $bell)

  $.ajax({
    method: 'GET',
    url: `/ringring/${id}`,
    beforeSend: () => {
      $bell.modal('hide');
      $requestSend.modal('show');
      $('.alert').html('request send');
    },
    success: () => {
      $ringInfo.html('Klingel wurde erfolgreich ausgelöst.');
    },
    error: () => {
      $ringInfo.html('Klingel konnte nicht ausgelöst werden.');
    },
    complete: () => {
      setTimeout(function() {
        hide_requst_modal();
      }, 5000);
    },
  });
}

function hide_requst_modal() {
  $requestSend.modal('hide');
  reset();
}

function reset() {
  $ringInfo.html('...')
}
