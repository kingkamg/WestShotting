cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        prefab: cc.Prefab,
        singleItem: cc.Node,
        loading: cc.Node,
        landPrefab: cc.Prefab,
        landContent: cc.Node
    },

    start() {
        let _self = this;
        wx.onMessage(data => {
            console.log("onMessage from master");
            if (data.messageType === 1) {                     //获取好友排行
                _self.getFriendStorage(data.keyValue);
            }
            else if (data.messageType === 2) {                //提交数据
                _self.submitScore(data.keyValue, data.score);
            }
            else if (data.messageType === 3) {                //获取好友群排行
                _self.getGroupFriendData(data.keyValue);
                console.log("onMessage from master get group");
            }
            else if (data.messageType === 4) {                //获取好友群排行
                _self.getLastAndNextFriend(data.keyValue);
                console.log("getLastAndNextFriend");
            }
        });


    },
    removeOriginRecore() {
        this.content.removeAllChildren();
        this.singleItem.removeAllChildren();
        this.landContent.removeAllChildren();
        this.loading.active = true;
    },
    getMyUserInfo() {
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: function (res) {
                console.log('wx.getUserInfo success', res.data)
            },
            fail: function (res) {
                reject("fail: ", res)
            }
        })
    },
    //获取好友数据
    getFriendStorage(keyValue) {
        this.removeOriginRecore();
        let _self = this;
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: function (userRes) {
                let userData = userRes.data[0];
                console.log('getMyUserInfo success:', userData);

                wx.getFriendCloudStorage({
                    keyList: [keyValue],
                    success: function (res) {
                        _self.loading.active = false;
                        let data = res.data;
                        data.sort((a, b) => {
                            if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                return 0;
                            }
                            if (a.KVDataList.length == 0) {
                                return 1;
                            }
                            if (b.KVDataList.length == 0) {
                                return -1;
                            }
                            return b.KVDataList[0].value - a.KVDataList[0].value;
                        });

                        console.log("data:", data);
                        // 下面代码为实际需要运行代码
                        for (let i = 0; i < data.length; i++) {
                            let friend = data[i];
                            if (!_self.preSettingData(i, friend, ' stop getting friends\' infos')) {
                                return;
                            }

                            //添加个人数据
                            if (friend.avatarUrl == userData.avatarUrl) {
                                console.log("添加个人数据");
                                _self.showUserData(i, friend.nickname, friend.avatarUrl, friend.KVDataList, false);
                            }
                        }

                        //下面的代码为测试拖动是否合理代码，实际不需要执行。将removeOriginRecore()关闭，即可测试拖动是否合理。
                        // for (let i = 0; i < 10; i++) {
                        //     _self.showUserData(i, userData.nickName, userData.avatarUrl, userData.KVDataList);
                        // }
                    },
                    fail: function (res) {
                        console.log(res);
                    }
                });
            },
            fail: function () {
                console.log("getUserInfo fail");
            }

        })
    },
    preSettingData(rank, user, str, isLandScape = false) {
        if (!user) {
            console.log("preSettingData", str);
            return false;
        }
        if (user.KVDataList.length === 0) {
            console.log("user.KVDataList.length = 0 is", user);
            return false;
        }
        console.log("userInfo:", user);
        if (isLandScape) {
            console.log("isLandScape");
            this.showLandUserData(rank, user.nickname, user.avatarUrl, user.KVDataList);
        }
        else {
            this.showUserData(rank, user.nickname, user.avatarUrl, user.KVDataList);
        }
        return true;
    },
    showUserData(rank, nickName, avatarUrl, KVDataList, InContentNode = true) {
        let node = cc.instantiate(this.prefab);
        let userNameNode = node.getChildByName('userName');
        let userName = userNameNode.getComponent(cc.Label);
        let userHeadMask = node.getChildByName('mask');
        let userIcon = userHeadMask.getChildByName("userIcon").getComponent(cc.Sprite);
        let scoreNode = node.getChildByName("score");
        let score = scoreNode.getComponent(cc.Label);
        let rankNode = node.getChildByName("rankNode");
        let rankIcon = rankNode.getChildByName("rankingIcon");
        let rankLabel = rankNode.getChildByName("rankingLabel");
        rankIcon.enabled = false;
        rankLabel.enabled = false;

        let rankItemBg = node.getChildByName("bg_node").getChildByName("item_bg");

        //当最后一个参数为false时，添加到最后。为单个显示。
        if (!InContentNode) {
            node.parent = this.singleItem;
            node.setPosition(cc.v2(5, -13));
            console.log("node position:", node.position);

            //重置单人布局
            let rankNodePos = rankNode.getPosition();
            //排名，头像
            rankNode.setPosition(cc.v2(rankNodePos.x + 125, rankNodePos.y));
            userHeadMask.setPosition(cc.v2(rankNodePos.x + 225, rankNodePos.y));

            //分数和名字
            let userNamePos = userNameNode.getPosition();
            userNameNode.setPosition(cc.v2(userNamePos.x + 50, userNamePos.y + 20));
            scoreNode.setPosition(cc.v2(userNamePos.x + 50, userNamePos.y - 20));

            rankItemBg.active = false;
        }
        else {
            node.parent = this.content;
        }


        // let item_bg = node.getChildByName("item_bg");
        switch (rank) {
            case 0:
                rankIcon.active = true;
                rankIcon.getChildByName("gold").active = true;
                break;
            case 1:
                rankIcon.active = true;
                rankIcon.getChildByName("silver").active = true;
                break;
            case 2:
                rankIcon.active = true;
                rankIcon.getChildByName("copper").active = true;
                break;
        }
        if (rank > 2) {
            rankLabel.active = true;
            let rankValue = rankLabel.getComponent(cc.Label);
            rankValue.string = rank + 1;
        }

        userName.string = nickName;

        if (KVDataList) {
            console.log("KVDataList:", KVDataList);
            console.log("KVDataList[0]:", KVDataList[0]);         //{key: "score", value: "123123"}
            console.log("KVDataList[0]:", KVDataList[0].value);  //123123
            score.string = '' + KVDataList[0].value;
        }
        console.log(nickName + '\'s info has been getten.');
        cc.loader.load({
            url: avatarUrl, type: 'png'
        }, (err, texture) => {
            if (err) console.error(err);
            console.log(texture);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    //展示横向数据
    showLandUserData(rank, nickName, avatarUrl, KVDataList) {
        console.log("123123123123");
        let node = cc.instantiate(this.landPrefab);
        let userName = node.getChildByName('name').getComponent(cc.Label);
        let userIcon = node.getChildByName('mask').getChildByName("userIcon").getComponent(cc.Sprite);
        let score = node.getChildByName("score").getComponent(cc.Label);
        let rankLabel = node.getChildByName("rank_val").getComponent(cc.Label);
        node.parent = this.landContent;

        let rankValue = rankLabel.getComponent(cc.Label);
        rankValue.string = rank + 1;
        userName.string = nickName;

        if (KVDataList) {
            // console.log("KVDataList:", KVDataList);
            // console.log("KVDataList[0]:", KVDataList[0]);         //{key: "score", value: "123123"}
            // console.log("KVDataList[0]:", KVDataList[0].value);  //123123
            score.string = '' + KVDataList[0].value;
        }
        console.log(nickName + '\'s info has been getten.');
        cc.loader.load({
            url: avatarUrl, type: 'png'
        }, (err, texture) => {
            if (err) console.error(err);
            console.log(texture);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    //提交数据
    submitScore(keyValue, score) { //提交得分
        console.log("this is submitScore");
        wx.getUserCloudStorage({
            // 以key/value形式存储
            keyList: [keyValue],
            success: function (getres) {
                console.log('getUserCloudStorage', 'success', getres)
                if (getres.KVDataList.length != 0) {
                    if (getres.KVDataList[0].value > score) {
                        return;
                    }
                }
                // 对用户托管数据进行写数据操作
                wx.setUserCloudStorage({
                    KVDataList: [{ key: keyValue, value: "" + score }],
                    success: function (res) {
                        console.log('setUserCloudStorage', 'success', res)
                    },
                    fail: function (res) {
                        console.log('setUserCloudStorage', 'fail')
                    },
                    complete: function (res) {
                        console.log('setUserCloudStorage', 'complete')
                    }
                });
            },
            fail: function (res) {
                console.log('getUserCloudStorage', 'fail')
            },
            complete: function (res) {
                console.log('getUserCloudStorage', 'ok')
            }
        });
    },

    //横向排行榜（3人）
    getLastAndNextFriend(keyValue) {
        this.removeOriginRecore();
        let _self = this;
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: function (userRes) {
                let userData = userRes.data[0];
                wx.getFriendCloudStorage({
                    keyList: [keyValue],
                    success: function (res) {
                        _self.loading.active = false;
                        let data = res.data;
                        //分数排序
                        data.sort((a, b) => {
                            if (a.KVDataList.length === 0 && b.KVDataList.length == 0) {
                                return 0;
                            }
                            if (a.KVDataList.length === 0) {
                                return 1;
                            }
                            if (b.KVDataList.length === 0) {
                                return -1;
                            }
                            return b.KVDataList[0].value - a.KVDataList[0].value;
                        });
                        for (let i = 0; i < data.length; i++) {
                            let friend = data[i];
                            if (friend.avatarUrl === userData.avatarUrl) {
                                // if (i !== 0) {
                                //     _self.showLandUserData(i - 1, data[i - 1].nickname, data[i - 1].avatarUrl, data[i - 1].KVDataList);
                                // }
                                // _self.showLandUserData(i, data[i].nickname, data[i].avatarUrl, data[i].KVDataList);
                                // if (i !== data.length - 1) {
                                //     _self.showLandUserData(i + 1, data[i + 1].nickname, data[i + 1].avatarUrl, data[i + 1].KVDataList);
                                // }


                                let randIndex1 = 0;
                                let randIndex2 = 0;
                                let randIndex3 = 0;

                                if (i === 0) {
                                    randIndex1 = i;
                                    randIndex2 = i + 1;
                                    randIndex3 = i + 2;
                                }
                                else if (i !== data.length - 1) {
                                    randIndex1 = i - 2;
                                    randIndex2 = i - 1;
                                    randIndex3 = i;
                                }
                                else {
                                    randIndex1 = i - 1;
                                    randIndex2 = i;
                                    randIndex3 = i + 1;

                                }
                                if (!_self.preSettingData(randIndex1, data[randIndex1], ' stop getting friends\' infos', true)) {
                                    return;
                                }
                                if (!_self.preSettingData(randIndex2, data[randIndex2], ' stop getting friends\' infos', true)) {
                                    return;
                                }
                                if (!_self.preSettingData(randIndex3, data[randIndex3], ' stop getting friends\' infos', true)) {
                                    return;
                                }

                            }
                        }
                    },
                    fail: function (res) {
                        console.log(res);
                    }
                });
            },
            fail: function () {
                console.log("getUserInfo fail");
            }
        })

    },

    //获取好友群信息
    getGroupFriendData(keyValue, shareTicket) {
        console.log("getGroupFriendData running");
        this.removeOriginRecore();
        let _self = this;
        // this.rankingScrollView.node.active = true;
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: (userRes) => {
                console.log('getUserInfo success', userRes.data);
                let userData = userRes.data[0];
                //取出所有好友数据
                wx.getGroupCloudStorage({
                    shareTicket: shareTicket,
                    keyList: [keyValue],
                    success: res => {
                        console.log("wx.getGroupCloudStorage success", res);
                        // this.loadingLabel.active = false;
                        let data = res.data;
                        data.sort((a, b) => {
                            if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                return 0;
                            }
                            if (a.KVDataList.length == 0) {
                                return 1;
                            }
                            if (b.KVDataList.length == 0) {
                                return -1;
                            }
                            return b.KVDataList[0].value - a.KVDataList[0].value;
                        });
                        for (let i = 0; i < data.length; i++) {
                            let playerInfo = data[i];
                            if (!_self.preSettingData(i, playerInfo, ' stop getting friends\' infos')) {
                                return;
                            }

                            //添加个人数据
                            if (playerInfo.avatarUrl == userData.avatarUrl) {
                                console.log("添加个人数据");
                                _self.showUserData(i, friend.nickname, friend.avatarUrl, friend.KVDataList, false);
                            }
                        }
                    },
                    fail: res => {
                        console.log("wx.getFriendCloudStorage fail", res);
                        console.log("数据加载失败，请检测网络，谢谢");
                        // this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";

                    },
                });
            },
            fail: (res) => {
                console.log("数据加载失败，请检测网络，谢谢");
                // this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
            }
        });
    },
    testScollView() {
        // if (data.nickName && data.avatarUrl) {
        //     // _self.showUserData(data.nickName, data.avatarUrl);
        //     // fill the content by the blank targets.
        //     // (function () {
        //     //     for (let i = 0; i < 5; i++) {
        //     //         let node = cc.instantiate(_self.prefab);
        //     //         node.parent = _self.content;
        //     //     }
        //     // })();
        // };
    }
});
