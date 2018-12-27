$(function(){
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('a.confirmdeletion').on('click',function(e){
        if(!confirm('Confirm deletion')) return false;
    });
})