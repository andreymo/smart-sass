
var DataMock = {};

DataMock.sourceDir = ["aaa", "_a1", "_a2", "_a3", "_a4", "bbb", "_b", "ccc"];
DataMock["cacheDir/sourceDir"] = ["aaa", "bbb"];
DataMock["targetDir/sourceDir"] = ["aaa", "ccc"];

DataMock["sourceDir/aaa"] = "@import 'a1';\n" +
    "@import 'a2', 'a3';\n" +
    ".message {\n" +
    "  border: 1px solid #ccc;\n" +
    "  padding: 10px;\n" +
    "  color: #333;\n" +
    "}" +
    ".success {\n" +
    "  @extend .message;\n" +
    "  border-color: green;\n" +
    "}\n" +
    ".error {\n" +
    "  @extend .message;\n" +
    "  border-color: red;\n" +
    "}\n";

DataMock["sourceDir/a1"] = "html,body,ul,ol {\n" +
    "   margin: 0;\n" +
    "  padding: 0;\n" +
    "}\n";

DataMock["sourceDir/a2"] = ".container {\n" +
"  width: 100%;\n" +
"}\n";

DataMock["sourceDir/a3"] = "@import 'a4';\n" +
".warning {\n" +
"  border-color: yellow;\n" +
"}\n";

DataMock["sourceDir/a4"] = "article[role='main'] {\n" +
"  float: left;\n" +
"  width: 600px / 960px * 100%;\n" +
"}\n";

module.exports = DataMock;