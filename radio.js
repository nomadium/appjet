/* appjet:version 0.1 */

import("storage");

function notFound() {
    response.setStatusCode(404);
    printp("Adresse/URL nicht gefunden!");
}

function serveFile() {
    var file = storage.files.filter({name:request.params.file}).first();
    if (!file) {
        not_found();
        response.stop(true);
    }
    
    response.setContentType(file.mimetype);
    response.setCacheable(true);
    page.setMode('plain');
    response.write(file.data);
}

function showPlayer() {
    page.head.write('<script type="text/javascript" src="http://radio.appjet.net/?file=audio-player.js"></script>');
    page.head.write('<script type="text/javascript">AudioPlayer.setup("http://radio.appjet.net/?file=player.swf", { width: 290 });</script>');        
    
    print(html("""
    <p id="audioplayer_1">Alternative content</p>
    <script type="text/javascript">  
        AudioPlayer.embed("audioplayer_1", {soundFile: "http://radio.appjet.net/?file=02_interpol_-_obstacle_1.mp3"});  
    </script>
    """));
}

function get_main() {
    if (!request.query) {
        showPlayer();
        response.stop(true);
    }
    
    if (!request.params.file) {
        not_found();
        response.stop(true);
    }
    
    serveFile();
}

dispatch({custom404:notFound});
