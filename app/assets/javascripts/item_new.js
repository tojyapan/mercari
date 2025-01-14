$(function(){

  function buildImage(loadedImageUrl){
    $('.iu-preview-box__text__delete').each(function () {
      counter++;
    });
    let html =
    `<li class="iu-preview-box">
      <figure class="iu-preview-box__image">
        <img src=${loadedImageUrl}>
      </figure>
      <div class="iu-preview-box__text">
        <a class="iu-preview-box__text__edit"><s>編集</s></a>
        <a class="iu-preview-box__text__delete" data-id="${counter}">削除</a>
      </div>
    </li>`
    return html
  };

  //画像が10個アップロードされたらドロップエリアを消す
  function hideDropArea(){
    if (images_array.length >= 10) {
      $(DropArea1).css({
        'display' : 'none'
      })
    }
    else {
      $(DropArea1).css({
        'display' : 'block'
      })
    }
  }

  let DropArea1 = '.iu-image__container__drop-area'
  let PreviewArea = '.iu-image__container__preview-area__images ul'
  let images_array = []
  let counter = 0

  //ドロップダウン投稿機能
  $(DropArea1).on({'dragenter dragover' :function(e){
      e.preventDefault();
    },
    'drop' :function(e){
      e.preventDefault();
      let images = e.originalEvent.dataTransfer.files;
      for (let i = 0; i < images.length; i++) { 
        images_array.push(images[i]);
        let fileReader = new FileReader();
        //読み込みが成功した時にfunctionを作動
        fileReader.onload = function(e) {
          //画像URLを取得
          let loadedImageUrl = e.target.result;
          //HTMLへ画像を代入
          $(buildImage(loadedImageUrl)).appendTo(PreviewArea).trigger('create');
        };
        //画像ファイルの読み込みを行う
        fileReader.readAsDataURL(images[i]);
      }
      hideDropArea();
    },
  });

  //クリック投稿機能
  $(DropArea1).on('change', 'input[type="file"]', function(e){
    e.preventDefault();
    let images = $(this).prop('files')
      for (let i = 0; i < images.length; i++) { 
        images_array.push(images[i]);
        let fileReader = new FileReader();
        fileReader.onload = function(e) {
        var loadedImageUrl = e.target.result;
        $(buildImage(loadedImageUrl)).appendTo(PreviewArea).trigger("create");
        };
        fileReader.readAsDataURL(images[i]);
      }
    hideDropArea();
  }),

  //プレビュー画像の削除機能
  //動的に追加された要素に対してはdocumentを指定して一旦全ページを読み込ませる
  $(document).on('click', '.iu-preview-box__text__delete', function(e){
    e.preventDefault();
    //clickした要素のdata-idを取得
    let index = $(this).data('id');
    //clickした要素のliがulのなかで何番目かを取得
    let array_number = $(this).parent().parent().index();
    //削除ボタンの親の親(li)を削除する
    $(`a[data-id='${index}']`).parent().parent().remove();
    //spliceメソッドで画像配列の中からarray_number番目の画像を1つ削除する
    images_array.splice(array_number, 1);
    //編集時に既存の画像に対してdestroyをつける
    $(`input[name='item[images_attributes][${index}][_destroy]']`).prop('checked', true)
    hideDropArea();
  });

  //商品出品機能
  $('#item-new').on('submit', function(e){
    e.preventDefault();
    let formData = new FormData($(this).get(0));
    images_array.forEach(function(image, i){
     formData.append(`item[images_attributes][${i}][image]`, image)
    });
    let url = $(this).attr('action')
    $.ajax({
      url:         url,
      type:        'POST',
      data:        formData,
      contentType: false,
      processData: false,
      dataType:   'html'
    })
    .done(function(data){
      window.location = '/'
    })
    .fail(function(){
      alert('出品に失敗しました！ページを更新してやり直してください');
    });
  })

  //商品編集機能
  $('#item-update').on('submit', function(e){
    e.preventDefault();
    let formData = new FormData($(this).get(0));
    //最後のdata-idを取得
    let index = parseInt($('.iu-preview-box__text__delete').last().attr('data-id'));
    images_array.forEach(function(image, i){
      formData.append(`item[images_attributes][${i + index + 1}][image]`, image)
    });
    let url = $(this).attr('action')
    $.ajax({
      url:         url,
      type:        'POST',
      data:        formData,
      contentType: false,
      processData: false,
      dataType:   'html'
    })
    .done(function(data){
      window.location = '/'
    })
    .fail(function(){
      alert('編集に失敗しました！ページを更新してやり直してください');
    });
  })
});