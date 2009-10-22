/* appjet:version 0.1 */
/* author: Miguel Landaeta <wortschatz@miguel.cc> */

import("storage");

function getNoun(database) {
    if (!storage.recentwords) {
        storage.recentwords = new StorableCollection();
    }
    do {
        var random = Math.floor(database.size() * Math.random());
    } while (storage.recentwords.filter({index:random}).size() != 0);
    if (storage.recentwords.size() == 50) {
        storage.recentwords.remove(storage.recentwords.first());
    }
    storage.recentwords.add({index:random});
    return database.skip(random).first();
}

function get_main() {
    var noun = getNoun(storage.nouns);
    printp(DIV({className:"title"}, title));
    switch (noun.gender) {
        case "n": printp(DIV({className:"noun",id:"neuter"},    "das "+noun.word)); break;
        case "m": printp(DIV({className:"noun",id:"masculine"}, "der "+noun.word)); break;
        case "f": printp(DIV({className:"noun",id:"feminine"},  "die "+noun.word)); break;
        case "-": printp(DIV({className:"noun",id:"neuter"},           noun.word)); break;
        default:
    }
    switch (noun.plural) {
        case "-": printp(DIV({className:"plural"}, "  (ohne Plural!)")); break;
        default:  printp(DIV({className:"plural"}, "  (pl. "+noun.plural+")"));
    }
    printp(A({href:"javascript:reload();"},"ein anderes Nomen!"));
}

function get_backup() {
    response.setContentType("text/plain");
    page.setMode('plain');
    function dumpNoun(noun) {
        response.write(noun.gender+"|"+noun.word+"|"+noun.plural+"\n");
    }
    storage.nouns.forEach(dumpNoun);
}

function get_populate() {
    printp(DIV({className:"title"}, title));
    printp(FORM({action:"/populate",method:"post",enctype:"multipart/form-data"},
                INPUT({type:"file", name:"file", id:"file"}),
                INPUT({type:"submit", value:"Upload", name:"submit"})));
}

function post_populate() {
    if (!storage.dbfile) {
        storage.dbfile = new StorableCollection();
    }
    var dbfile = appjet._native.request_uploadedFile("file");
    storage.dbfile = dbfile;
    printp(DIV({className:"title"}, title));
    var nouns = storage.dbfile.fileContents.split("\n");
    while (nouns.length > 0) {
        var noun = nouns.pop();
        if (noun == "") { continue; } // change this stuff with regex
        var parts = noun.split("|");
        storage.proposednouns.add(new StorableObject({gender:parts[0], word:parts[1], plural:parts[2]}));
    }
    storage.dbfile = null;
    response.redirect("/");
    storage.dbfile = null;
}

/* not implemented 
function get_addword() {
    printp(DIV({className:"title"}, title));
    printp(FORM({action:"/addword",method:"post",enctype:"multipart/form-data"},
                INPUT({type:"file", name:"file", id:"file"}),
                INPUT({type:"submit", value:"Upload", name:"submit"})));
}
*/

function getPlural(noun) {
    switch (noun.plural) {
        case "-": return "(ohne Plural!)"; break;
        default:  return "(pl. "+noun.plural+")"; break;
    }
}

function get_recentwords() {
    printp(DIV({className:"title"}, title));
    storage.recentwords.forEach(function dump(recentword) {
        var noun = storage.nouns.skip(recentword.index).first();
        switch (noun.gender) {
            case "m": printp(SPAN({className:"blue"},  "der "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "f": printp(SPAN({className:"red"},   "die "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "n": printp(SPAN({className:"green"}, "das "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "-": printp(SPAN({className:"green"},        noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            
            default:                 
        }
    });
}

function get_allwords() {
    printp(DIV({className:"title"}, title));
    storage.nouns.sortBy("word").forEach(function dump(noun) {
        switch (noun.gender) {
            case "m": printp(SPAN({className:"blue"},  "der "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "f": printp(SPAN({className:"red"},   "die "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "n": printp(SPAN({className:"green"}, "das "+noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;
            case "-": printp(SPAN({className:"green"},        noun.word),
                             SPAN({className:"orange"}," "+getPlural(noun))); break;            
            default:
        }
    });
}

function get_clean() {
    printp(DIV({className:"title"}, title));
    printp(FORM({name:"clean",action:"/clean",method:"post",enctype:"multipart/form-data"},
                INPUT({type:"checkbox", name:"delete"}),
                "Do you really want to delete the word database? ",
                INPUT({type:"submit", value:"submit"})));
}

function post_clean() {
    var disabled = new Boolean(true);
    printp(DIV({className:"title"}, title));
    if (request.params["delete"] == "on") {
        if (disabled) {
            print("Hey! Why do you want to delete the database?\n");
            print("Learn german is cool!");
        } else {
            //storage.nouns.remove({});
            print("Hey! You just deleted all the words!\n");
            print("You better ");
            print(link("/populate","populate"));
            print(" the database!");
        }
    } else {
        response.redirect("/");
    }
}

function unknown() {
    response.setStatusCode(404);
    printp(DIV({className:"title"}, title));
    printp("Adresse/URL nicht gefunden!");
}

if (!storage.nouns) {
    storage.nouns = new StorableCollection();
}
if (!storage.proposednouns) {
    storage.proposednouns = new StorableCollection();
}

var title = "Der Wortschatz";
var favicon = "http://radio.appjet.net/?file=wortschatz_favicon.ico";
page.setFavicon(favicon);
dispatch({custom404:unknown});

/* appjet:client */
function reload() {
    window.location.href = window.location.href;
}

/* appjet:css */
body    { font-family: Georgia, Verdana, serif; }
.title  { font-weight: bold; font-size: 200%;   }
#masculine, #feminine, #neuter { font-size: 400%; }
.blue, #masculine { color: blue;    font-weight: bold; }
.green, #neuter   { color: green;   font-weight: bold; }
.red, #feminine   { color: red;     font-weight: bold; }
.orange, .plural  { color: #ec7000; font-weight: bold; }
.plural { font-size: 200%; }