
function getHash(string) {
    let salt = 'af0ik392jrmt0nsfdghy0'
    let charaters = string.split();
    charaters.sort();
    let sortedCharaters = charaters.join();
    return CryptoJS.MD5(sortedCharaters + salt);
}

function setText(obj){
    if (typeof(obj) === "string") {
        $("#textbox").val(obj);
    } else {
        $("#textbox").val(JSON.stringify(obj));
    }
}

function enableButtons(action) {
    if (action === "decode") {
        $("#encodenew").removeAttr("disabled")
        $("#encodeold").removeAttr("disabled")
        $("#wipe").removeAttr("disabled")
        $("#convert").removeAttr("disabled")

        $("#decode").attr("disabled","true")
    }
    if (action === "encode") {
        $("#encodenew").attr("disabled","true")
        $("#encodeold").attr("disabled","true")
        $("#wipe").attr("disabled","true")
        $("#convert").attr("disabled","true")

        $("#decode").removeAttr("disabled")
    }
    if (action === "wipe") {
        $("#wipe").attr("disabled","true")
    }
}

function decodeOld(data) {
    let result = data.split("Fe12NAfA3R6z4k0z");
    let txt = "";
    for (var i = 0; i < result[0].length; i += 2)
        txt += result[0][i];
    data = JSON.parse(atob(txt));
    //console.log("Decoded(o): " , data);
    return data
}

function decodeNew(data) {
    let result = data.slice(32)
    data = pako.inflate(atob(result), {to: 'string' });
    data = JSON.parse(data);
    //console.log("Decoded(n): " , data);
    return data;

}

function encodeOld() {
    data = $("#textbox").val();
    if (!JSON.parse(data).hasOwnProperty("totalGold")) {
        console.error("Not a JSON object");
        return;
    }
    //data = JSON.stringify(data);

    let letters = "0123456789abcdefghijklmnopqrstuvwxyz"
    let newdata = btoa(data);
    let newsprinkle = "";
    for (var x = 0; x < newdata.length; x++) {
        newsprinkle += newdata[x] + letters[Math.floor(Math.random() * letters.length)];
    }
    console.log(newsprinkle.length);
    let encoded = newsprinkle + "Fe12NAfA3R6z4k0z" + getHash(newdata);
    setText(encoded);
    enableButtons("encode")
}

function encodeNew() {
    data = $("#textbox").val();
    if (!JSON.parse(data).hasOwnProperty("totalGold")) {
        console.error("Not a JSON object");
        return;
    }
    //console.log("Encoded(n): " , data);
    let hash = "7a990d405d2c6fb93aa8fbb0ec1a3b23";
    //data = JSON.stringify(data);
    let encodedData = pako.deflate(data, {to: 'string', level:9});

    setText(hash + btoa(encodedData));
    enableButtons("encode")
}


function decode() {
    data = $("#textbox").val();
    let newdata;
    if (data.indexOf("Fe12NAfA3R6z4k0z") == -1) {
        console.log("New encoding detected")
        newdata = decodeNew(data);
    } else {
        console.log("Old encoding detected")
        newdata = decodeOld(data);
    }
    setText(newdata);
    detectinput()
}

function convertSave() {
    text = $("#textbox").val();
    data = JSON.parse(text);

    if (data.saveOrigin === "mobile") {
        data.rubies = Math.floor(data.rubies / 10)
        data.saveOrigin = "pc"
        $("#convert").attr('value', 'Convert to mobile')
    } else {
        data.rubies = data.rubies * 10
        data.saveOrigin = "mobile"
        $("#convert").attr('value', 'Convert to pc')
    }
    $("#textbox").val(JSON.stringify(data));
}

function detectinput() {
    text = $("#textbox").val();
    try {
        data = JSON.parse(text)
        if (data.hasOwnProperty("totalGold")) {
            console.log("Detected decoded save");
            enableButtons("decode")
            if (data.saveOrigin === "mobile") {
                $("#convert").attr('value', 'Convert to pc')
            } else {
                $("#convert").attr('value', 'Convert to mobile')
            }
            return;
        }
    } catch (Exception) {
        console.log("Detected decoded save")
        enableButtons("encode")
    }
    
        
    
}

function wipeClan() {
    data = JSON.parse($("#textbox").val());
    data.type = "kappa";
    data.email = "";
    data.passwordHash = "";
    data.prevLoginTimestamp = 0;
    data.account = null;
    data.accountId = 0;
    data.loginValidated = "false";
    data.uniqueId = "";
    data.type = undefined;
    delete data.type;
    //console.log(`Wiped:` , data);
    setText(data)
    enableButtons("wipe")

}
