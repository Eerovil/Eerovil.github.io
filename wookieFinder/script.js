function find() {
    var textToFind = $("#textToFind").val();
    var needleArr = escapeHtml(textToFind.toLowerCase().replace(" ", "").split(""));
    var textArr = escapeHtml($("#textbox").val().split(""));
    console.log(textArr);
    var result = "<span class='whitetext'>";
    var counter = 0;
    for (var _i = 0, textArr_1 = textArr; _i < textArr_1.length; _i++) {
        var char = textArr_1[_i];
        if (char === needleArr[counter]) {
            result += "</span><span class='greentext'>" + char + "</span><span class='whitetext'>";
            counter++;
        }
        else {
            result += char;
        }
    }
    result += "</span>";
    console.log(result);
    if (counter >= needleArr.length) {
        $("#result").html(result);
    }
    else {
        console.log("Did not find result");
        $("#result").html(result);
    }
}
var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};
function escapeHtml(arr) {
    var ret = [];
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var char = arr_1[_i];
        ret.push(char.replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        }));
    }
    return ret;
}
