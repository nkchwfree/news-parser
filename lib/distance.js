/**
* 字符串编辑距离
*
* 这是一种字符串之间相似度计算的方法。
* 给定字符串S、T，将S转换T所需要的插入、删除、替代操作的数量叫做S到T的编辑路径。
* 其中最短的路径叫做编辑距离。
*
* 这里使用了一种动态规划的思想求编辑距离。
*
* @author heartraid
*
*/

function stringToArray(str) {
    return str.split(/(\s+|-|_|\||:|：)+/);
}

function stringEditDistance(strX, strY) {
    var charArrayX = stringToArray(strX);
    var charArrayY = stringToArray(strY);

    /**
      * 得到编辑距离
      * @return 编辑距离
      */
    return editDistance(charArrayX.length-1,charArrayY.length-1);

    /**
      * 动态规划解决编辑距离
      *
      * editDistance(i,j)表示字符串X中[0.... i]的子串 Xi 到字符串Y中[0....j]的子串Y1的编辑距离。
      *
      * @param i 字符串X第i个字符
      * @param j 字符串Y第j个字符
      * @return 字符串X(0...i)与字符串Y(0...j)的编辑距离
      */
    function editDistance(i, j){
        if(i==0&&j==0){
            //System.out.println("edit["+i+","+j+"]="+isModify(i,j));
            return isModify(i,j);
        }
        else if(i==0||j==0){
            if(j>0){
                //console.log("edit["+i+","+j+"]=edit["+i+","+(j-1)+"]+1");
                if(isModify(i,j) == 0) {
                    return j;
                }
                return editDistance(i, j-1) + 1;
            }
            else{
                //System.out.println("edit["+i+","+j+"]=edit["+(i-1)+","+j+"]+1");
                if(isModify(i,j) == 0) {
                    return i;
                }
                return editDistance(i-1,j)+1;
            }
        }
        else {
            //System.out.println("edit["+i+","+j+"]=min( edit["+(i-1)+","+j+"]+1,edit["+i+","+(j-1)+"]+1,edit["+(i-1)+","+(j-1)+"]+isModify("+i+","+j+")");
            var ccc=minDistance(editDistance(i-1,j)+1,editDistance(i,j-1)+1,editDistance(i-1,j-1)+isModify(i,j));
            return ccc;
         }
     }

    /**
      * 求最小值
      * @param disa 编辑距离a
      * @param disb 编辑距离b
      * @param disc 编辑距离c
      */
    function minDistance(disa, disb, disc){
        var dismin = Number.MAX_VALUE;
        if(dismin>disa) {
            dismin=disa;
        }
        if(dismin>disb) {
            dismin=disb;
        }
        if(dismin>disc) {
            dismin=disc;
        }
        return dismin;
    }

    /**
      * 单字符间是否替换
      *
      * isModify(i,j)表示X中第i个字符x(i)转换到Y中第j个字符y(j)所需要的操作次数。
      * 如果x(i)==y(j)，则不需要任何操作isModify(i, j)=0； 否则，需要替换操作，isModify(i, j)=1。
      * @param i 字符串X第i个字符
      * @param j 字符串Y第j个字符
      * @return 需要替换，返回1；否则，返回0
      */
    function isModify(i,j){
        return charArrayX[i]==charArrayY[j] ? 0 : 1;
     }
}

//var a="湖南高校职称评委开房收钱续:官员回应是个别现象";
//var b='湖南高校职称评委开房收钱续:官员回应是个别现象';
//console.log(stringEditDistance(a, b));

exports.stringEditDistance = stringEditDistance;