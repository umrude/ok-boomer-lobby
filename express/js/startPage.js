$(() => {
  $(".start").click(() => {
    $(".startPage").addClass("hidden");
  });

  $("#opener").click(() => {
    $(".confirm").removeClass("hidden");
  });

  $("#cancel").click(() => {
    $(".confirm").addClass("hidden");
  });
});
