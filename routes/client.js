var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var { mysqlPoolQuery } = require('../connection/mysql.js')

// 將註冊的ID新增至資料庫裡
router.post('/register', function(req, res) {
    // post的狀況form裡面的值要從body撈
    game_id = req.body.game_id;
    group_id = req.body.group_id;
    mysqlPoolQuery('INSERT INTO group_info VALUE (?, ?, ?, ?, ?)', [group_id, game_id, 0, 1, 0], function(err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "新增組別失敗(請換一個名字嘗試)" });
        } else {
            console.log("新增組別成功");
            return res.status(200).json({ success: true, message: "" });
        }
    });
});

router.get('/get_all_group', function(req, res, next) {
    game_id = req.query.game_id;
    mysqlPoolQuery('SELECT group_id FROM group_info WHERE game_id = ?', [game_id], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
        } else {
            console.log("讀取資料庫成功")
            json_data = JSON.parse(JSON.stringify(result));
            // 回傳值是一array, 使用json_data[i].group_id取值
            console.log(json_data);
            let groupArr = [];
            for (const iterator of json_data) {
                groupArr.push(iterator.group_id);
            }
            // groupArr是一陣列，用groupArr[i]取值
            console.log(groupArr);
            // 回傳json
            return res.status(200).json({ success: true, message: groupArr });
        }
    });
})


function check_buy_ship(fish_count, ship_count) {
    if (fish_count >= 6 && ship_count < 4) {
        return 1;
    } else {
        return 0;
    }
}

router.get('/check_buy_ship', function(req, res) {
    //get的狀況form裡面的值要從query撈
    let game_id = req.query.game_id;
    let group_id = req.query.group_id;
    mysqlPoolQuery('SELECT fish_count, ship_count FROM group_info WHERE game_id=? AND group_id=?', [game_id, group_id], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
        } else {
            console.log("讀取資料庫成功")
            json_data = JSON.parse(JSON.stringify(result));
            let check_buy_ship_result;
            check_buy_ship_result = check_buy_ship(json_data[0].fish_count, json_data[0].ship_count)
                // 回傳json
            return res.status(200).json({ success: true, message: { 'check_buy_ship': check_buy_ship_result } });
            //回傳值直接渲染ejs
            console.log(json_data);
            res.render('users', {
                users: json_data
            });
        }
    });
});

// 將買船的決定傳到資料庫並更新現有船數(固定+1)
router.post('/buy_ship', function(req, res) {
    //post的狀況form裡面的值要從body撈
    game_id = req.body.game_id;
    group_id = req.body.group_id;
    round = req.body.round;
    buy_or_not = req.body.buy_or_not;
    ship_count = req.body.ship_count;

    let ship_delta = (buy_or_not == 1) ? 1 : 0;

    // 記錄買船


    mysqlPoolQuery('INSERT INTO group_ship_record (game_id, group_id, round, buy_or_not, ship_delta) \
                      VALUE (?, ?, ?, ?, ?)', [game_id, group_id, round, buy_or_not, ship_delta], function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("買船記錄成功")
        }
    });

    // 更新船數 & 回傳最大捕魚量 (怪：程式順序會先執行此查詢)
    if (buy_or_not == 1) {
        mysqlPoolQuery('UPDATE group_info \
                      SET ship_count = ship_count + 1 , fish_count = fish_count - 6 \
                      WHERE game_id = ? AND group_id = ? ', [game_id, group_id], function(err) {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false, message: "買船失敗，請重新嘗試" });
            } else {
                console.log("買船成功");
                ship_count = parseInt(ship_count)
                max_buy_fish = (ship_count + 1) * 5;
                console.log("現在最多可以買" + max_buy_fish + "條魚");
                return res.status(200).json({ success: true, message: max_buy_fish });
            }
        });
    } else {
        console.log("沒有買船");
        max_buy_fish = ship_count * 5;
        console.log("現在最多可以買" + max_buy_fish + "條魚");
        return res.status(200).json({ success: true, message: max_buy_fish });
    };
});

router.get('/catch_fish', async function(req, res, next) {
    var group_id = req.query.group_id;
    var game_id = req.query.game_id;
    var round = req.query.round;
    var decision = req.query.decision;
    var fish_delta = req.query.fish_delta;
    var max_buy_fish = req.query.max_buy_fish;

    fish_delta = parseInt(fish_delta);

    // get current group fish count
    function get_fish_count(group_id, game_id) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT fish_count FROM group_info WHERE group_id = ? AND game_id = ?', [group_id, game_id], function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    if (result.length) {
                        json_data = JSON.parse(JSON.stringify(result));
                        fish_count = json_data[0].fish_count;
                        fish_count = parseInt(fish_count);
                        resolve(fish_count);
                    } else {
                        res.status(400).json({ success: false, message: '查無資料' })
                    }
                }
            });
        });
    }
    // get current total fish in ocean
    function get_fish_total(game_id) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT fish_total FROM ocean WHERE game_id = ?', [game_id], function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    if (result.length) {
                        json_data = JSON.parse(JSON.stringify(result));
                        fish_total = json_data[0].fish_total;
                        fish_total = parseInt(fish_total);
                        resolve(fish_total);
                    } else {
                        res.status(400).json({ success: false, message: '查無資料' })
                    }
                }
            });
        })
    }

    // update status
    function update_status(group_id) {
        mysqlPoolQuery('UPDATE group_info SET status = 0 WHERE group_id = ?', [group_id], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                if (result) {
                    json_data = JSON.parse(JSON.stringify(result));
                } else {
                    res.status(400).json({ success: false, message: '查無資料' })
                }
            }
        });

    };

    function get_ship_count(group_id, game_id){
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT ship_count FROM group_info WHERE game_id = ? AND group_id = ?', [game_id, group_id], function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    if (result.length) {
                        json_data = JSON.parse(JSON.stringify(result));
                        ship_count = json_data[0].ship_count;
                        resolve(ship_count);
                    } else {
                        res.status(400).json({ success: false, message: '查無資料' })
                    }
                }
            });
        })
    }

    async function dock_fee(group_id, game_id){
        ship_count = await get_ship_count(group_id, game_id);
        fee = ship_count*1;
        mysqlPoolQuery('UPDATE group_info SET fish_count = fish_count- ?  WHERE game_id = ? AND group_id = ?', [fee, game_id, group_id], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                    console.log('付錢成功');
                }
        });
    };


    fish_count = await get_fish_count(group_id, game_id);
    fish_total = await get_fish_total(game_id);

    // 檢查海洋魚量
    if (fish_total > 0) {
        // decision1 = 捕魚
        if (decision == 1) {
            // 檢查捕魚數量
            if (fish_delta <= max_buy_fish) {
                // 插入購買紀錄
                mysqlPoolQuery('INSERT INTO group_fish_record SET group_id=?, round = ? ,decision = 1,fish_delta = ?, game_id=?', [group_id, round, fish_delta, game_id], function(err, result) {
                    if (err) {
                        console.log('-----插入購買記錄失敗-----');
                        console.log(err);
                        return err;
                    } else {
                        console.log('-----插入購買記錄成功-----');
                        // 更新group_info中組內魚數量
                        mysqlPoolQuery('UPDATE group_info SET fish_count = fish_count+?, status = 0 WHERE group_id = ?', [fish_delta, group_id], function(err, result) {
                            if (err) {
                                console.log('-----更新魚數失敗-----');
                                console.log(err);
                                return err;
                            } else {
                                console.log('-----更新魚數成功-----');
                                // 更新魚池數目
                                mysqlPoolQuery('UPDATE ocean SET fish_total = fish_total-? WHERE game_id = ?', [fish_delta, game_id], function(err, result) {
                                    if (err) {
                                        console.log('-----更新魚池總數失敗-----');
                                        console.log(err);
                                        return err;
                                    } else {
                                        dock_fee(group_id,game_id);
                                        console.log('-----更新魚池總數成功-----');
                                        return res.status(200).json({ success: true, message: "" })
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: "捕魚超出可補上限，請購買船隻" });
            }
        }
        // decision2 = 休息
        else if (decision == 2) {
            mysqlPoolQuery('INSERT INTO group_fish_record SET group_id=?, round = ? ,decision = 2, game_id = ?', [group_id, round, game_id], function(err, result) {
                if (err) {
                    console.log('-----紀錄休息失敗-----');
                    console.log(err);
                    return res.status(500).json({ success: false, message: err });
                } else {
                    console.log('-----紀錄休息成功-----');
                    json_data = JSON.parse(JSON.stringify(result));
                    update_status(group_id);
                    dock_fee(group_id,game_id);
                    return res.status(200).json({ success: true, message: "" });
                }
            });
        }

        // decision3 = 回饋海洋
        else if (decision == 3) {
            // 檢查回饋數量
            if (fish_count - fish_delta >= 0) {
                // 插入回饋紀錄
                mysqlPoolQuery('INSERT INTO group_fish_record SET group_id=?, round = ? ,decision = 3,fish_delta = ?, game_id = ?', [group_id, round, fish_delta, game_id], function(err, result) {
                    if (err) {
                        console.log('-----插入回饋記錄失敗-----');
                        console.log(err);
                        return err;
                    } else {
                        console.log('-----插入回饋記錄成功-----');
                        // 更新group_info中組內魚數量
                        mysqlPoolQuery('UPDATE group_info SET fish_count = fish_count - ? , status = 0 WHERE group_id = ?', [fish_delta, group_id], function(err, result) {
                            if (err) {
                                console.log('-----更新魚數失敗-----');
                                console.log(err);
                                return err;
                            } else {
                                console.log('-----更新魚數成功-----');
                                // 更新魚池數目
                                mysqlPoolQuery('UPDATE ocean SET fish_total = fish_total + ? WHERE game_id = ?', [fish_delta, game_id], function(err, result) {
                                    if (err) {
                                        console.log('-----更新魚池總數失敗-----');
                                        console.log(err);
                                        return err;
                                    } else {
                                        console.log('-----更新魚池總數成功-----');
                                        dock_fee(group_id,game_id);
                                        return res.status(200).json({ success: true, message: "" })
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: "沒有這麼多魚可以回饋唷!" });
            }


        }
    } else {
        return res.status(400).json({ success: false, message: "海洋沒魚了QQ" })
    }

})

router.get('/check_all_status',function(req, res,next){
    game_id = req.query.game_id;
    mysqlPoolQuery('SELECT group_id, status FROM group_info WHERE game_id = ?', [game_id], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
        } else {
            console.log("讀取資料庫成功")
            json_data = JSON.parse(JSON.stringify(result));
            // 回傳json
            return res.status(200).json({ success: true, message: json_data });
        }
    });
})

router.get('/check_rest_fish', function(req, res, next) {
    //get的狀況form裡面的值要從query撈
    game_id = req.query.game_id;
    mysqlPoolQuery('SELECT fish_total FROM ocean WHERE game_id = ?', [game_id], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
        } else {
            console.log("讀取資料庫成功")
            json_data = JSON.parse(JSON.stringify(result));
            // 回傳json
            return res.status(200).json({ success: true, message: json_data[0] });
        }
    });
});

router.get('/get_group_info', async function(req, res, next) {
    let group_id = req.query.group_id;
    let game_id = req.query.game_id;
    let round, fish_count, ship_count;
    console.log(group_id, game_id);

    function getCountPromise(group_id) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT fish_count, ship_count FROM group_info WHERE group_id = ?', [group_id], function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                    return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
                } else {
                    if (result.length) {
                        console.log("讀取資料庫成功");
                        json_data = JSON.parse(JSON.stringify(result));
                        // 處理回傳格式
                        fish_count = json_data[0].fish_count;
                        ship_count = json_data[0].ship_count;
                        console.log(json_data[0]);
                        resolve(json_data[0]);
                    } else {
                        return res.status(400).json({ success: false, message: `查無group_id: ${group_id}資料` });
                    }
                }
            });
        })
    }

    function getRoundPromise(game_id) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT round FROM ocean WHERE game_id = ?', [game_id], function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                    return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
                } else {
                    if (result.length) {
                        console.log("讀取資料庫成功");
                        json_data = JSON.parse(JSON.stringify(result));
                        // 處理回傳格式
                        console.log(json_data[0]);
                        round = json_data[0].round;
                        resolve(json_data[0]);
                    } else {
                        return res.status(400).json({ success: false, message: `查無game_id: ${game_id}資料` });
                    }
                }
            });
        })
    }
    try {
        await getCountPromise(group_id);
        await getRoundPromise(game_id);

        return res.status(200)
            .json({
                success: true,
                message: {
                    'round': round,
                    'fish_count': fish_count,
                    'ship_count': ship_count
                }
            })
    } catch (error) {
        return res.status(400).json({ success: false, message: error });
    }
})

router.get('/check_status', function(req, res, next) {
    var game_id = req.query.game_id;
    var group_id = req.query.group_id;

    mysqlPoolQuery('SELECT status FROM group_info WHERE group_id = ? AND game_id = ?', [group_id, game_id], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "資料庫讀取失敗:\n" });
        } else {
            if (result.length) {
                console.log("讀取資料庫成功");
                json_data = JSON.parse(JSON.stringify(result));
                _status = json_data[0].status;
                return res.status(200).json({ success: true, message: _status });
            } else {
                return res.status(400).json({ success: false, message: `查無${group_id}資料` });
            }
        }
    });
})



module.exports = router;