var _ = require('underscore');

function groupByParent(list) {
    var index = 0;
    var result = {};
    var parents = [];

    //根据每个节点的父几点分组
    _.each(list , function(item){
        var parent = item.parent();
        var dom = parent[0];

        //console.log(parent.attr('id'));

        var i=0,find_index;
        for(i=0;i<parents.length;i++) {
            if(parents[i] == dom) {
                find_index = i;
                //console.log(parent.attr('id')+" find.");
                break;
            }
            //console.log(parents[i].attr('id')+" find.");
        }

        if(find_index===undefined) {
            find_index = index;
            parents[find_index] = dom;
            result[find_index] = [];
            index++;
        }
        result[find_index].push(item);//.text().replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, ''));//.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, '')
    });

    //返回最多的节点集合
    var size = 1,max_array = [];
    _.each(result , function(array){
        if(array.length>size && getLinkDensityOfList(array)<0.5) {
            size = array.length;
            max_array = array;
        }
        //console.log(array.length);
    });
    //console.log(max_array);

    return filterP(max_array);
}

//过滤段落列表的开头段落和结尾段落
function filterP(list) {
    //去掉开头链接密度大的段落
    while(true) {
        var dom = list.shift();
        if(!dom) {
            break;
        }

        var density = getLinkDensity(dom);
        if(density ===undefined || density>0.8) {
            continue;
        }
        else {
            list.unshift(dom);
            break;
        }
    }

    //去掉末尾链接密度大的段落
    while(true) {
        var dom = list.pop();
        //console.log(dom);
        if(!dom) {
            break;
        }

        var density = getLinkDensity(dom);
        var all_text = dom.text().replace(/\s+/g, '');
        if(density ===undefined || density>0.8 || all_text.match(/(相关评论|相关新闻|相关专题)(:|：)?/)) {
            continue;
        }
        else {
            list.push(dom);
            //console.log(dom);
            break;
        }
    }

    var result = [];
    _.each(list , function(dom){
        result.push(dom.text().replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, ''));
    });
    //console.log(result);
    return result;
}

//计算一个节点的链接密度
function getLinkDensity(dom) {
    var all_text = dom.text().replace(/(\s+|>|<)/g, '');
    //console.log(all_text);

    var link_text = dom.find('a').text().replace(/(\s+|>|<)/g, '');
    //console.log(link_text);
    //console.log("====================");
    if(all_text.length==0) {
        return undefined;
    }
    else {
        return getBytesLength(link_text)/getBytesLength(all_text);
    }
}

//计算一个节点的链接密度
function getLinkDensityOfList(list) {
    var total_length = 0, link_length =0;
    _.each(list, function(dom){
        var all_text = dom.text().replace(/(\s+|>|<)/g, '');
        total_length += getBytesLength(all_text);
        //console.log(all_text);

        var link_text = dom.find('a').text().replace(/(\s+|>|<)/g, '');
        link_length += getBytesLength(link_text);
    });

    if(total_length==0) {
        return undefined;
    }
    else {
        return link_length/total_length;
    }
}

//过滤掉干扰的节点
function filterDom($, parent) {
    _.each(parent.children("div,span,ul,table,ol"), function(item){

        var dom = $(item);
        //console.log(dom[0].tagName);
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density ===undefined || density>0.8) {
            dom.remove();
        }
        else {
            filterDom($, dom);
        }
    })
}

function getBytesLength(string) {
    return string.replace(/[^\x00-\xff]/gi, "--").length;
}

function getTitle($) {
    //var title = "";
    var list = $('h1,h2,h3,h4,h5,div[class*="title"],div[class*="Title"],div[id*="Title"],span.title,span#title,'),dom;
    //console.log(list.length);
    for(var i=0; i< list.length; i++) {
        dom = $(list[i]);

        var title = dom.text().trim();

        //console.log(dom.html());
        //console.log($('title').text().indexOf(dom.text()));
        //判断是否是标题
        if(title.length>0 && $('title').text().indexOf(title)>=0) {
            //console.log($('title').text());
            return title;
        }
    }
    return "";//console.log('title');
}

function stringCount(string, pattern) {
    var match = string.match(pattern);
    if(match) {
        return match.length;
    }
    else {
        return 0;
    }
}

function getContentByList($) {
    var text_dom = undefined;
    //根据正文分析
    $("div,span").filter(function(index){
         return $('span,div,table', this).length == 0;
    }).each(function(){
        var dom = $(this);
        //console.log(dom.html());
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density !==undefined && density<0.3) {
            //console.log(dom.html());
            var size = 0;
            var cc = stringCount(dom.html(), /<br \/>/g);
            if(cc>size) {
                text_dom = dom;
                size = cc;
            }
        }
    });

    //console.log(text_dom.html().split(/<br \/>/));
    var list = [];
    if(text_dom) {
        _.each(text_dom.html().split(/<br \/>/), function(item){
            var html = item.trim();
            if(html.length>0) {
                //console.log(html);
                list.push($('<p></p>').html(html));
            }
        })
    }
    //return [];

    return filterP(list);
}

//第三种识别方式
function getContentByAttr($) {
    var text_dom = undefined;
    //根据正文分析
    $("div[id*='content']").each(function(){
        var dom = $(this);
        //console.log(dom.html());
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density !==undefined && density<0.3) {
            //console.log(dom.html());
            var size = 0;
            var cc = stringCount(dom.html(), /<br \/>/g);
            if(cc>size) {
                text_dom = dom;
                size = cc;
            }
        }
    });

    //console.log(text_dom.html().split(/<br \/>/));
    var list = [];
    if(text_dom) {
        _.each(text_dom.html().split(/<br \/>/), function(item){
            var html = item.trim();
            if(html.length>0) {
                //console.log(html);
                list.push($('<p></p>').html(html));
            }
        })
    }
    //return [];

    return filterP(list);
}

exports.match = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {title:"", content:""};

        $("script,style,iframe,NOSCRIPT,input,label,textarea,form").remove();
        //filterDom($, $('body'));
        //console.log($('body').html());

        //分析标题
        out.title = getTitle($);

        var list = [];
        $("p").each(function(){
            var dom = $(this);
            list.push(dom);
        });

        //先按照段落法分析
        var plist = groupByParent(list);
        var content1 = groupByParent(list).join("\r\n");
        var content2 = getContentByList($).join("\r\n");
        //var content3 = getContentByAttr($).join("\r\n");
        //console.log(content3);
        if(content1.length>content2.length) {
            out.content = content1;// > content3.length ? content1 : content3;
        }
        else {
            out.content = content2;// > content3.length ? content2 : content3;
        }
        /*
        if(plist.length>=2) {
            out.content = groupByParent(list).join("\r\n");
        }
        else {
            out.content = getContentByList($).join("\r\n");
        }
        */
        //console.log(out.content);
        cb( null, out );
    }catch(e){
        console.log(e);
        cb( e.toString() );
    }
};
