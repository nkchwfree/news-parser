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
        if(density ===undefined || density>0.8 || all_text.match(/(相关评论|相关新闻|相关专题|推荐新闻)(:|：)?/)) {
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
    var pattern = /(\s+|>|<|\||·|,|，|-|｜|】|【)/g;
    var all_text = dom.text().replace(pattern, '');
    //console.log(all_text);

    var link_text = dom.find('a').text().replace(pattern, '');
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
function filterDom($) {
    var text
    while(true) {
        //过滤前的内容
        text = $('body').text();

        //去掉ul链接列表
        $('span').filter(function(index){
            var dom = $(this);
            var density = getLinkDensity($(this));
            //return $(this).text().replace(/\s/g,"")==$('a', this).text().replace(/\s/g,"");
            //console.log(density);
            //console.log($(this).html());
            //console.log('+++++++++++++++++++++');
            if(density && density==1) {
                $('a', this).insertAfter(dom);
                dom.remove();
            }
        });//.remove();

        //去掉ul链接列表
        $('table,ul,div,ol').filter(function(index){
            var dom = $(this);
            var tagName = dom[0].tagName;
            var text = dom.text();

            if(dom.find('span,div,p,td').length==0 && text.match(/All Rights? Reserved/i)) {
                return true;
            }

            if(tagName!='P') {
                var density = getLinkDensity(dom);
                //return $(this).text().replace(/\s/g,"")==$('a', this).text().replace(/\s/g,"");
                return (density && density>0.9);
            }

            return false;
        }).remove();

        //去掉空标签
        $('div,span,table,ul,p').filter(function(index){
            return $(this).text().trim().length==0;
        }).remove();

        $('#footer,.footer').remove();

        if(text == $('body').text()) {
            break;
        }
    }
}

function getBytesLength(string) {
    return string.replace(/[^\x00-\xff]/gi, "--").length;
}

function getTitle($) {
    function _trim_title_tail(title) {
        return title.replace(/[_\|].+?$/,"").replace(/(\(\d+\))$/,"");
    }

    function _filter_dom(dom) {
        var self = $(dom);
        var id = self.attr('id') || "";
        var class_name = self.attr('class') || "";
        var pattern = /(title|main|headline|tit|text|tt|bt|h1|ReportIDname|xinlanwz)/i;
        if(self[0].tagName.match(/^h\d/i) || id.match(pattern) || class_name.match(pattern) || self.css('font-family')=='黑体' || self.css('font-weight')=='bold') {
            return true;
        }
        else if(self.find('font:first').length==1) {
            //console.log(self.find('font:first').text());
            return _filter_dom(self.find('font:first'));
        }
        else {
            return false;
        }
    }

    var list = $('h1,h2,h3,h4,h5,div,span,p,td').filter(function(index){
        return _filter_dom(this);
    })
    var dom;
    //console.log(list.length);
    var page_title = _trim_title_tail($('title').text());
    //console.log("<"+page_title+">");

    var match_list = [''];
    for(var i=0; i< list.length; i++) {
        dom = $(list[i]);

        var title = _trim_title_tail(dom.text().trim());

        //console.log(dom.html());
        //console.log("|"+title+"|");

        //判断是否是标题
        if(title.length>0 ) {
            if($('title').text().indexOf(title)>=0) {
                match_list.push(title);
            }
        }
    }

    //console.log(match_list);
    return getBestContent(match_list);//console.log('title');
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
    var size = 0;
    //根据正文分析
    $("div,span,td,p").filter(function(index){
        var dom = $(this);
        var id = dom.attr('id') || "";
        var class_name = dom.attr('class') || "";
        var pattern = /(foot)/;
        //console.log(class_name);
        //return dom.text().trim().length>0;
        return $('div,table', this).text().trim().length == 0 && !id.match(pattern) && !class_name.match(pattern);
    }).each(function(){
        var dom = $(this);
        //console.log('----------------------------------------');
        //console.log(dom.html());
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density !==undefined && density<0.3) {
            //console.log(dom.html());

            var cc = stringCount(dom.html(), /<br \/>/g);
            //console.log(density);
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
    $("div[id*='content'],div[class='concent']").each(function(){
        var dom = $(this);
        console.log(dom.html());
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

function getBestContent(list) {
    var length = 0,index=0;
    for(var i=0; i<list.length; i++) {
        if(list[i].length>length) {
            length = list[i].length;
            index = i;
        }
    }
    return list[index];
}

exports.match = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {title:"", content:""};

        $("script,style,iframe,NOSCRIPT,input,label,textarea,form").remove();
        filterDom($, $('body'));
        //console.log($('body').html());

        /*var index = 1;
        $("body").children().each(function(){
            console.log("-----------");
            console.log(index);
            console.log($(this).html());
            index++;
        });*/

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
        out.content = getBestContent([content1, content2]);
        cb( null, out );
    }catch(e){
        console.log(e);
        cb( e.toString() );
    }
};
