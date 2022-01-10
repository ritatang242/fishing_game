//root_url = "http://localhost:3000";
//root_url = 'http://140.119.19.122:3000'
//root_url = "gamefishing.heroku.com"
function bind_url(api_url, data, method) {
    let param_url =  api_url;
    if (method == 'POST') {
        let param = '';
        for (const [key, value] of Object.entries(data)) {
            param = param + '&' + key + '=' + value
        }
        //POST回傳兩個值
        let result_ls = [param_url, param];
        return (result_ls);
    } else if (method == 'GET') {
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
            if (count == 0) {
                param_url = param_url + '?' + key + '=' + value
            } else {
                param_url = param_url + '&' + key + '=' + value
            }
            count = count + 1;
        }
        //GET回傳兩個值
        return (param_url);
    }
}

function register() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    let group_id = document.getElementById('GroupName').value;
    console.log(group_id);
    let game_id = document.getElementById("RoomID").value;
    console.log(game_id);
    let api_url = "/client/register";
    let data = { 'group_id': group_id, 'game_id': game_id };
    let result_ls = bind_url(api_url, data, 'POST');
    let url = result_ls[0]
    let param = result_ls[1]
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(param);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            window.location = 'Client_Home_Action.html';
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
}

function getgroupinfo() {

    var v1 = sessionStorage.getItem('gn')
    var v2 = sessionStorage.getItem('room')
    console.log(v1 + " " + v2)
    var req = new XMLHttpRequest();
    let api_url = "/client/get_group_info";
    let data = { 'group_id': v1, 'game_id': v2 };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            fish_count = round = rep["message"]["fish_count"];
            round = rep["message"]["round"];
            ship_count = rep["message"]["ship_count"];
            console.log("漁獲量 : " + fish_count + " 回合 : " + round + " 船 : " + ship_count);
            document.getElementById('fishes').innerHTML = fish_count;
            document.getElementById('ships').innerHTML = ship_count;
            document.getElementById('rounds').innerHTML = round;
            document.getElementById('grounpname').innerHTML = v1;
            sessionStorage.setItem('round', round);
            sessionStorage.setItem('ship_count', ship_count);
            sessionStorage.setItem('fish_count', fish_count);
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}




function open_game() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    let group_number = sessionStorage.getItem('gn');
    console.log("我有拿到" + group_number);
    //var params = 'group_number='+group_number;
    var req = new XMLHttpRequest();
    let api_url = "/admin/open_game";
    let data = { 'num_of_group': group_number };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        reqdata = JSON.parse(req.responseText);
        if (reqdata["success"] == true) {
            sessionStorage.setItem('game_id', reqdata['message']);
            window.location.href =  "/ready_1.html";
            //game_id = round = reqdata["message"]["game_id"];
            //console.log("game_id:"+ game_id);
            // document.getElementById('fishes').innerHTML =fish_count;
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}

function get_all_group() {
    var v1 = sessionStorage.getItem('game_id');
    console.log("game_id"+v1);
    document.getElementById('game_id').innerHTML = v1;
    var req = new XMLHttpRequest();
    let api_url = "/client/get_all_group";
    let data = { 'game_id': v1 };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        console.log(Object.values(rep));
        console.log(rep["message"]);
        let name = document.getElementById('output');
        if (rep["success"] == true) {
            for (let i = 0; i < 8; i++) {
                if (document.getElementById('array' + [i + 1]).innerHTML == undefined) {
                    document.getElementById('array' + [i + 1]).innerHTML == " ";
                }
                else {
                    var group_list = rep["message"][i];
                    document.getElementById('array' + [i + 1]).innerHTML = group_list;
                }
            }
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}


function check_rank() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    let game_id = sessionStorage.getItem('game_id');
    console.log(game_id);
    var params = 'game_id=' + game_id;
    var req = new XMLHttpRequest();
    let api_url = "/admin/check_rank";
    let data = { 'game_id': game_id };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        console.log(rep["message"]);
        if (rep["success"] == true) {
            rank_json = rep["message"]
            for (let i = 1; i <= rank_json.length; i++) {
                console.log(i);
                document.getElementById('array' + i).innerHTML = rank_json[i - 1];
                console.log(rank_json[i]);
            };

        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}

function show_result() {
    // start
    let game_id = sessionStorage.getItem('game_id');
    console.log(game_id);
    var params = 'game_id=' + game_id;
    var req = new XMLHttpRequest();
    let api_url = "/admin/check_rank";
    let data = { 'game_id': game_id };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        console.log(rep["message"]);
        if (rep["success"] == true) {
            rank_json = rep["message"]
            for (let i = 1; i <= 3; i++) {
                console.log(i);
                document.getElementById('array' + i).innerHTML = rank_json[i - 1];
                console.log(rank_json[i]);
            };

        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}

function checkstatus() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    //這裡是call檢查狀態的api
    //回傳1或是0
    var v1 = sessionStorage.getItem('gn')
    var v2 = sessionStorage.getItem('room')
    console.log(v1 + " " + v2)
    var req = new XMLHttpRequest();
    let api_url = "/client/check_status";
    var group_id = v1;
    var game_id = v2;
    let data = { 'group_id': group_id, 'game_id': game_id };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        reqdata = JSON.parse(req.responseText);
        console.log(reqdata);
        if (reqdata["success"] == true) {
            //1跳頁
            if (reqdata["message"] == 1) {
                console.log("跳轉頁面");
                window.location.href = 'Client_Home.html';
            } else {
                console.log("OOPS等大家");
                $("#readytowait").modal().show();
            }
        }
    }
    req.send();
    //1跳client home
    //0跳modal
}

function catchfish() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    var group_id = sessionStorage.getItem('gn');
    var game_id = sessionStorage.getItem('room');
    var round = sessionStorage.getItem('round');;
    var select = document.getElementById('yourdecision');
    var decision = select.options[select.selectedIndex].value;
    //var maxbuyfish = 5;
    var maxbuyfish = sessionStorage.getItem('max_buy_fish');
    document.getElementById('fishdelta').max = maxbuyfish;
    console.log("抓到決策了沒啦" + decision);
    console.log(typeof decision);
    if (decision == "1") {
        var fishdelta = document.getElementById('fishdelta').value;
        console.log("抓魚看看" + decision);
    } else {
        if (decision == "3") {
            var fishdelta = document.getElementById('letfishbacknum').value;
            //var maxbuyfish = 0;
            console.log("放生看看" + decision);
        } else {
            var fishdelta = 0;
            var maxbuyfish = 0;
            console.log("休息看看" + decision);
        }
    }
    console.log("組名" + group_id + " 房間" + game_id + "回合 " + round + " 決策" + decision + "捕魚或放魚" + fishdelta)
    var req = new XMLHttpRequest();
    let api_url = "/client/catch_fish";
    let data = { 'group_id': group_id, 'game_id': game_id, 'round': round, 'decision': decision, 'fish_delta': fishdelta, 'max_buy_fish': maxbuyfish };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        reqdata = JSON.parse(req.responseText);
        console.log(reqdata);
        if (reqdata["success"] == true) {
            console.log("跳轉頁面囉");
            path = 'Client_Home_Action.html'
            window.location.replace(path);
        } else {
            alert(reqdata["message"]);
        }
    }
    req.send();
}

function check_buy_ship() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    var v1 = sessionStorage.getItem('gn')
    var v2 = sessionStorage.getItem('room')
    console.log(v1 + " " + v2)
    var req = new XMLHttpRequest();
    let api_url = "/client/check_buy_ship";
    let data = { 'group_id': v1, 'game_id': v2 };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        console.log(rep);
        if (rep["success"] == true) {
            //可以買船
            if (rep["message"]["check_buy_ship"] == 1) {
                $("#buyship").modal().show();
            }
            //不能買船
            else if (rep["message"]["check_buy_ship"] == 0) {
                document.getElementById("checkbox_fish").disabled = true;
                alert('您目前不能買船，請直接按Next Step!')
                $("#buyship").modal().show();
            }
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}

function check_max_fish() {
    var v1 = sessionStorage.getItem('gn')
    var v2 = sessionStorage.getItem('room')
    var v3 = sessionStorage.getItem('round');
    var v4 = sessionStorage.getItem('ship_count');
    let checked = $('#checkbox_fish').is(':checked');
    if (checked) {
        checked = 1;
    } else {
        checked = 0;
    }
    let api_url = "/client/buy_ship";
    let data = { 'group_id': v1, 'game_id': v2, 'round': v3, 'buy_or_not': checked, 'ship_count': v4 };
    let result_ls = bind_url(api_url, data, 'POST');
    let url = result_ls[0]
    let param = result_ls[1]
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(param);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            let max_buy_fish = rep["message"];
            sessionStorage.setItem('max_buy_fish', max_buy_fish);
            $("#decision").modal().show();
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
}

function breeding() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    let game_id = sessionStorage.getItem('game_id')
    console.log('game_id', game_id);
    var req = new XMLHttpRequest();
    let api_url = "/admin/breeding";
    let data = { 'game_id': game_id };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            console.log("breeding success");
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();

    // 讓round++
    let round = parseInt(document.getElementById('round').value);
    console.log(round);
    document.getElementById('round').innerHTML = round + 1;

    // change group status
    change_group_status(game_id);
}

function change_group_status(game_id) {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    let api_url = "/admin/change_group_status";
    console.log(api_url);
    let data = { 'game_id': game_id };
    let result_ls = bind_url(api_url, data, 'POST');
    let url = result_ls[0]
    let param = result_ls[1]
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(param)
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            console.log("change group status success");
        } else if (rep["success"] == false) {
            alert(rep['message'])
        }
    }
}

function end_game() {
    // 按鈕音效
    document.getElementById('click_sound').play();
    // start
    var v1 = sessionStorage.getItem('game_id')
    var req = new XMLHttpRequest();
    let api_url = "/admin/end_game";
    let data = { 'game_id': v1 };
    let url = bind_url(api_url, data, 'GET');
    req.open("GET", url);
    console.log(req.status);
    req.onload = function() {
        rep = JSON.parse(req.responseText);
        if (rep["success"] == true) {
            if (rep["message"] == 1) {
                console.log("還有魚，顯示排名");
                window.location.href = 'final.html';
            } else if (rep["message"] == 0) {
                console.log("沒魚了，輸爆");
                window.location.href = 'gameover.html'
            }
        } else if (rep["success"] == false) {
            alert(rep['message']);
        }
    }
    req.send();
}