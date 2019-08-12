function triggerFileListButton (type, el) {
  $('#fileSuccessAlert').toggle(false)
  $('#fileErrorAlert').toggle(false)

  var href = el.dataset.href
  switch (type) {
    case 'delete': {
      $('#deleteFileName').text(href)
      $('#deleteFile').modal('toggle')
      window.confirmDeleteFile = function () {
        window.confirmDeleteFile = false
        $.ajax({
          url: href,
          method: 'DELETE',
          success: function () {
            $('#deleteFile').modal('toggle')
            $('#fileSuccessAlert')
              .html('操作成功')
              .toggle(true)
          },
          error: function (_1, _2, ee) {
            $('#deleteFile').modal('toggle')
            $('#fileErrorAlert')
              .html('删除&nbsp;<b>' + href + '</b>&nbsp;失败：' + ee)
              .toggle(true)
          }
        })
      }

    }
      break
  }
  console.log(type, el.dataset.href)
}
