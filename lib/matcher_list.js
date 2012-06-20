var _ = require('underscore');

exports.match = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var list = [];
        setTimeout(function(){
            $("script,style,iframe,NOSCRIPT,input,textarea,select,label").remove();

            $(data.config.path).each(function(){
                var dom = $(this);
                //console.log(dom.attr('href'));

                var href = dom.attr('href');
                if(href) {
                    list.push(href);
                }
            });
            //console.log($('#d_list').html());


            cb( null, {list:_.uniq(list)} );
        },2000);
    }catch(e){
        console.log(e);
        cb( e.toString() );
    }
};
