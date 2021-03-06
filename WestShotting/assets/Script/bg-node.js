/**
 * 背景图所挂载节点
 * @class bg-node
 * @constructor
 */

cc.Class({
    extends: cc.Component,

    properties: {
        backBgAry: [cc.Node],   //用于管理移动背景图片结点的数组
        backBgSpeed: 0.6,       //移动时控制速度的变量
        backBgErrorDistance: 10,//前景移动误差

        mountainBgAry: [cc.Node],
        mountainBgSpeed: 0.6,
        mountainBgErrorDistance: 10,

        frontBgAry: [cc.Node],
        frontBgSpeed: 0.6,
        frontBgErrorDistance: 10,

        westStreetUpBgAry: [cc.Node],
        westStreetUpBgSpeed: 0.6,
        westStreetUpBgErrorDistance: 10,

        westStreetDownBgAry: [cc.Node],
        westStreetDownBgSpeed: 0.6,
        westStreetDownBgErrorDistance: 10,


    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // let b = cc.find("Canvas/basic_point");
        // let b1 = cc.find("Canvas/basic_point1");
        // cc.log("1:", b1.getPosition());
        // b1.runAction(cc.flipX(true));
        // b1.setPosition(b.getPosition());
        // cc.log("2:", b1.getPosition());


        let canvasNode = cc.find("Canvas");

        //西部街区
        let westStreetDownBgAryLength = this.westStreetDownBgAry.length;
        let westStreetUpBgAryLength = this.westStreetUpBgAry.length;
        this.flipBg(this.westStreetUpBgAry);
        this.initMoveBgOriginX(this.westStreetUpBgAry);
        this.initMoveBgOriginX(this.westStreetDownBgAry);
        //西部街区底部
        this.westStreetDownBgFirstOriginX = this.westStreetDownBgAry[0].x;
        this.westStreetDownBgLastOriginX = this.westStreetDownBgAry[westStreetDownBgAryLength - 1].x;
        //西部街区上部
        this.westStreetUpBgFirstOriginX = this.westStreetUpBgAry[0].x;
        this.westStreetUpBgLastOriginX = this.westStreetUpBgAry[westStreetUpBgAryLength - 1].x;
    },

    update(dt) {
        //西部街区
        this.moveBg(this.westStreetDownBgAry, this.westStreetDownBgSpeed, this.westStreetDownBgFirstOriginX, this.westStreetDownBgLastOriginX, this.westStreetDownBgErrorDistance);
        this.moveBg(this.westStreetUpBgAry, this.westStreetUpBgSpeed, this.westStreetUpBgFirstOriginX, this.westStreetUpBgLastOriginX, this.westStreetUpBgErrorDistance);

    },

    /**
     * @method  翻转x轴
     * @param {Array} bgList 
     */
    flipBg(bgList) {
        let bgLen = bgList.length;
        for (let i = bgLen / 2; i < bgLen; i++) {
            bgList[i].runAction(cc.flipX(true));
        }
    },

    /**
     * @method 初始化移动背景原始横坐标
     * @param {Array} bgList  要移动的背景节点数组
     */
    initMoveBgOriginX(bgList) {
        let bgParent = bgList[0].parent;
        let firstBgWidget = bgList[0].getComponent(cc.Widget);
        let bgParentWidget = bgParent.getComponent(cc.Widget);

        //如果使用widget,应该立即更新，获取准确位置
        if (bgParentWidget) {
            bgParentWidget.updateAlignment();
        }
        if (firstBgWidget) {
            firstBgWidget.updateAlignment();
        }
        for (let i = 1; i < bgList.length; i++) {
            if (i === 1) {
                bgList[i].x = bgParent.width;
            }
            else {
                bgList[i].x = bgList[i - 1].x + bgList[i].width;
            }
            bgList[i].y = bgList[0].y;
        }
    },
    /**
     * @method 移动背景函数
     * @param {Array} bgList  要移动的背景节点数组
     * @param {Number} speed  移动的速度，值越大，移动越快
     * @param {Number} firstBgOriginX  第一张背景图初始横坐标
     * @param {Number} lastBgOriginX  最后一张背景图初始横坐标
     */
    moveBg(bgList, speed, firstBgOriginX, lastBgOriginX, errorDistancae) {
        let originX1 = firstBgOriginX;
        let originX2 = lastBgOriginX;
        let resetPos = originX2;
        let bgLimit = -bgList[0].width;  //这里需要注意，根据锚点的不同值可能不同。

        for (var i = 0; i < bgList.length; i++) {
            if (bgList[i].x <= bgLimit) {
                // cc.log(i);
                let nextIndex = i + 1;
                if (i === bgList.length - 1) {
                    nextIndex = 0;
                }
                let errorPos = originX1 - bgList[nextIndex].x;          //准备出框的与其紧接气候的误差
                bgList[i].x = resetPos - errorPos - errorDistancae;
            }
            bgList[i].x -= speed;
        }
    },

    start() {

    }

});
