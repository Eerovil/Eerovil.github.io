declare const $;



function find() {
    var textToFind : string = $("#textToFind").val();
    var needleArr : string[] = escapeHtml(textToFind.toLowerCase().replace(" ","").split(""));
    var textArr : string[] = escapeHtml($("#textbox").val().split(""));
    console.log(textArr)
    var result : string = "<span class='whitetext'>";
    var counter : number = 0;
    for (var char of textArr) {
        if (char === needleArr[counter]) {
            result += "</span><span class='greentext'>" + char + "</span><span class='whitetext'>";
            counter++;
        } else {
            result += char;
        }
    }
    result += "</span>"
    console.log(result)
    if (counter >= needleArr.length) {
        $("#result").html(result)
    } else {
        console.log("Did not find result")
        $("#result").html(result)
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

function escapeHtml (arr : string[]) {
    let ret : string[] = []; 
    for (let char of arr) {
        ret.push(char.replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        }));
    }
    return ret;
}