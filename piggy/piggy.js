function piggy(s) {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var volatile = 3;
    var speed = Math.floor(s) || 5;
    var node = document.createElement('span');
    var body = document.body;
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight);
    var pig = [" ,,_\no\"  )~\n ''''", " ,,_\no\"  )~\n \" ''", " ,,_\no\"  )~\n '' \""];
    node.textContent = pig[0];
    node.style.position = 'absolute';
    node.style.whiteSpace = 'pre';
    node.style.fontFamily = 'monospace';
    body.appendChild(node);
    var l = w - node.clientWidth - volatile;
    var t = h - node.clientHeight - volatile;
    node.style.left = l + 'px';
    node.style.top = t + 'px';
    var i = 0;
    var pl = l;
    var pt = t;
    var timer = setInterval(function() {
        node.textContent = pig[i];
        pt = t + getRandomInt(-1*volatile, volatile);
        node.style.left = pl + 'px';
        node.style.top = pt + 'px';
        i++;
        pl = pl - speed;
        if(i >= pig.length) i = 0;
        if(pl < -100) {
            clearInterval(timer);
            body.removeChild(node);
        }
    }, 300);
}
